/**
 * Fluxo do pedido de ponta a ponta, que é a única coisa no site que precisa
 * funcionar: escolher faixa e sabores, adicionar, e sair com a mensagem certa
 * no WhatsApp. Roda em 375px porque é onde o cliente real abre.
 *
 * Também cobre o que quebra sem ninguém perceber: o limite de sabores, o
 * fechamento por Esc e a persistência entre recarregamentos.
 */
export async function checkOrderFlow(browser, url, { screenshotDir } = {}) {
  const failures = []
  const notes = []

  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const page = await ctx.newPage()
  const runtimeErrors = []
  page.on("pageerror", (e) => runtimeErrors.push(e.message))

  await page.goto(url, { waitUntil: "networkidle" })

  const card = page.locator("#festa .bg-surface").first()
  const pressables = await card.locator("button[aria-pressed]").all()
  const TIER_BUTTONS = 2
  const firstFlavor = pressables[TIER_BUTTONS]
  const secondFlavor = pressables[TIER_BUTTONS + 1]
  const thirdFlavor = pressables[TIER_BUTTONS + 2]

  // Botão de adicionar sem sabor escolhido deve guiar, nunca ficar inerte.
  const addButton = card.getByRole("button", { name: /Adicionar —/ })
  if (await addButton.isDisabled()) {
    failures.push("botão adicionar começa desabilitado — vira beco sem saída")
  }
  await addButton.click()
  const hintVisible = await card.getByText(/Escolha .* antes de adicionar/).isVisible()
  if (!hintVisible) {
    failures.push("adicionar sem sabor não mostra aviso nem leva à escolha")
  }
  notes.push(`aviso ao adicionar sem sabor: ${hintVisible ? "ok" : "FALTA"}`)

  // Faixa de 100 unidades e dois sabores.
  await card.getByRole("button", { name: /100 un/ }).click()
  await firstFlavor.click()
  await secondFlavor.click()

  const thirdBlocked = await thirdFlavor.isDisabled()
  if (!thirdBlocked) failures.push("limite de sabores não bloqueia o terceiro chip")
  notes.push(`limite de 2 sabores bloqueia o 3o: ${thirdBlocked ? "ok" : "FALHA"}`)

  await addButton.click()
  await page.waitForTimeout(250)

  // A mensagem precisa sair com os sabores; sem isso o pedido chega incompleto.
  await page.getByRole("button", { name: /Abrir pedido/ }).click()
  await page.waitForTimeout(250)

  const waLink = page.getByRole("link", { name: /Enviar pelo WhatsApp/ })
  const href = (await waLink.getAttribute("href")) || ""
  const message = decodeURIComponent(href.split("text=")[1] || "")

  if (!message.includes("Sabores:")) {
    failures.push("mensagem do WhatsApp sai sem os sabores escolhidos")
  }
  if (!message.includes("Total:")) {
    failures.push("mensagem do WhatsApp sai sem o total")
  }
  notes.push("mensagem gerada:\n" + message.split("\n").map((l) => `      | ${l}`).join("\n"))

  if (screenshotDir) {
    await page.screenshot({ path: `${screenshotDir}/carrinho.png` })
  }

  // Esc precisa fechar o diálogo do carrinho.
  await page.keyboard.press("Escape")
  await page.waitForTimeout(200)
  const drawerClosed =
    (await page.getByRole("dialog", { name: "Seu pedido" }).count()) === 0
  if (!drawerClosed) failures.push("Esc não fecha o carrinho")
  notes.push(`Esc fecha o carrinho: ${drawerClosed ? "ok" : "FALHA"}`)

  // O pedido tem que sobreviver a um recarregamento.
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  const badgeAfterReload = await page
    .getByRole("button", { name: /Abrir pedido — 1 item/ })
    .count()
  if (badgeAfterReload === 0) {
    failures.push("pedido não sobrevive ao recarregar a página")
  }
  notes.push(`pedido persiste ao recarregar: ${badgeAfterReload > 0 ? "ok" : "FALHA"}`)

  if (runtimeErrors.length > 0) {
    failures.push(`erro de runtime no fluxo: ${runtimeErrors.slice(0, 3).join(" | ")}`)
  }

  await ctx.close()
  return { failures, notes }
}
