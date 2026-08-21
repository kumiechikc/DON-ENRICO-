/**
 * Responsividade e higiene de console em cada largura de referência.
 *
 * O estouro horizontal é medido comparando scrollWidth com clientWidth e, quando
 * há diferença, listando os elementos que passam da borda — sem isso o relatório
 * diz que quebrou mas não onde.
 */
export const VIEWPORTS = [
  { name: "375", width: 375, height: 812, label: "celular pequeno" },
  { name: "768", width: 768, height: 1024, label: "tablet" },
  { name: "1024", width: 1024, height: 768, label: "laptop" },
  { name: "1440", width: 1440, height: 900, label: "desktop" },
]

export async function checkViewports(browser, url, { screenshotDir } = {}) {
  const failures = []
  const notes = []

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()

    const noise = []
    /*
     * Mensagens do driver de GPU ("GL Driver Message", "GPU stall") vêm do
     * Chromium headless capturando tela nesta máquina, não do site. Filtrar
     * evita que um ruído de ambiente reprove todo build no CI.
     */
    const RUIDO_DE_AMBIENTE = /GL Driver Message|GPU stall|Automatic fallback to software WebGL/i
    page.on("console", (m) => {
      if (m.type() !== "error" && m.type() !== "warning") return
      const texto = m.text()
      if (RUIDO_DE_AMBIENTE.test(texto)) return
      noise.push(`[${m.type()}] ${texto}`)
    })
    page.on("pageerror", (e) => noise.push(`[pageerror] ${e.message}`))

    await page.goto(url, { waitUntil: "networkidle" })
    await page.waitForTimeout(300)

    const overflow = await page.evaluate(() => {
      const de = document.documentElement
      const clientW = de.clientWidth
      const offenders = []
      if (de.scrollWidth > clientW + 1) {
        for (const el of document.querySelectorAll("*")) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right > clientW + 1 || r.left < -1) {
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: String(el.className || "").slice(0, 70),
              left: Math.round(r.left),
              right: Math.round(r.right),
            })
          }
        }
      }
      return { scrollW: de.scrollWidth, clientW, offenders: offenders.slice(0, 5) }
    })

    if (screenshotDir) {
      await page.screenshot({ path: `${screenshotDir}/${vp.name}.png`, fullPage: true })
    }

    notes.push(
      `${vp.name}px (${vp.label}): scrollWidth=${overflow.scrollW} clientWidth=${overflow.clientW}`
    )

    if (overflow.offenders.length > 0) {
      failures.push(
        `estouro horizontal em ${vp.name}px: ` +
          overflow.offenders
            .map((o) => `<${o.tag} class="${o.cls}"> [${o.left}, ${o.right}]`)
            .join(" | ")
      )
    }
    if (noise.length > 0) {
      failures.push(`console sujo em ${vp.name}px: ${noise.slice(0, 4).join(" | ")}`)
    }

    await ctx.close()
  }

  return { failures, notes }
}
