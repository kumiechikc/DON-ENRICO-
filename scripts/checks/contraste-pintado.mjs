/**
 * Contraste medido no pixel que a pessoa realmente enxerga.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE ESTA CONFERÊNCIA EXISTE, SE JÁ HÁ UMA DE CONTRASTE
 *
 * A que já existe (`contrast.mjs`) resolve o fundo subindo a árvore do DOM até
 * achar uma cor opaca declarada no CSS. Isso pega quase tudo — e não pega nada
 * quando o que está atrás do texto é um VÍDEO, uma imagem ou um gradiente.
 *
 * Aconteceu aqui. O clipe da lâmpada entrou no hero e a mesa de metal, que
 * reflete a luz, ficou justamente embaixo do texto. Medido a mão:
 *
 *     índice de preços, celular ......... 1,01 a 1,51   (mínimo 4,5)
 *     eyebrow "Porto Alegre", celular ... 1,33
 *     índice de preços, desktop ......... 2,75 a 3,80
 *
 * O texto sumia. E `npm run check` passava, porque a conferência antiga
 * encontrava `#120b08` no ancestral e concluía 9,5:1. Achei o defeito lendo
 * pixel por pixel de uma captura, à mão. Isto é esse trabalho, mecânico.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * COMO FUNCIONA
 *
 * 1. Acha as seções que têm `[data-clipe]` — só nelas o fundo declarado mente.
 * 2. Mede a caixa de cada NÓ DE TEXTO com um `Range`, não a do elemento. Um
 *    parágrafo com um `<strong>` no meio não é folha, e medir só as folhas
 *    deixaria o texto do próprio parágrafo sem conferência nenhuma. O `Range`
 *    devolve os retângulos das linhas de verdade, que é o que os olhos veem.
 * 3. Pinta o texto de `transparent` e captura. NÃO `visibility: hidden`: isso
 *    apagaria também o fundo do próprio elemento, e um botão âmbar passaria a
 *    ser medido contra a página atrás dele. Foi o primeiro erro desta
 *    conferência, e ela acusou 1,00:1 num botão que está perfeito.
 * 4. Amostra os pixels de cada retângulo e pega o PIOR caso, não a média. A
 *    média esconde exatamente o ponto onde o reflexo bate.
 * 5. Compara com a cor computada do texto e cobra a WCAG 2.1 AA.
 */
import { lerPng, pixel } from "../lib/png.mjs"

const VIEWPORTS = [
  { nome: "celular", width: 390, height: 844 },
  { nome: "desktop", width: 1440, height: 900 },
]

function luminancia([r, g, b]) {
  const f = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function razao(a, b) {
  const [hi, lo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export async function checkContrastePintado(browser, url) {
  const failures = []
  const notes = []

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      /*
       * Movimento desligado. Com o vídeo tocando, cada captura pega um quadro
       * diferente e a conferência passa ou reprova conforme o segundo em que
       * rodou. O pôster é estático e é o pior caso honesto: é o que aparece
       * primeiro, é o que fica para quem tem movimento reduzido, e é o mesmo
       * quadro em toda rodada.
       */
      reducedMotion: "reduce",
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 })

    const alvos = await page.evaluate(() => {
      const secoes = new Set()
      for (const marca of document.querySelectorAll("[data-clipe]")) {
        const secao = marca.closest("section") || marca.parentElement
        if (secao) secoes.add(secao)
      }

      const achados = []
      for (const secao of secoes) {
        const passeio = document.createTreeWalker(secao, NodeFilter.SHOW_TEXT)
        let no
        while ((no = passeio.nextNode())) {
          const texto = (no.textContent || "").trim()
          if (!texto) continue

          const pai = no.parentElement
          if (!pai) continue
          const cs = getComputedStyle(pai)
          if (cs.visibility === "hidden" || cs.display === "none") continue
          if (Number(cs.opacity) < 0.1) continue

          const m = cs.color.match(/rgba?\(([^)]+)\)/)
          if (!m) continue
          const [r, g, b] = m[1].split(",").map(parseFloat)

          const tamanho = parseFloat(cs.fontSize)
          const negrito = Number(cs.fontWeight) >= 700

          /*
           * Um retângulo por linha desenhada. Um parágrafo que quebra em três
           * linhas dá três caixas, e cada uma cai sobre um pedaço diferente do
           * vídeo — medir a caixa do elemento inteiro misturaria as três e
           * perderia justamente a linha que caiu no reflexo.
           */
          const faixa = document.createRange()
          faixa.selectNodeContents(no)
          for (const caixa of faixa.getClientRects()) {
            if (caixa.width < 2 || caixa.height < 2) continue
            if (caixa.bottom < 0 || caixa.top > window.innerHeight) continue
            achados.push({
              texto: texto.slice(0, 44),
              cor: [r, g, b],
              // Regra da WCAG para texto grande: 24px, ou 18.66px em negrito.
              grande: tamanho >= 24 || (negrito && tamanho >= 18.66),
              caixa: {
                x: Math.max(0, Math.round(caixa.x)),
                y: Math.max(0, Math.round(caixa.y)),
                w: Math.round(caixa.width),
                h: Math.round(caixa.height),
              },
            })
          }
        }
      }
      return achados
    })

    if (alvos.length === 0) {
      notes.push(`${vp.nome}: nenhum texto sobre vídeo — nada para medir`)
      await ctx.close()
      continue
    }

    /*
     * Some com os glifos, não com os elementos. `color: transparent` deixa
     * fundo, borda e layout exatamente onde estavam — é o que faz a captura ser
     * o fundo REAL de cada texto, inclusive o fundo âmbar de um botão.
     *
     * `-webkit-text-fill-color` acompanha porque ele ganha do `color` quando
     * está definido, e o site usa isso no efeito de revelação do título.
     */
    await page.addStyleTag({
      content:
        "section:has([data-clipe]) *, section:has([data-clipe]) {" +
        "color: transparent !important;" +
        "-webkit-text-fill-color: transparent !important;" +
        "text-shadow: none !important; }",
    })
    await page.waitForTimeout(250)
    const captura = await page.screenshot({ type: "png" })
    await ctx.close()

    const img = lerPng(captura)

    for (const alvo of alvos) {
      const { x, y, w, h } = alvo.caixa

      let pior = null
      let piorRazao = Infinity
      // Uma grade esparsa: 8x4 pontos cobrem a caixa sem ler milhares de pixels.
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 4; j++) {
          const px = Math.min(img.largura - 1, x + Math.round((w * (i + 0.5)) / 8))
          const py = Math.min(img.altura - 1, y + Math.round((h * (j + 0.5)) / 4))
          if (px < 0 || py < 0) continue
          const cor = pixel(img, px, py)
          const r = razao(alvo.cor, cor)
          if (r < piorRazao) {
            piorRazao = r
            pior = cor
          }
        }
      }
      if (pior === null) continue

      const minimo = alvo.grande ? 3 : 4.5
      if (piorRazao < minimo) {
        failures.push(
          `${vp.nome}: "${alvo.texto}" tem ${piorRazao.toFixed(2)}:1 sobre o ` +
            `fundo pintado rgb(${pior.join(",")}) — mínimo ${minimo} ` +
            `(texto ${alvo.grande ? "grande" : "normal"})`
        )
      }
    }

    /*
     * Claro do que ela olhou. Uma conferência que passa sem dizer quantos
     * elementos mediu é indistinguível de uma que não mediu nada — foi assim
     * que a conferência antiga passou enquanto a página quebrava.
     */
    notes.push(`${vp.nome}: ${alvos.length} texto(s) sobre vídeo medidos no pixel`)
  }

  return { failures, notes }
}
