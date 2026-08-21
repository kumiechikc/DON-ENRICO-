/**
 * Acessibilidade estrutural e de teclado.
 *
 * Não substitui teste com pessoa real, mas trava as regressões que aparecem
 * sozinhas quando alguém mexe no layout: foco invisível, alvo de toque menor que
 * o dedo, imagem sem alt, hierarquia de títulos furada e link "pular conteúdo"
 * que sumiu.
 */
export async function checkA11y(browser, url) {
  const failures = []
  const notes = []

  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle" })

  const structural = await page.evaluate(() => {
    const problems = []

    // Um h1 e apenas um.
    const h1s = document.querySelectorAll("h1")
    if (h1s.length !== 1) problems.push(`a página tem ${h1s.length} h1 (deve ter 1)`)

    // Hierarquia de títulos sem pular nível.
    const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1])
    )
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        problems.push(`salto de h${levels[i - 1]} para h${levels[i]} na hierarquia`)
        break
      }
    }

    // Imagem sem alternativa textual.
    for (const img of document.querySelectorAll("img")) {
      if (!img.hasAttribute("alt")) {
        problems.push(`img sem atributo alt: ${img.currentSrc || img.src}`)
      }
    }

    // Controle sem nome acessível.
    for (const el of document.querySelectorAll("button, a[href]")) {
      const name = (
        el.getAttribute("aria-label") ||
        el.textContent ||
        ""
      ).trim()
      if (!name) {
        problems.push(`${el.tagName.toLowerCase()} sem nome acessível`)
      }
    }

    // Alvo de toque: 44x44 é o mínimo confortável no celular.
    // Elementos escondidos para leitores de tela (o atalho de pular conteúdo) só
    // ganham tamanho ao receber foco, então não entram na conta.
    // Medir o tamanho cobre qualquer técnica de esconder (clip, clip-path,
    // 1x1 + overflow), sem depender de como o Tailwind implementa sr-only.
    const isScreenReaderOnly = (el) => {
      const r = el.getBoundingClientRect()
      return r.width <= 1 && r.height <= 1
    }
    for (const el of document.querySelectorAll("button, a[href]")) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (isScreenReaderOnly(el)) continue
      if (r.height < 44 - 0.5 || r.width < 24) {
        const label = (el.getAttribute("aria-label") || el.textContent || "")
          .trim()
          .slice(0, 30)
        problems.push(
          `alvo pequeno (${Math.round(r.width)}x${Math.round(r.height)}): "${label}"`
        )
      }
    }

    // Landmarks básicos.
    if (!document.querySelector("main")) problems.push("falta landmark <main>")
    if (!document.querySelector("footer")) problems.push("falta landmark <footer>")

    return problems
  })

  failures.push(...structural)

  // O primeiro Tab tem que cair no atalho de pular para o conteúdo.
  await page.keyboard.press("Tab")
  const firstStop = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      text: (el.textContent || "").trim().slice(0, 40),
      visible: r.width > 0 && r.height > 0 && cs.visibility !== "hidden",
      outline: cs.outlineWidth,
    }
  })

  if (!firstStop || !/pular/i.test(firstStop.text)) {
    failures.push(
      `primeiro Tab não vai para o atalho de pular conteúdo (foi para "${firstStop?.text ?? "nada"}")`
    )
  } else if (!firstStop.visible) {
    failures.push("atalho de pular conteúdo recebe foco mas continua invisível")
  }
  notes.push(`primeiro Tab: "${firstStop?.text ?? "nada"}" (contorno ${firstStop?.outline})`)

  // Foco tem que ser visível em qualquer botão.
  // Foca e mede num quadro seguinte: ler no instante do foco pega qualquer
  // transição pela metade e reporta largura zero num anel que existe.
  await page.evaluate(() => {
    const btn = document.querySelector("main button")
    if (btn instanceof HTMLElement) btn.focus()
  })
  await page.waitForTimeout(120)
  const focusRing = await page.evaluate(() => {
    const btn = document.querySelector("main button")
    if (!btn) return null
    const cs = getComputedStyle(btn)
    return { width: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor }
  })
  if (!focusRing || focusRing.style === "none" || parseFloat(focusRing.width) < 1) {
    failures.push("botão sem contorno de foco visível")
  }
  notes.push(
    `anel de foco: ${focusRing?.width} ${focusRing?.style} ${focusRing?.color ?? ""}`
  )

  await ctx.close()
  return { failures, notes }
}
