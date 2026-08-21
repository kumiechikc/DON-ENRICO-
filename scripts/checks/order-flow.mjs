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

  /*
   * Troca o envio de verdade por um espião. Sem isto o clique dispararia uma
   * requisição para fora, e o que interessa não é se ela sai — é o que ela
   * levaria.
   */
  await page.evaluate(() => {
    window.__enviados = []
    navigator.sendBeacon = (endereco, corpo) => {
      window.__enviados.push({ endereco, corpo })
      return true
    }
  })

  if (!message.includes("Sabores:")) {
    failures.push("mensagem do WhatsApp sai sem os sabores escolhidos")
  }
  if (!message.includes("Total:")) {
    failures.push("mensagem do WhatsApp sai sem o total")
  }
  notes.push("mensagem gerada:\n" + message.split("\n").map((l) => `      | ${l}`).join("\n"))

  /*
   * O que vai para a planilha.
   *
   * O clique abre o WhatsApp numa aba nova, então o `noWaitAfter` impede o
   * Playwright de ficar esperando uma navegação que não acontece nesta página.
   */
  const rodape =
    (await page.getByText(/O pedido abre no WhatsApp/).textContent()) || ""
  // O código do pedido só aparece no rodapé quando o registro está configurado;
  // é o sinal visível ao usuário, e portanto o certo para um teste de navegador.
  const registroLigado = /Código #/.test(rodape)

  await waLink.click({ noWaitAfter: true })
  await page.waitForTimeout(250)

  const enviados = await page.evaluate(async () => {
    const lista = window.__enviados || []
    return Promise.all(
      lista.map(async (e) => ({ endereco: e.endereco, corpo: await e.corpo.text() }))
    )
  })

  /*
   * O envio para a planilha é decidido em tempo de build: sem
   * NEXT_PUBLIC_REGISTRO_URL o código não entra no pacote. Então a suíte
   * confere o que o build à frente dela realmente faz, em vez de exigir uma
   * configuração — rodar contra o site publicado, onde o registro pode estar
   * desligado de propósito, é um uso legítimo.
   *
   * Nos dois caminhos há uma afirmação de verdade: com o registro ligado, um
   * envio com o conteúdo certo; desligado, nenhum envio. O que não pode
   * acontecer é a conferência sumir em silêncio, então o modo aparece no
   * relatório.
   */
  if (!registroLigado) {
    if (enviados.length !== 0) {
      failures.push(
        `o registro está desligado neste build mas houve ${enviados.length} envio(s)`
      )
    }
    notes.push("registro na planilha: desligado neste build (nada foi conferido)")
  } else if (enviados.length !== 1) {
    failures.push(`o pedido deveria ser registrado uma vez, foram ${enviados.length}`)
  } else {
    const enviado = JSON.parse(enviados[0].corpo)
    const codigoNaMensagem = (message.match(/#([A-Z0-9]{4})/) || [])[1]

    if (enviado.codigo !== codigoNaMensagem) {
      failures.push(
        `o código do registro (${enviado.codigo}) não bate com o da mensagem (${codigoNaMensagem})`
      )
    }
    if (!Array.isArray(enviado.itens) || enviado.itens.length !== 1) {
      failures.push("o registro não levou exatamente o item do pedido")
    } else {
      const item = enviado.itens[0]
      if (item.sku !== "classicos-fritos-100") {
        failures.push(`SKU errado no registro: ${item.sku}`)
      }
      if (item.pacotes !== 1) failures.push(`quantidade errada no registro: ${item.pacotes}`)
      if ((item.sabores || []).length !== 2) {
        failures.push("o registro foi sem os sabores escolhidos")
      }
    }
    /*
     * Preço e total não podem sair daqui: a planilha recalcula pelo SKU, e
     * mandar valor de um endpoint público seria oferecer um número forjável
     * onde não precisa haver nenhum.
     */
    const cru = enviados[0].corpo
    if (/"pre[çc]o"|"total"|"price"/i.test(cru)) {
      failures.push("o registro está enviando preço — a planilha é que calcula")
    }
    notes.push(
      `registro na planilha: código ${enviado.codigo}, ` +
        `${enviado.itens.length} item, sem preço no envio`
    )
  }

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

  /*
   * Pedido misto.
   *
   * A verificação acima cobre um item só, e um item é o caso fácil: erro de
   * soma, de multiplicação por quantidade ou de linha duplicada só aparece com
   * o carrinho cheio. Esta parte monta um pedido com os três tipos de produto,
   * repete um deles para exercitar a quantidade, e confere o total da mensagem
   * contra a soma calculada a partir do carrinho.
   */
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
  await page.evaluate(() => localStorage.removeItem("don-enrico-cart"))
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(1200)

  const primeiraFesta = page.locator("#festa .bg-surface").first()
  const chipsFesta = await primeiraFesta.locator("button[aria-pressed]").all()
  await primeiraFesta.getByRole("button", { name: /100 un/ }).click()
  await chipsFesta[TIER_BUTTONS].click()
  await chipsFesta[TIER_BUTTONS + 1].click()
  await primeiraFesta.getByRole("button", { name: /Adicionar —/ }).click()
  await page.waitForTimeout(250)

  const boxCard = page.locator("#box .bg-surface").first()
  const chipsBox = await boxCard.locator("button[aria-pressed]").all()
  await chipsBox[TIER_BUTTONS].click()
  await boxCard.getByRole("button", { name: /Adicionar —/ }).click()
  await page.waitForTimeout(250)

  // Um congelado adicionado duas vezes: exercita a multiplicação por quantidade.
  const congelados = page.locator("#congelados li")
  await congelados.nth(0).getByRole("button").click()
  await page.waitForTimeout(150)
  await congelados.nth(0).getByRole("button").click()
  await page.waitForTimeout(400)

  await page.getByRole("button", { name: /Abrir pedido/ }).click()
  await page.waitForTimeout(400)

  const hrefMisto =
    (await page.getByRole("link", { name: /Enviar pelo WhatsApp/ }).getAttribute("href")) || ""
  const msgMista = decodeURIComponent(hrefMisto.split("text=")[1] || "")

  const carrinho = await page.evaluate(() => {
    const bruto = localStorage.getItem("don-enrico-cart")
    const itens = JSON.parse(bruto || "[]")
    return {
      linhas: itens.length,
      soma: itens.reduce((s, i) => s + i.price * i.quantity, 0),
      temQuantidadeDupla: itens.some((i) => i.quantity === 2),
    }
  })

  const totalNaMensagem = parseFloat(
    (msgMista.match(/Total: R\$ ([\d.,]+)/) || [])[1]?.replace(/\./g, "").replace(",", ".") ??
      "NaN"
  )

  if (carrinho.linhas < 3) {
    failures.push(`pedido misto ficou com ${carrinho.linhas} linhas, esperado ao menos 3`)
  }
  if (!carrinho.temQuantidadeDupla) {
    failures.push("adicionar o mesmo congelado duas vezes não somou a quantidade")
  }
  if (!Number.isFinite(totalNaMensagem)) {
    failures.push("não foi possível ler o total na mensagem do pedido misto")
  } else if (Math.abs(totalNaMensagem - carrinho.soma) > 0.01) {
    failures.push(
      `total da mensagem (${totalNaMensagem}) diverge da soma dos itens (${carrinho.soma})`
    )
  }

  notes.push(
    `pedido misto: ${carrinho.linhas} linhas, total R$ ${carrinho.soma.toFixed(2)} — ${
      Math.abs(totalNaMensagem - carrinho.soma) <= 0.01 ? "confere" : "DIVERGE"
    }`
  )

  if (runtimeErrors.length > 0) {
    failures.push(`erro de runtime no fluxo: ${runtimeErrors.slice(0, 3).join(" | ")}`)
  }

  await ctx.close()
  return { failures, notes }
}
