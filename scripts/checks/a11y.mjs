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

    /*
     * O nome acessível do h1 precisa fazer sentido lido em voz alta. Quando a
     * animação de texto assume o título, ela troca o conteúdo por um elemento
     * por caractere e depende de um aria-label — e uma primeira versão montava
     * esse rótulo com textContent, que ignora o <br> e produzia
     * "Salgadospara festa". Palavras coladas é o sintoma a procurar.
     */
    const h1 = h1s[0]
    if (h1) {
      const nome = (h1.getAttribute("aria-label") || h1.textContent || "").trim()
      if (!nome) {
        problems.push("h1 sem nome acessível")
      } else if (/[a-záéíóúâêôãõç][A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(nome)) {
        problems.push(`nome acessível do h1 com palavras coladas: "${nome}"`)
      }
    }

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

  /*
   * Modalidade dos diálogos.
   *
   * Prender o Tab não basta: sem marcar o fundo como `inert`, quem usa leitor
   * de tela continua percorrendo o rodapé e o cardápio por trás de um menu
   * aberto, como se a página estivesse normal. Este teste existe porque a
   * lacuna passou despercebida na primeira implementação.
   */
  await page.getByRole("button", { name: "Abrir menu" }).click()
  await page.waitForTimeout(400)

  const modalidade = await page.evaluate(() => {
    const rodape = document.querySelector("footer")
    const link = rodape?.querySelector("a")
    link?.focus()
    return {
      abriu: !!document.querySelector('[role="dialog"][aria-label="Menu"]'),
      mainInerte: document.querySelector("main")?.hasAttribute("inert") ?? false,
      rodapeInerte: rodape?.hasAttribute("inert") ?? false,
      fundoRecebeFoco: document.activeElement === link,
    }
  })

  if (!modalidade.abriu) {
    failures.push("menu do celular não abriu")
  } else {
    if (!modalidade.mainInerte || !modalidade.rodapeInerte) {
      failures.push(
        "diálogo aberto sem marcar o fundo como inert — leitor de tela ainda percorre a página atrás"
      )
    }
    if (modalidade.fundoRecebeFoco) {
      failures.push("elemento do fundo ainda recebe foco com o diálogo aberto")
    }
  }
  notes.push(
    `diálogo isola o fundo: ${
      modalidade.mainInerte && modalidade.rodapeInerte && !modalidade.fundoRecebeFoco
        ? "ok"
        : "FALHA"
    }`
  )

  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
  const restaurado = await page.evaluate(
    () => !document.querySelector("main")?.hasAttribute("inert")
  )
  if (!restaurado) failures.push("inert não foi removido ao fechar o diálogo")

  /*
   * Jornada completa por teclado.
   *
   * Testar peças isoladas não pega o que só aparece percorrendo tudo: um laço
   * que prende o foco, um elemento focável escondido, ou uma parada sem
   * contorno visível no meio da página.
   *
   * Elementos do Next em desenvolvimento (portal de devtools, anunciador de
   * rota) são excluídos: são do ambiente, não do site, e reprovariam todo build
   * local sem apontar nenhum defeito real.
   */
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(1500)

  const paradas = []
  let anterior = ""
  let repetidas = 0
  let preso = null

  for (let i = 0; i < 250; i++) {
    await page.keyboard.press("Tab")
    const atual = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const nome = el.tagName
      // Infra do Next em dev, não faz parte do site.
      if (nome.startsWith("NEXTJS-") || nome.startsWith("NEXT-ROUTE")) {
        return { ignorar: true }
      }
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        tag: nome,
        rotulo: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
        visivel: r.width > 0 && r.height > 0,
        contorno: parseFloat(cs.outlineWidth) || 0,
      }
    })

    if (!atual) break
    if (atual.ignorar) continue

    const chave = `${atual.tag}|${atual.rotulo}`
    if (chave === anterior) {
      repetidas++
      if (repetidas > 3) {
        preso = chave
        break
      }
    } else {
      repetidas = 0
    }
    anterior = chave
    paradas.push(atual)
  }

  if (preso) {
    failures.push(`foco preso em laço em "${preso}"`)
  }
  if (paradas.length < 20) {
    failures.push(`só ${paradas.length} paradas de teclado — a página deveria ter dezenas`)
  }

  const invisiveis = paradas.filter((s) => !s.visivel)
  if (invisiveis.length > 0) {
    failures.push(
      `${invisiveis.length} parada(s) de teclado invisível(is): ${invisiveis
        .slice(0, 3)
        .map((s) => `"${s.rotulo}"`)
        .join(", ")}`
    )
  }

  const semContorno = paradas.filter((s) => s.contorno < 1)
  if (semContorno.length > 0) {
    failures.push(
      `${semContorno.length} parada(s) sem contorno de foco: ${semContorno
        .slice(0, 3)
        .map((s) => `"${s.rotulo}"`)
        .join(", ")}`
    )
  }

  const primeira = paradas[0]
  if (primeira && !/pular/i.test(primeira.rotulo)) {
    failures.push(`a primeira parada de teclado é "${primeira.rotulo}", não o atalho de pular`)
  }

  notes.push(
    `jornada por teclado: ${paradas.length} paradas, sem laço, todas visíveis e com contorno`
  )

  await ctx.close()
  return { failures, notes }
}
