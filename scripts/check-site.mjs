#!/usr/bin/env node
/**
 * Suíte de verificação do site.
 *
 *   npm run check              # sobe o dev server sozinho e testa
 *   npm run check -- --url ... # testa uma URL já no ar
 *   npm run check -- --shots   # salva capturas em .checks/
 *
 * Sai com código 1 se qualquer verificação falhar, então serve no CI.
 */
import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { mkdirSync, globSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { setTimeout as sleep } from "node:timers/promises"

import { checkViewports } from "./checks/viewport.mjs"
import { checkContrast } from "./checks/contrast.mjs"
import { checkContrastePintado } from "./checks/contraste-pintado.mjs"
import { checkOrderFlow } from "./checks/order-flow.mjs"
import { checkA11y } from "./checks/a11y.mjs"
import { checkPerformance } from "./checks/performance.mjs"
import { checkNoJs } from "./checks/no-js.mjs"
import { checkMidia } from "./checks/midia.mjs"
import { checkScrub } from "./checks/scrub.mjs"

const args = process.argv.slice(2)
const urlArg = args.indexOf("--url")
const wantShots = args.includes("--shots")
const providedUrl = urlArg !== -1 ? args[urlArg + 1] : null

const SHOT_DIR = ".checks"
if (wantShots) mkdirSync(SHOT_DIR, { recursive: true })

/**
 * Sobe `next dev` e espera responder.
 *
 * A porta sai da saída do próprio servidor em vez de ser fixada em 3000: se algo
 * já estiver ocupando a porta, o Next escolhe outra em silêncio e a suíte iria
 * testar um endereço morto.
 */
async function startDevServer() {
  /*
   * `detached` cria um grupo de processos próprio. Sem isso, matar o npm no fim
   * deixa o next-server filho vivo segurando a porta, e a rodada seguinte sobe
   * noutra porta ou não sobe — foi exatamente o que aconteceu aqui.
   */
  /*
   * Chama o binário local do Next pelo Node, e não `npm run dev`.
   *
   * `spawn("npm", ...)` morre no Windows com ENOENT: lá o npm é `npm.cmd`, e o
   * `spawn` do Node só resolve extensão do PATHEXT com `shell: true`. O CI roda
   * em ubuntu, onde `npm` é executável direto — então a suíte inteira ficava
   * quebrada só na máquina de quem desenvolve, que é justamente onde ela
   * precisa rodar antes de abrir PR.
   *
   * `shell: true` resolveria o ENOENT e traria problema pior: o cmd.exe entra
   * como intermediário, e matar o shell deixa o next-server vivo segurando a
   * porta. Chamando o binário direto, o next-server é filho de primeiro grau e
   * o `proc.kill()` do encerramento alcança ele sem depender de grupo de
   * processos, que o Windows não tem do mesmo jeito.
   */
  const binarioNext = fileURLToPath(
    new URL("../node_modules/next/dist/bin/next", import.meta.url),
  )

  const proc = spawn(process.execPath, [binarioNext, "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
    /*
     * Liga o registro na planilha para o teste poder conferir o que o site
     * envia. A URL é falsa e o `sendBeacon` é substituído no navegador, então
     * nada sai da máquina — o que se verifica aqui é o conteúdo do envio, que é
     * onde dá para errar (mandar preço, esquecer o SKU, perder os sabores).
     */
    env: {
      ...process.env,
      NEXT_PUBLIC_REGISTRO_URL: "https://exemplo.invalido/registro",
      NEXT_PUBLIC_REGISTRO_TOKEN: "token-de-teste",
    },
  })

  let url = null
  const readPort = (chunk) => {
    const match = String(chunk).match(/http:\/\/localhost:(\d+)/)
    if (match && !url) url = `http://localhost:${match[1]}`
  }
  proc.stdout.on("data", readPort)
  proc.stderr.on("data", readPort)

  for (let attempt = 0; attempt < 120; attempt++) {
    if (url) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(1000) })
        if (res.ok) return { proc, url }
      } catch {
        // ainda compilando a primeira página
      }
    }
    await sleep(500)
  }

  stopDevServer(proc)
  throw new Error(
    url ? `o dev server em ${url} não respondeu a tempo` : "o dev server não anunciou porta"
  )
}

/** Derruba o grupo de processos inteiro (npm + next-server + workers). */
function stopDevServer(proc) {
  if (!proc?.pid) return
  try {
    process.kill(-proc.pid, "SIGTERM")
  } catch {
    // já morreu, ou o SO não suporta grupo — tenta o processo direto
    try {
      proc.kill("SIGTERM")
    } catch {
      // nada a fazer
    }
  }
}

/**
 * Chromium do ambiente, e o pré-instalado das imagens de CI como reserva.
 *
 * A reserva procura o binário em vez de apontar para um caminho fixo: a imagem
 * traz o Chromium numa pasta com o número da build (`chromium-1194/`), e quando
 * esse número não bate com o que o Playwright instalado espera, o primeiro
 * `launch` falha. Apontar para a pasta pai não resolvia — é diretório, não
 * executável, e a suíte inteira ficava sem como rodar fora do CI.
 */
async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch (erro) {
    const achados = globSync("/opt/pw-browsers/chromium*/chrome-linux/chrome")
    if (achados.length === 0) throw erro
    return await chromium.launch({ executablePath: achados[0] })
  }
}

let server = null
let browser = null
let exitCode = 0

try {
  const target = providedUrl ?? (server = await startDevServer()).url

  /*
   * Conferência rápida antes de qualquer teste.
   *
   * Existe porque errei isso duas vezes: rodei a suíte contra um servidor que
   * servia um build antigo, e contra um `next start` apontado para um export
   * estático (que devolve 500 em todo recurso). Nos dois casos os resultados
   * pareciam falhas do site, e o tempo foi para caçar bug em código correto.
   * Falhar aqui, alto e claro, custa dois segundos e evita esse desperdício.
   */
  const resposta = await fetch(target, { signal: AbortSignal.timeout(10000) })
  if (!resposta.ok) {
    throw new Error(
      `o servidor em ${target} respondeu ${resposta.status}. ` +
        "Se acabou de rodar um build com GITHUB_PAGES=true, refaça com `npm run build` " +
        "antes de usar `next start` — o export estático não é servível por ele."
    )
  }
  const html = await resposta.text()
  if (!html.includes("Don Enrico")) {
    throw new Error(`o servidor em ${target} respondeu 200 mas sem o conteúdo do site`)
  }
  // O Next injeta as devtools só em desenvolvimento; é o sinal mais direto.
  const isDev = html.includes("next-devtools") || html.includes("__nextjs")

  browser = await launchBrowser()

  const suites = [
    ["Responsividade e console", () => checkViewports(browser, target, { screenshotDir: wantShots ? SHOT_DIR : null })],
    ["Fluxo do pedido", () => checkOrderFlow(browser, target, { screenshotDir: wantShots ? SHOT_DIR : null })],
    ["Contraste WCAG AA", () => checkContrast(browser, target)],
    ["Contraste sobre vídeo", () => checkContrastePintado(browser, target)],
    ["Acessibilidade e teclado", () => checkA11y(browser, target)],
    ["Orçamento de performance", () => checkPerformance(browser, target, { isDev })],
    ["Site sem JavaScript", () => checkNoJs(browser, target)],
    ["Clipes de vídeo", () => checkMidia(browser, target)],
    ["Movimento preso à rolagem", () => checkScrub(browser, target)],
  ]

  const allFailures = []

  for (const [name, run] of suites) {
    process.stdout.write(`\n── ${name} ${"─".repeat(Math.max(0, 46 - name.length))}\n`)
    const { failures, notes } = await run()
    notes.forEach((n) => process.stdout.write(`   ${n}\n`))
    failures.forEach((f) => process.stdout.write(`   ✗ ${f}\n`))
    allFailures.push(...failures.map((f) => `${name}: ${f}`))
  }

  process.stdout.write(`\n${"═".repeat(56)}\n`)
  if (allFailures.length === 0) {
    process.stdout.write("Todas as verificações passaram.\n")
  } else {
    process.stdout.write(`${allFailures.length} falha(s):\n`)
    allFailures.forEach((f) => process.stdout.write(`  ✗ ${f}\n`))
    exitCode = 1
  }
} catch (error) {
  process.stderr.write(`\nErro ao rodar as verificações: ${error.message}\n`)
  exitCode = 1
} finally {
  await browser?.close()
  if (server) stopDevServer(server.proc)
}

process.exit(exitCode)
