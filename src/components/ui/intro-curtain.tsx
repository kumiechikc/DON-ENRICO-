"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useMotion } from "@/lib/motion/motion-provider"

/*
 * Cortina de entrada.
 *
 * O risco desta técnica é atrasar o conteúdo para exibir uma animação de
 * vaidade. Duas escolhas evitam isso:
 *
 * — a cortina cobre uma página que JÁ está montada e legível por baixo; ela não
 *   segura carregamento nem bloqueia rolagem por mais de meio segundo;
 * — some sozinha em ~0,9s no total e não volta a aparecer na navegação interna.
 *
 * Quem chega do Instagram querendo ver preço não pode esperar. Por isso ela
 * também não existe quando o movimento está desligado: nesse caso o componente
 * não renderiza nada.
 */
export function IntroCurtain() {
  const curtainRef = useRef<HTMLDivElement>(null)
  const { motionEnabled } = useMotion()

  useEffect(() => {
    const curtain = curtainRef.current
    if (!curtain || !motionEnabled) return

    // Trava a rolagem só durante a cortina, para o gesto não brigar com ela.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = previousOverflow
        curtain.remove()
      },
    })

    tl.to(curtain.querySelector("[data-curtain-mark]"), {
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
    })
      .to(curtain.querySelector("[data-curtain-mark]"), {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      })
      // Sobe como uma persiana em vez de simplesmente sumir: o gesto vertical
      // conversa com a rolagem que vem logo depois.
      .to(curtain, {
        yPercent: -100,
        duration: 0.62,
        ease: "expo.inOut",
      })

    return () => {
      tl.kill()
      document.body.style.overflow = previousOverflow
    }
  }, [motionEnabled])

  if (!motionEnabled) return null

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9997] bg-bg flex items-center justify-center"
    >
      <span
        data-curtain-mark
        className="type-display text-2xl md:text-4xl text-amber opacity-0"
      >
        Don Enrico
      </span>
    </div>
  )
}
