/**
 * Verificação da mídia em movimento: clipes de vídeo e sequências de quadros.
 *
 * Duas frentes, porque os dois jeitos de errar são diferentes:
 *
 *  — ESTÁTICA: todo clipe do manifesto tem os três arquivos, dentro do
 *    orçamento, com o fallback MP4; e toda sequência tem a tira medida no
 *    arquivo de verdade. Roda sem navegador (`npm run check:midia`), para dar
 *    resposta em um segundo depois de preparar uma peça.
 *
 *  — NAVEGADOR: com `prefers-reduced-motion`, nenhum byte de vídeo é pedido e
 *    nenhuma sequência avança. Essa é a que não dá para conferir lendo código:
 *    o `<video>` pode estar fora da árvore e mesmo assim um `<source>`
 *    esquecido em algum lugar dispara o download; e um ouvinte de rolagem que
 *    não deveria existir só aparece quando a página rola de verdade.
 */
import { existsSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { medirWebp } from "../lib/webp.mjs"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

const ORCAMENTO_KB = { hero: 600, secao: 350, total: 2048, sequencia: 250 }

/** Lê o manifesto sem precisar compilar TypeScript. */
async function lerManifesto() {
  const mod = await import(join(raiz, "src", "lib", "media", "clipes.ts"))
  return mod.clipes
}

async function lerSequencias() {
  const mod = await import(join(raiz, "src", "lib", "media", "sequencias.ts"))
  return mod.sequencias
}

/**
 * O deslocamento que o componente aplica no quadro `q` de uma tira de `n`.
 *
 * Copiado do componente de propósito: se a fórmula lá mudar, a conferência
 * reprova em vez de acompanhar em silêncio. Uma conferência que importa a
 * fórmula do código conferido só prova que o código é igual a si mesmo.
 */
export function deslocamento(q, n) {
  return `translateX(-${(q / n) * 100}%)`
}

/* ─────────────────────────────── estática ───────────────────────────── */

export async function checkMidiaEstatica() {
  const failures = []
  const notes = []
  const clipes = await lerManifesto()

  if (clipes.length === 0) {
    notes.push("nenhum clipe registrado — o site não pede vídeo nenhum hoje")
    /*
     * Sem clipe não há o que medir, e dizer "passou" seria mentira por
     * omissão. O manifesto vazio é estado legítimo do projeto, então a
     * conferência reporta o estado em vez de fingir que verificou algo.
     */
    return { failures, notes }
  }

  let totalKb = 0

  for (const clipe of clipes) {
    const base = join(raiz, "public", "cinema", clipe.id)
    const arquivos = {
      webm: `${base}.webm`,
      mp4: `${base}.mp4`,
      poster: `${base}-poster.webp`,
    }

    for (const [tipo, caminho] of Object.entries(arquivos)) {
      if (!existsSync(caminho)) {
        failures.push(`clipe "${clipe.id}": falta o ${tipo} (${caminho})`)
      }
    }
    if (Object.values(arquivos).some((c) => !existsSync(c))) continue

    const kb = (c) => statSync(c).size / 1024
    const maior = Math.max(kb(arquivos.webm), kb(arquivos.mp4))
    // O hero é o único que quase todo visitante baixa; os de seção são vários.
    const limite = clipe.id === "lampada" ? ORCAMENTO_KB.hero : ORCAMENTO_KB.secao

    if (maior > limite) {
      failures.push(
        `clipe "${clipe.id}": ${maior.toFixed(0)} KB passou do orçamento de ${limite} KB`
      )
    }

    if (!clipe.largura || !clipe.altura) {
      failures.push(`clipe "${clipe.id}": sem largura/altura — a página vai pular`)
    }

    totalKb += kb(arquivos.webm) + kb(arquivos.poster)
    notes.push(
      `${clipe.id}: webm ${kb(arquivos.webm).toFixed(0)} KB, ` +
        `mp4 ${kb(arquivos.mp4).toFixed(0)} KB, ` +
        `poster ${kb(arquivos.poster).toFixed(0)} KB`
    )
  }

  if (totalKb > ORCAMENTO_KB.total) {
    failures.push(
      `soma dos clipes: ${totalKb.toFixed(0)} KB acima do teto de ${ORCAMENTO_KB.total} KB`
    )
  } else if (clipes.length > 0) {
    notes.push(`soma: ${totalKb.toFixed(0)} KB de ${ORCAMENTO_KB.total} KB`)
  }

  return { failures, notes }
}

/* ─────────────────────── sequências (estática) ──────────────────────── */

/**
 * A conferência que justifica a ferramenta de preparo existir.
 *
 * A largura vem do ARQUIVO, não do manifesto. É a única forma de pegar o caso
 * que motivou tudo isto: uma tira de 1376 px anotada como 5 quadros, porque
 * 1376 ÷ 5 = 275,2 e a divisão não fecha. Se a medida saísse do manifesto, a
 * conferência estaria comparando a anotação com ela mesma e passaria feliz
 * enquanto a animação derrapa um pedaço de quadro por passo.
 */
export async function checkSequenciasEstatica() {
  const failures = []
  const notes = []
  const sequencias = await lerSequencias()

  if (sequencias.length === 0) {
    notes.push("nenhuma sequência registrada — nada para medir hoje")
    return { failures, notes }
  }

  for (const seq of sequencias) {
    const caminho = join(raiz, "public", "cinema", `${seq.id}.webp`)

    if (!existsSync(caminho)) {
      failures.push(`sequência "${seq.id}": falta a tira (${caminho})`)
      continue
    }

    if (!Number.isInteger(seq.quadros) || seq.quadros < 2) {
      failures.push(`sequência "${seq.id}": ${seq.quadros} quadro(s) não é sequência`)
      continue
    }
    if (!seq.largura || !seq.altura) {
      failures.push(`sequência "${seq.id}": sem largura/altura — a página vai pular`)
      continue
    }

    let medida
    try {
      medida = medirWebp(caminho)
    } catch (erro) {
      failures.push(`sequência "${seq.id}": não consegui medir a tira — ${erro.message}`)
      continue
    }

    const esperada = seq.largura * seq.quadros
    if (medida.largura !== esperada) {
      failures.push(
        `sequência "${seq.id}": a tira tem ${medida.largura} px, mas ` +
          `${seq.quadros} quadros de ${seq.largura} px dariam ${esperada} — ` +
          "os quadros vão desalinhar. Rode npm run sequencia de novo."
      )
    }
    if (medida.altura !== seq.altura) {
      failures.push(
        `sequência "${seq.id}": a tira tem ${medida.altura} px de altura, ` +
          `o manifesto diz ${seq.altura} — a proporção reservada está errada`
      )
    }

    const kb = statSync(caminho).size / 1024
    if (kb > ORCAMENTO_KB.sequencia) {
      failures.push(
        `sequência "${seq.id}": ${kb.toFixed(0)} KB passou do orçamento de ` +
          `${ORCAMENTO_KB.sequencia} KB`
      )
    }

    notes.push(
      `${seq.id}: ${medida.largura}×${medida.altura}, ` +
        `${seq.quadros} × ${seq.largura} px, ${kb.toFixed(0)} KB`
    )
  }

  return { failures, notes }
}

/* ────────────────────────────── navegador ───────────────────────────── */

export async function checkMidia(browser, url) {
  const { failures, notes } = await checkMidiaEstatica()
  const daTira = await checkSequenciasEstatica()
  failures.push(...daTira.failures)
  notes.push(...daTira.notes)

  const clipes = await lerManifesto()
  const sequencias = await lerSequencias()

  /**
   * Conta quantos arquivos de vídeo o navegador pediu numa visita.
   *
   * Olha a requisição, não o DOM: é o download que custa os megabytes do
   * cliente no 4G, e ele pode acontecer sem nenhum `<video>` visível.
   */
  async function pedidosDeVideo({ reducedMotion, aparelhoFraco = false }) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion,
    })
    /*
     * Finge um aparelho de entrada. É o caso que o `MotionProvider` rebaixa
     * para "video": sem rolagem interpolada e sem animação amarrada ao scroll,
     * mas COM o clipe — decodificar vídeo em hardware é barato, e era esse
     * aparelho que ficava sem a peça principal da página.
     */
    if (aparelhoFraco) {
      await ctx.addInitScript(() => {
        Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 })
        Object.defineProperty(navigator, "deviceMemory", { get: () => 2 })
      })
    }
    const page = await ctx.newPage()
    const videos = []
    page.on("request", (r) => {
      if (/\.(webm|mp4)(\?|$)/.test(r.url())) videos.push(r.url())
    })
    await page.goto(url, { waitUntil: "load", timeout: 60000 })
    // Percorre a página inteira: o observador só monta o vídeo na aproximação.
    await page.evaluate(async () => {
      const passo = window.innerHeight * 0.7
      for (let y = 0; y < document.body.scrollHeight; y += passo) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 200))
      }
    })
    await page.waitForTimeout(1500)
    await ctx.close()
    return videos
  }

  const comReducao = await pedidosDeVideo({ reducedMotion: "reduce" })
  if (comReducao.length > 0) {
    failures.push(
      `com prefers-reduced-motion o navegador pediu ${comReducao.length} vídeo(s): ` +
        comReducao.map((u) => u.split("/").pop()).join(", ")
    )
  }
  notes.push(`com movimento reduzido: ${comReducao.length} vídeo(s) baixado(s)`)

  /*
   * Com movimento ligado o vídeo TEM que ser pedido. Sem esta metade, a
   * conferência passaria com o componente quebrado e nenhum vídeo tocando —
   * que é exatamente o resultado que "zero downloads" também produz.
   */
  if (clipes.length > 0) {
    const normal = await pedidosDeVideo({ reducedMotion: "no-preference" })
    if (normal.length === 0) {
      failures.push(
        "com movimento ligado nenhum vídeo foi pedido — o componente não está montando"
      )
    }
    notes.push(`com movimento normal: ${normal.length} vídeo(s) baixado(s)`)

    /*
     * A metade que existe por um defeito real: o clipe do hero estava preso
     * atrás do mesmo portão das animações, e sumia em qualquer aparelho que
     * reportasse menos de 4 núcleos ou menos de 4 GB. O dono do site abriu a
     * página e não viu animação nenhuma.
     *
     * Aparelho fraco perde Lenis, ScrollTrigger e shader. NÃO perde o vídeo.
     */
    const fraco = await pedidosDeVideo({
      reducedMotion: "no-preference",
      aparelhoFraco: true,
    })
    if (fraco.length === 0) {
      failures.push(
        "num aparelho fraco (2 núcleos, 2 GB) nenhum vídeo foi pedido — o clipe " +
          "voltou a ficar preso atrás do portão das animações"
      )
    }
    notes.push(`em aparelho fraco: ${fraco.length} vídeo(s) baixado(s)`)
  }

  /**
   * Percorre a página anotando em que quadro cada sequência parou.
   *
   * Não dá para perguntar ao navegador "existe ouvinte de rolagem aqui". O que
   * dá para observar é a consequência: se o ouvinte existe, o quadro muda ao
   * rolar; se não existe, ele fica parado no último. É a mesma coisa medida
   * pelo lado que o usuário sente.
   */
  async function quadrosVistos({ reducedMotion }) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: "load", timeout: 60000 })

    const vistos = new Map()
    async function anotar() {
      const agora = await page.$$eval("[data-sequencia]", (els) =>
        els.map((el) => ({
          id: el.getAttribute("data-sequencia"),
          transform: el.querySelector("img")?.style.transform ?? "",
        }))
      )
      for (const { id, transform } of agora) {
        if (!vistos.has(id)) vistos.set(id, new Set())
        vistos.get(id).add(transform)
      }
    }

    await anotar()
    const altura = await page.evaluate(() => document.body.scrollHeight)
    const passo = 844 * 0.35
    for (let y = 0; y < altura; y += passo) {
      await page.evaluate((v) => window.scrollTo(0, v), y)
      await page.waitForTimeout(120)
      await anotar()
    }

    await ctx.close()
    return vistos
  }

  if (sequencias.length > 0) {
    const parado = await quadrosVistos({ reducedMotion: "reduce" })
    const rolando = await quadrosVistos({ reducedMotion: "no-preference" })

    for (const seq of sequencias) {
      const ultimo = deslocamento(seq.quadros - 1, seq.quadros)

      const comReducao = parado.get(seq.id)
      if (!comReducao) {
        failures.push(`sequência "${seq.id}": não achei a peça na página`)
        continue
      }
      if (comReducao.size !== 1 || !comReducao.has(ultimo)) {
        failures.push(
          `sequência "${seq.id}": com movimento reduzido o quadro deveria ficar ` +
            `parado em ${ultimo}, mas passou por ${[...comReducao].join(", ")}`
        )
      } else {
        notes.push(`${seq.id}: com movimento reduzido, parada no último quadro`)
      }

      /*
       * A outra metade, e a que pega o componente morto: sem ela, uma peça que
       * nunca avança passaria nos dois lados — "parada" é o resultado certo de
       * um lado e o defeito silencioso do outro.
       */
      const comMovimento = rolando.get(seq.id)
      if (!comMovimento || comMovimento.size < 2) {
        failures.push(
          `sequência "${seq.id}": com movimento ligado o quadro não mudou ao ` +
            "rolar — a animação não está ligada"
        )
      } else {
        notes.push(`${seq.id}: com movimento ligado, ${comMovimento.size} quadros vistos`)
      }
    }

    /*
     * Sem JavaScript o HTML entregue pelo servidor já tem que trazer o último
     * quadro. Aqui é o HTML cru mesmo, sem navegador: é o que o robô de busca
     * lê e o que aparece enquanto o JavaScript não chega.
     */
    const html = await (await fetch(url)).text()
    let faltou = 0
    for (const seq of sequencias) {
      const ultimo = deslocamento(seq.quadros - 1, seq.quadros)
      if (!html.includes(ultimo)) {
        faltou++
        failures.push(
          `sequência "${seq.id}": o HTML do servidor não traz o último quadro ` +
            `(${ultimo}) — sem JavaScript a peça aparece no quadro errado`
        )
      }
    }
    if (faltou === 0) notes.push("HTML do servidor: último quadro presente")
  }

  return { failures, notes }
}
