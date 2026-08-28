/**
 * As duas peças presas ao PROGRESSO da rolagem (M1 e M2).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE ISTO EXISTE, E POR QUE AS OUTRAS SETE SUÍTES NÃO COBRIAM
 *
 * `scrub` entrou no site em 2026-08-28 e é a primeira técnica daqui que falha
 * de um jeito que nenhuma verificação anterior enxerga: ELA FALHA CALADA. As
 * duas peças continuam no DOM, com o tamanho certo, sem erro no console, sem
 * estouro horizontal, sem mudar o contraste, sem mexer no LCP nem no CLS. Só
 * param de responder à rolagem.
 *
 * Isso não é hipótese. Aconteceu na primeira versão de M1, no mesmo dia: a barra
 * de progresso ficou parada em zero com o GSAP escrevendo `scale(0, 1)` a cada
 * quadro — viva, atualizando, e sempre no mesmo valor. As oito suítes passaram
 * inteiras por cima. Quem achou foi um olho medindo a página rolada, e um olho
 * não roda no CI.
 *
 * A causa está escrita em `scroll-progress.tsx`: `<html>` mede 900px e não os
 * 8390 da página, então o intervalo do gatilho degenerou para comprimento zero.
 * É um defeito de MEDIÇÃO, e defeito de medição só se pega medindo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AS DUAS AFIRMAÇÕES CONFERIDAS
 *
 *   M1 — a barra não mente sobre a posição. `scaleX` tem de bater com o
 *        progresso real do documento em cada parada. Uma barra que anda mas
 *        anda errado é pior que barra nenhuma, e "anda" sozinho não prova nada:
 *        por isso a conferência compara VALOR, não movimento.
 *
 *   M2 — a camada do hero cobre a seção durante a travessia inteira. É a
 *        armadilha que `docs/BRIEF-MOVIMENTO.md` §3.2 levantou por escrito:
 *        transladar a camada revela a borda de baixo. A folga é calculada em
 *        `hero-section.tsx` a partir do deslocamento máximo, e isto aqui é o que
 *        confere que a conta está certa nas duas geometrias que importam — no
 *        desktop, onde a seção é mais alta que a janela, e no celular, onde a
 *        barra de endereço se recolhe e a janela fica maior que a seção.
 *
 * A tolerância de 1px em ambas é de arredondamento de subpixel, não folga de
 * julgamento: `getBoundingClientRect` devolve fracionário e a página tem altura
 * de 8389,7px.
 */

const PARADAS = 10
const TOLERANCIA_PX = 1
const TOLERANCIA_PROGRESSO = 0.01

const TELAS = [
  { nome: "celular", width: 390, height: 844 },
  { nome: "desktop", width: 1440, height: 900 },
]

export async function checkScrub(browser, url) {
  const failures = []
  const notes = []

  for (const tela of TELAS) {
    const ctx = await browser.newContext({
      viewport: { width: tela.width, height: tela.height },
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: "networkidle" })
    /*
     * A cortina de entrada trava a rolagem enquanto sobe. Medir antes dela sair
     * mediria a página travada — que é exatamente o estado em que um intervalo
     * de gatilho degenera, ou seja, o falso positivo mais fácil de produzir aqui.
     */
    await page.waitForTimeout(2500)

    let piorFalhaDeCobertura = 0
    let piorErroDaBarra = 0
    let barraAndou = false
    /*
     * Contado, e não presumido. Sem isto, uma seção que sumisse da tela em todas
     * as paradas deixaria `piorFalhaDeCobertura` em zero e a nota sairia
     * afirmando cobertura que ninguém mediu — o modo exato de falhar que esta
     * suíte existe para não repetir.
     */
    let paradasComHeroNaTela = 0
    /*
     * Local, e não `failures.length`. Com o contador global, uma reprovação no
     * celular fazia o desktop pular a medição inteira — e o relatório sairia
     * falando de uma tela só, escondendo se o defeito era das duas ou de uma.
     * Cada tela responde por si.
     */
    let faltouElemento = false

    for (let i = 0; i <= PARADAS; i++) {
      const alvo = Math.round((tela.height * i) / PARADAS)
      await page.evaluate((y) => window.scrollTo(0, y), alvo)
      await page.waitForTimeout(220)

      const m = await page.evaluate(() => {
        const secao = document.querySelector("section")
        const camada = secao?.querySelector("div.absolute.inset-0.z-0")
        const barra = document.querySelector(
          "header div[aria-hidden='true'].origin-left"
        )
        if (!secao || !camada) return { erro: "hero ou camada de fundo não encontrada" }
        if (!barra) return { erro: "barra de progresso não encontrada" }

        const s = secao.getBoundingClientRect()
        const c = camada.getBoundingClientRect()
        const V = window.innerHeight

        // A faixa da seção que está de fato na tela — é só ela que precisa
        // estar coberta. O que já saiu não interessa a ninguém.
        const topoVisivel = Math.max(0, s.top)
        const baseVisivel = Math.min(V, s.bottom)

        const maxScroll = document.documentElement.scrollHeight - V
        return {
          visivel: baseVisivel > topoVisivel,
          falhaTopo: Math.max(0, c.top - topoVisivel),
          falhaBase: Math.max(0, baseVisivel - c.bottom),
          escalaBarra: new DOMMatrixReadOnly(getComputedStyle(barra).transform).a,
          progresso: maxScroll > 0 ? window.scrollY / maxScroll : 0,
        }
      })

      if (m.erro) {
        failures.push(`${tela.nome}: ${m.erro}`)
        faltouElemento = true
        break
      }

      const erroBarra = Math.abs(m.escalaBarra - m.progresso)
      if (erroBarra > piorErroDaBarra) piorErroDaBarra = erroBarra
      if (m.escalaBarra > 0) barraAndou = true

      if (m.visivel) {
        paradasComHeroNaTela++
        const falha = Math.max(m.falhaTopo, m.falhaBase)
        if (falha > piorFalhaDeCobertura) piorFalhaDeCobertura = falha
      }
    }

    if (faltouElemento) {
      await ctx.close()
      continue
    }

    /*
     * "Andou" é conferido separado de "bate com o progresso" de propósito. Se a
     * barra travar em zero, o erro contra o progresso já reprova — mas a
     * mensagem sairia falando de precisão, e o defeito real seria estar morta.
     * Duas afirmações, duas mensagens.
     */
    if (!barraAndou) {
      failures.push(
        `${tela.nome}: a barra de progresso não saiu de zero em nenhuma das ` +
          `${PARADAS + 1} paradas — o gatilho de scrub está morto`
      )
    } else if (piorErroDaBarra > TOLERANCIA_PROGRESSO) {
      failures.push(
        `${tela.nome}: a barra de progresso erra até ${piorErroDaBarra.toFixed(3)} ` +
          `contra a posição real (tolerância ${TOLERANCIA_PROGRESSO}) — ela está ` +
          `mentindo sobre quanto falta`
      )
    } else {
      notes.push(
        `${tela.nome}: barra de progresso fiel à posição (erro máximo ` +
          `${piorErroDaBarra.toFixed(4)})`
      )
    }

    if (paradasComHeroNaTela === 0) {
      failures.push(
        `${tela.nome}: o hero não apareceu na tela em nenhuma das ` +
          `${PARADAS + 1} paradas — a cobertura da camada não foi medida`
      )
    } else if (piorFalhaDeCobertura > TOLERANCIA_PX) {
      failures.push(
        `${tela.nome}: a camada do hero descobre até ` +
          `${piorFalhaDeCobertura.toFixed(1)}px da seção durante a travessia — ` +
          `a folga de escala não está cobrindo o deslocamento`
      )
    } else {
      notes.push(
        `${tela.nome}: camada do hero cobre a seção nas ${paradasComHeroNaTela} ` +
          `parada(s) em que ela esteve na tela`
      )
    }

    await ctx.close()
  }

  return { failures, notes }
}
