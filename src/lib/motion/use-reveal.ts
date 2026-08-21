"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useMotion } from "./motion-provider"

/*
 * Registro no nível do módulo, não dentro do provider.
 *
 * React roda os efeitos de baixo para cima: o efeito de um card filho executa
 * ANTES do efeito do MotionProvider. Registrar o plugin lá deixava as primeiras
 * revelações chamando `scrollTrigger` com o plugin ainda ausente, e o GSAP
 * apenas avisava no console e ignorava a animação. Aqui o registro acontece
 * quando o módulo é importado, antes de qualquer efeito. `registerPlugin` é
 * idempotente, então repetir não custa nada.
 */
gsap.registerPlugin(ScrollTrigger)

type RevealKind = "fade" | "rise" | "stagger" | "mask"

/*
 * Revelação por scroll com um contrato importante: o elemento começa com
 * `opacity: 0` via CSS (`[data-reveal]`), e este hook é responsável por
 * devolvê-lo à visibilidade. Quando o movimento está desligado, a folha de
 * estilo já força opacidade 1 — então nada aqui precisa rodar e o conteúdo
 * nunca fica preso invisível.
 *
 * Os valores seguem os presets medidos do ui-ux-pro-max: deslocamento pequeno
 * (12–28px) para ler como aparição e não como deslize, e `expo.out`/`power3.out`
 * porque desaceleração acentuada é o que dá sensação de peso.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  kind: RevealKind = "rise",
  options: { delay?: number; start?: string } = {}
) {
  const ref = useRef<T>(null)
  const { motionEnabled } = useMotion()
  const { delay = 0, start = "top 85%" } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!motionEnabled) {
      gsap.set(el, { clearProps: "all", opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const common = {
        scrollTrigger: { trigger: el, start, once: true },
        delay,
      }

      if (kind === "stagger") {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            // Acima de ~8 filhos o último item parece atrasado; o teto mantém a
            // cascata legível mesmo em listas longas.
            stagger: { each: 0.06, amount: Math.min(0.48, el.children.length * 0.06) },
            ease: "power3.out",
            ...common,
          }
        )
        gsap.set(el, { opacity: 1 })
        return
      }

      if (kind === "mask") {
        // Sobe por trás de uma máscara: o texto surge como se fosse impresso.
        gsap.fromTo(
          el,
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.95, ease: "expo.out", ...common }
        )
        return
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: kind === "fade" ? 0 : 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", ...common }
      )
    }, el)

    return () => ctx.revert()
  }, [motionEnabled, kind, delay, start])

  return ref
}
