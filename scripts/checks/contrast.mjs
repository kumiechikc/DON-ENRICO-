/**
 * Contraste WCAG 2.1 AA medido no que o navegador realmente pintou.
 *
 * Ler os tokens do CSS não basta: o que reprova costuma ser a combinação que só
 * existe depois de aplicar opacidade e herdar o fundo de um ancestral. Por isso
 * a cor de fundo é resolvida subindo a árvore até achar um fundo opaco, e cores
 * com alfa são compostas sobre ele antes da conta.
 */
export async function checkContrast(browser, url, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle" })

  const violations = await page.evaluate(() => {
    const toRgb = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const p = m[1].split(",").map(parseFloat)
      return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }
    }
    const lum = ({ r, g, b }) => {
      const f = (v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const composite = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    })
    const opaqueBackgroundOf = (el) => {
      let node = el
      while (node && node !== document.documentElement) {
        const c = toRgb(getComputedStyle(node).backgroundColor)
        if (c && c.a > 0.95) return c
        node = node.parentElement
      }
      const bodyBg = toRgb(getComputedStyle(document.body).backgroundColor)
      return bodyBg && bodyBg.a > 0.95 ? bodyBg : { r: 255, g: 255, b: 255, a: 1 }
    }
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
      return (hi + 0.05) / (lo + 0.05)
    }

    const out = []
    const seen = new Set()

    for (const el of document.querySelectorAll(
      "p, h1, h2, h3, h4, span, a, button, li, strong, legend, label"
    )) {
      const text = (el.textContent || "").trim()
      // Só folhas de texto: um elemento com filhos teria a cor do filho medida.
      if (!text || el.children.length > 0) continue

      const cs = getComputedStyle(el)
      if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") {
        continue
      }
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue

      const rawFg = toRgb(cs.color)
      if (!rawFg) continue
      const bg = opaqueBackgroundOf(el)
      const fg = rawFg.a < 1 ? composite(rawFg, bg) : rawFg

      const size = parseFloat(cs.fontSize)
      const weight = parseInt(cs.fontWeight, 10) || 400
      // "Texto grande" pela definição da WCAG: 24px, ou 18.66px se for bold.
      const isLarge = size >= 24 || (size >= 18.66 && weight >= 700)
      const required = isLarge ? 3 : 4.5
      const measured = ratio(fg, bg)

      const key = `${cs.color}|${size}|${weight}|${text.slice(0, 20)}`
      if (seen.has(key)) continue
      seen.add(key)

      if (measured < required) {
        out.push({
          text: text.slice(0, 45),
          color: cs.color,
          bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
          size: Math.round(size),
          weight,
          ratio: Math.round(measured * 100) / 100,
          required,
        })
      }
    }
    return out
  })

  await ctx.close()

  return {
    failures: violations.map(
      (v) =>
        `contraste ${v.ratio}:1 (exige ${v.required}) em ${v.size}px/${v.weight} ` +
        `"${v.text}" — ${v.color} sobre ${v.bg}`
    ),
    notes: [`${violations.length} reprovação(ões) de contraste`],
  }
}
