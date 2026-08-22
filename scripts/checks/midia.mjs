/**
 * Verificação dos clipes de vídeo.
 *
 * Duas frentes, porque os dois jeitos de errar são diferentes:
 *
 *  — ESTÁTICA: todo clipe do manifesto tem os três arquivos, dentro do
 *    orçamento, com o fallback MP4. Roda sem navegador (`npm run check:midia`),
 *    para dar resposta em um segundo depois de comprimir um clipe.
 *
 *  — NAVEGADOR: com `prefers-reduced-motion`, nenhum byte de vídeo é pedido.
 *    Essa é a que não dá para conferir lendo código: o `<video>` pode estar
 *    fora da árvore e mesmo assim um `<source>` esquecido em algum lugar
 *    dispara o download. Só a aba de rede diz a verdade.
 */
import { existsSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

const ORCAMENTO_KB = { hero: 600, secao: 350, total: 2048 }

/** Lê o manifesto sem precisar compilar TypeScript. */
async function lerManifesto() {
  const mod = await import(join(raiz, "src", "lib", "media", "clipes.ts"))
  return mod.clipes
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

/* ────────────────────────────── navegador ───────────────────────────── */

export async function checkMidia(browser, url) {
  const { failures, notes } = await checkMidiaEstatica()
  const clipes = await lerManifesto()

  /**
   * Conta quantos arquivos de vídeo o navegador pediu numa visita.
   *
   * Olha a requisição, não o DOM: é o download que custa os megabytes do
   * cliente no 4G, e ele pode acontecer sem nenhum `<video>` visível.
   */
  async function pedidosDeVideo({ reducedMotion }) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion,
    })
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
  }

  return { failures, notes }
}
