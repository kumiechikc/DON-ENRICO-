/**
 * Orçamento de performance.
 *
 * Existe porque animação e WebGL cobram a conta em silêncio: o site continua
 * bonito na máquina de quem programou e trava no Android de quem compra. Os
 * limites abaixo são para 4G em aparelho intermediário, que é o público real de
 * um site de salgados em Porto Alegre.
 *
 * A rede é estrangulada de propósito — medir em rede local mede nada.
 */
const BUDGET = {
  /* JavaScript comprimido baixado até a página ficar utilizável. */
  jsGzipKb: 320,
  /* Maior elemento de conteúdo pintado. Acima de 2.5s o Google considera ruim. */
  lcpMs: 4000,
  /* Deslocamento acumulado de layout. Acima de 0.1 o conteúdo "pula". */
  cls: 0.1,
}

export async function checkPerformance(browser, url, { isDev = false } = {}) {
  const failures = []
  const notes = []

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    // Aproxima um celular intermediário, não o desktop de desenvolvimento.
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()

  // Estrangula a rede: 4G ruim, que é a condição real de quem abre o link no
  // WhatsApp na rua.
  const cdp = await ctx.newCDPSession(page)
  await cdp.send("Network.enable")
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  })
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })

  await page.goto(url, { waitUntil: "load" })

  // Espaço para o shader montar e as revelações assentarem.
  await page.waitForTimeout(3500)

  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      let lcp = 0
      let cls = 0

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            lcp = Math.max(lcp, entry.startTime)
          }
        }).observe({ type: "largest-contentful-paint", buffered: true })

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Deslocamento causado por interação do usuário não conta.
            if (!entry.hadRecentInput) cls += entry.value
          }
        }).observe({ type: "layout-shift", buffered: true })
      } catch {
        // Navegador sem os observadores: devolve o que der.
      }

      setTimeout(() => {
        /*
         * `encodedBodySize` é o que realmente viaja pela rede, já comprimido —
         * a versão anterior somava o tamanho descomprimido e acusava mais que o
         * dobro do peso real, o que tornava o orçamento sem sentido.
         */
        const jsBytes = performance
          .getEntriesByType("resource")
          .filter((r) => r.initiatorType === "script" || /\.js(\?|$)/.test(r.name))
          .reduce((sum, r) => sum + (r.encodedBodySize || 0), 0)

        resolve({
          lcp: Math.round(lcp),
          cls: Math.round(cls * 1000) / 1000,
          jsBytes,
        })
      }, 600)
    })
  })

  const jsKb = Math.round(vitals.jsBytes / 1024)

  notes.push(`JavaScript transferido: ${jsKb} KB (orçamento ${BUDGET.jsGzipKb} KB)`)
  notes.push(`LCP: ${vitals.lcp} ms (orçamento ${BUDGET.lcpMs} ms, CPU 4x lenta, 4G)`)
  notes.push(`CLS: ${vitals.cls} (orçamento ${BUDGET.cls})`)

  /*
   * O orçamento de JavaScript só vale contra build de produção: o servidor de
   * desenvolvimento entrega módulos sem minificar nem empacotar, e o número
   * chega a triplicar. Reprovar ali seria alarme falso — e um alarme falso
   * recorrente é o jeito mais rápido de treinar todo mundo a ignorar a suíte.
   */
  if (isDev) {
    notes.push(
      "  (servidor de desenvolvimento: o orçamento de JavaScript não se aplica — rode contra `npm run build` + `npm start` para o número real)"
    )
  } else if (jsKb > BUDGET.jsGzipKb) {
    failures.push(`JavaScript acima do orçamento: ${jsKb} KB > ${BUDGET.jsGzipKb} KB`)
  }
  if (vitals.lcp > BUDGET.lcpMs) {
    failures.push(`LCP acima do orçamento: ${vitals.lcp} ms > ${BUDGET.lcpMs} ms`)
  }
  if (vitals.cls > BUDGET.cls) {
    failures.push(`CLS acima do orçamento: ${vitals.cls} > ${BUDGET.cls}`)
  }

  await ctx.close()
  return { failures, notes }
}
