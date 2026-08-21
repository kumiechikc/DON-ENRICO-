"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
// O registro do ScrollTrigger acontece em lib/motion/use-reveal, importado por
// toda página que anima — aqui só consumimos.
import "@/lib/motion/use-reveal"
import { useMotion } from "@/lib/motion/motion-provider"
import { site } from "@/lib/site"

/*
 * O momento de respiro da página.
 *
 * Entre o cardápio e os congelados o site precisa parar de vender por alguns
 * segundos: sem isso são três mil pixels de card atrás de card, o que cansa e
 * achata tudo. Aqui a marca fala uma frase só, em escala que não cabe na tela,
 * e a rolagem arrasta a frase na horizontal.
 *
 * O deslize é feito com transform, não com rolagem real, para não criar barra
 * lateral nem sequestrar o gesto de quem só quer descer a página.
 */
export function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLParagraphElement>(null)
  const { motionEnabled } = useMotion()

  useEffect(() => {
    const section = sectionRef.current
    const line = lineRef.current
    if (!section || !line) return

    /*
     * O texto é mais largo que a tela de propósito, então precisa começar
     * CENTRADO — deslocado para a esquerda por metade do que sobra — e só então
     * derivar. A primeira versão partia do excedente inteiro e jogava a frase
     * para fora da tela: a seção virava um retângulo escuro vazio.
     */
    const centre = () => {
      const overflow = line.scrollWidth - section.clientWidth
      return overflow > 0 ? -overflow / 2 : 0
    }

    if (!motionEnabled) {
      gsap.set(line, { x: centre() })
      return
    }

    const ctx = gsap.context(() => {
      const mid = centre()
      /*
       * A deriva vale exatamente metade do excedente, de modo que a rolagem
       * percorre a frase de ponta a ponta: em x = 0 a primeira letra encosta na
       * borda esquerda, no outro extremo a última encosta na direita. Com uma
       * deriva menor as pontas nunca apareciam e ninguém chegava a ler a frase
       * inteira — o efeito ficava bonito e mudo.
       */
      const drift = Math.abs(mid)

      gsap.fromTo(
        line,
        { x: mid + drift },
        {
          x: mid - drift,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            // `scrub: 1` amarra ao scroll com leve atraso: a frase parece ter
            // massa em vez de grudar no pixel da barra de rolagem.
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [motionEnabled])

  return (
    <section
      ref={sectionRef}
      aria-label="Nosso lema"
      className="relative overflow-hidden border-y border-border py-24 md:py-40"
    >
      {/* Brasa distante ao fundo: liga esta pausa à luz do hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_50%,rgba(138,67,24,0.32)_0%,transparent_70%)]"
      />

      <p
        ref={lineRef}
        className="relative type-display text-[clamp(3rem,12vw,10rem)] text-fg whitespace-nowrap will-change-transform w-max"
      >
        {site.tagline}
      </p>
    </section>
  )
}
