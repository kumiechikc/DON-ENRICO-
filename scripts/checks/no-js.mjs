/**
 * O site sem JavaScript.
 *
 * Existe porque este projeto já quebrou exatamente aqui: os elementos marcados
 * para revelação começam com `opacity: 0` e dependem de alguém devolvê-los.
 * Havia uma regra `html.no-js` para esse caso, mas nada nunca adicionava a
 * classe — com o JavaScript desligado, doze elementos ficavam invisíveis,
 * incluindo todos os cards do cardápio e os títulos de seção. Página em branco
 * num site cujo conteúdo É o cardápio.
 *
 * Não é cenário exótico: extensão de bloqueio, rede que corta o bundle, ou
 * navegador de operadora com script desativado produzem o mesmo resultado.
 */
export async function checkNoJs(browser, url) {
  const failures = []
  const notes = []

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: false,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "load" })
  await page.waitForTimeout(600)

  const invisiveis = await page.$$eval("[data-reveal]", (els) =>
    els
      .map((e) => ({
        cls: String(e.className).slice(0, 40),
        opacidade: getComputedStyle(e).opacity,
      }))
      .filter((x) => parseFloat(x.opacidade) < 0.99)
  )

  if (invisiveis.length > 0) {
    failures.push(
      `${invisiveis.length} elemento(s) invisível(is) sem JavaScript: ` +
        invisiveis
          .slice(0, 3)
          .map((e) => `"${e.cls}"`)
          .join(", ")
    )
  }

  // O conteúdo essencial precisa estar no HTML, não montado por script.
  const conteudo = await page.evaluate(() => ({
    titulo: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? "",
    temPrecos: /R\$/.test(document.body.textContent ?? ""),
    temWhatsApp: !!document.querySelector('a[href*="wa.me"]'),
    altura: document.body.scrollHeight,
  }))

  if (!conteudo.temPrecos) failures.push("nenhum preço visível sem JavaScript")
  if (!conteudo.temWhatsApp) failures.push("nenhum link de WhatsApp sem JavaScript")
  if (conteudo.altura < 2000) {
    failures.push(`página com só ${conteudo.altura}px sem JavaScript — conteúdo faltando`)
  }

  notes.push(
    `sem JavaScript: ${conteudo.altura}px de página, preços e WhatsApp presentes, ` +
      `${invisiveis.length} elemento(s) invisível(is)`
  )

  await ctx.close()
  return { failures, notes }
}
