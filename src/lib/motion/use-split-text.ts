"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"
import { useMotion } from "./motion-provider"

/*
 * Tipografia cinética no título principal.
 *
 * Duas armadilhas conhecidas desta técnica, tratadas aqui:
 *
 * 1. Acessibilidade e SEO. O SplitText troca o texto por um elemento por
 *    caractere, o que confunde leitor de tela e rastreador. A solução é marcar
 *    o container com aria-label contendo a frase inteira e esconder os
 *    fragmentos, e chamar `revert()` na limpeza para devolver o nó original.
 *
 *    A frase vem por parâmetro, não do DOM. Tentar deduzi-la lendo o elemento
 *    falhou de duas maneiras: `textContent` ignora o <br> e produzia
 *    "Salgadospara festa", e depois que o SplitText assume, o elemento já não
 *    contém o texto original para reler. O componente sabe o que escreveu —
 *    ele diz, em vez de o hook adivinhar.
 *
 * 2. Layout shift. Dividir texto antes da fonte carregar mede a largura errada
 *    e a linha reflui quando a fonte chega — o que arruína o CLS. Por isso a
 *    divisão só acontece depois de `document.fonts.ready`.
 */
export function useSplitReveal<T extends HTMLElement = HTMLHeadingElement>(
  options: { delay?: number; enabled?: boolean; label: string }
) {
  const ref = useRef<T>(null)
  const { motionEnabled } = useMotion()
  const { delay = 0, enabled = true, label } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!motionEnabled || !enabled) {
      gsap.set(el, { opacity: 1 })
      return
    }

    let split: SplitText | null = null
    let cancelled = false

    gsap.registerPlugin(SplitText)

    const run = async () => {
      // Esperar a fonte evita dividir com métricas da fonte de fallback.
      try {
        await document.fonts.ready
      } catch {
        // Navegador sem a API: seguimos assim mesmo.
      }
      if (cancelled || !ref.current) return

      split = new SplitText(el, {
        type: "lines,chars",
        linesClass: "overflow-hidden",
        /*
         * `aria: "none"` desliga a acessibilidade automática do SplitText.
         *
         * Ele monta o próprio aria-label com `element.textContent`, que ignora
         * o <br> e produzia "Salgadospara festa" — o mesmo defeito que este
         * hook tentava corrigir. Como o SplitText roda depois, ele sobrescrevia
         * a correção em silêncio. Com a opção desligada, o rótulo abaixo é o
         * único que existe.
         */
        aria: "none",
      })

      // Definido DEPOIS da divisão, para o SplitText não sobrescrever.
      el.setAttribute("aria-label", label)

      // Os fragmentos são decoração: o texto acessível está no aria-label.
      split.chars.forEach((c) => c.setAttribute("aria-hidden", "true"))

      gsap.set(el, { opacity: 1 })
      gsap.from(split.chars, {
        yPercent: 118,
        opacity: 0,
        duration: 1.0,
        // Cascata bem curta por caractere: dá a sensação de carimbo caindo,
        // não de letra por letra sendo digitada.
        stagger: 0.022,
        ease: "expo.out",
        delay,
      })
    }

    run()

    return () => {
      cancelled = true
      split?.revert()
      el.removeAttribute("aria-label")
    }
  }, [motionEnabled, delay, enabled, label])

  return ref
}
