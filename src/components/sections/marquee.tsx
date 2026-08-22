"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useMotion } from "@/lib/motion/motion-provider"

/*
 * Faixa de sabores correndo de ponta a ponta, quebrando o ritmo entre seções.
 *
 * Dois detalhes que separam isto de um marquee de template:
 *
 * 1. A direção e a velocidade respondem à rolagem. Rolando para baixo a faixa
 *    acelera para a esquerda; rolando para cima ela inverte. O olho percebe que
 *    a página reage, mesmo sem saber explicar o quê.
 * 2. O conteúdo é duplicado e a animação usa `modifiers` para embrulhar a
 *    posição, o que dá um laço infinito sem salto — a alternativa ingênua
 *    (reiniciar em 0) produz um piscar visível a cada volta.
 *
 * Sem movimento, vira uma faixa estática legível com os mesmos sabores.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O LAÇO E A REAÇÃO À ROLAGEM SÃO DUAS COISAS, E CUSTAM DIFERENTE.
 *
 * O laço é uma `transform` num elemento com `will-change`: composta na GPU, sem
 * medir layout, barata em qualquer aparelho. A reação à rolagem é ScrollTrigger,
 * que mede a cada evento e é o que pesa.
 *
 * A primeira versão amarrava as duas ao mesmo `motionEnabled`, e no celular do
 * dono do site a esteira ficava parada — desligada junto com o que era caro,
 * sem precisar. Agora o laço roda com `lacosLeves`, e só o detalhe reativo
 * espera o `motionEnabled`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { motionEnabled, lacosLeves } = useMotion()

  useEffect(() => {
    const track = trackRef.current
    if (!track || !lacosLeves) return

    const ctx = gsap.context(() => {
      // Metade da largura porque o conteúdo está duplicado: ao percorrer uma
      // cópia inteira, a segunda já ocupa exatamente o mesmo lugar da primeira.
      const half = track.scrollWidth / 2
      const wrap = gsap.utils.wrap(-half, 0)

      const tween = gsap.to(track, {
        x: -half,
        duration: 28,
        ease: "none",
        repeat: -1,
        modifiers: { x: (value) => `${wrap(parseFloat(value))}px` },
      })

      /*
       * O detalhe reativo é o único pedaço caro, e fica de fora no aparelho
       * fraco: quem tem pouco a gastar recebe a esteira correndo, que é o que
       * importa, sem o ScrollTrigger medindo layout a cada evento de rolagem.
       */
      if (!motionEnabled) return () => tween.kill()

      // A rolagem empurra a faixa: velocidade e sentido acompanham o gesto.
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const direction = self.direction
          gsap.to(tween, {
            timeScale: direction === 1 ? 1 : -1,
            duration: 0.4,
            overwrite: true,
          })
        },
      })

      return () => {
        st.kill()
        tween.kill()
      }
    }, track)

    return () => ctx.revert()
  }, [motionEnabled, lacosLeves])

  // Duplicado para o laço não ter emenda. A segunda cópia é decorativa: quem usa
  // leitor de tela não deve ouvir a lista dos sabores duas vezes.
  return (
    <div className="relative border-y border-border bg-surface overflow-hidden py-5 md:py-7">
      {/* Marca a faixa para a conferência que cobra que ela ande. */}
      <div ref={trackRef} data-esteira className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0"
            aria-hidden={copy === 1 ? "true" : undefined}
          >
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 md:gap-12 px-4 md:px-6 whitespace-nowrap"
              >
                <span className="type-display text-xl md:text-3xl text-fg-muted">
                  {item}
                </span>
                <span className="text-amber text-lg md:text-2xl" aria-hidden="true">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
