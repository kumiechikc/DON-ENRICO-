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
import { mkdirSync } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"

import { checkViewports } from "./checks/viewport.mjs"
import { checkContrast } from "./checks/contrast.mjs"
import { checkOrderFlow } from "./checks/order-flow.mjs"
import { checkA11y } from "./checks/a11y.mjs"

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
  const proc = spawn("npm", ["run", "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
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

/** Chromium do ambiente; cai no caminho pré-instalado das imagens de CI. */
async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch {
    return await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })
  }
}

let server = null
let browser = null
let exitCode = 0

try {
  const target = providedUrl ?? (server = await startDevServer()).url
  browser = await launchBrowser()

  const suites = [
    ["Responsividade e console", () => checkViewports(browser, target, { screenshotDir: wantShots ? SHOT_DIR : null })],
    ["Fluxo do pedido", () => checkOrderFlow(browser, target, { screenshotDir: wantShots ? SHOT_DIR : null })],
    ["Contraste WCAG AA", () => checkContrast(browser, target)],
    ["Acessibilidade e teclado", () => checkA11y(browser, target)],
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
