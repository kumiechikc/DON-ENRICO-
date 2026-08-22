"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ArrowDown } from "lucide-react"
import { useMotion } from "@/lib/motion/motion-provider"
import { useSplitReveal } from "@/lib/motion/use-split-text"
import { getWhatsAppDirectUrl } from "@/lib/cart/whatsapp"
import { boxDegustacao, festaCategories } from "@/lib/data/menu"
import { formatPrice } from "@/lib/utils"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { CinemaLoop } from "@/components/media/cinema-loop"
import { acharClipe } from "@/lib/media/clipes"

/*
 * O shader entra por import dinâmico e sem SSR: WebGL não existe no servidor, e
 * mantê-lo fora do bundle inicial deixa o primeiro pixel da página aparecer sem
 * esperar por ele.
 */
const HeatShader = dynamic(() => import("./heat-shader"), {
  ssr: false,
  loading: () => null,
})

export function HeroSection() {
  const { motionEnabled } = useMotion()
  /*
   * Queda em três níveis, do melhor para o que sempre funciona:
   *
   *   1. o clipe, quando existe no manifesto;
   *   2. o shader de calor, que é WebGL e não precisa de arquivo nenhum;
   *   3. o gradiente em CSS, que funciona até sem JavaScript.
   *
   * A escolha é feita aqui e não dentro do CinemaLoop porque o shader custa
   * bateria: rodar os dois ao mesmo tempo seria pagar duas vezes pelo mesmo
   * fundo.
   */
  const clipeDoHero = acharClipe("lampada")
  const titleRef = useSplitReveal<HTMLHeadingElement>({
    delay: 0.35,
    label: "Salgados para festa",
  })
  const supportRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<HTMLDivElement>(null)

  /*
   * O shader só monta depois que a página assentou. Disputar CPU com a
   * hidratação do React atrasa o momento em que a página fica interativa, e o
   * fundo é decoração — pode chegar meio segundo depois sem ninguém notar.
   */
  const [shaderReady, setShaderReady] = useState(false)
  useEffect(() => {
    if (!motionEnabled) return
    const id = window.setTimeout(() => setShaderReady(true), 450)
    return () => window.clearTimeout(id)
  }, [motionEnabled])

  useEffect(() => {
    if (!motionEnabled) return
    const ctx = gsap.context(() => {
      gsap.from([supportRef.current, indexRef.current], {
        opacity: 0,
        y: 26,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.85,
      })
    })
    return () => ctx.revert()
  }, [motionEnabled])

  const entryPrice = Math.min(...boxDegustacao.tiers.map((t) => t.price))
  const priceIndex = festaCategories.map((c) => ({
    name: c.name,
    from: Math.min(...c.tiers.map((t) => t.price)),
  }))

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
      {/* Camada 1 — a luz. O gradiente é o estado base: se o shader não rodar
          (aparelho fraco, movimento desligado), a cena continua sendo uma
          fritadeira acesa na sombra, não um retângulo preto. */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(125%_90%_at_50%_118%,#8A4318_0%,#3A1809_42%,#120B08_76%)]">
        {clipeDoHero ? (
          <CinemaLoop clipe="lampada" preencher className="absolute inset-0" />
        ) : (
          shaderReady && <HeatShader />
        )}
      </div>

      {/* Camada 2 — véu direcional. Escurece onde o texto pousa (embaixo à
          esquerda) e deixa a luz respirar no resto. Um véu uniforme e opaco
          apagaria o shader inteiro, que foi o primeiro erro desta composição. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(105deg,rgba(18,11,8,0.86)_0%,rgba(18,11,8,0.55)_42%,rgba(18,11,8,0.12)_78%)]"
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 pb-14 md:pb-20 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-20 items-end">
          <div>
            <p className="type-label text-[0.68rem] sm:text-xs text-amber mb-6 sm:mb-8">
              Porto Alegre · O sabor que impõe respeito
            </p>

            <h1
              ref={titleRef}
              /*
                O título tem duas linhas e `line-height: 0.88`, então reservar
                1.76em garante a mesma altura antes e depois da fonte chegar.
                Sem isso a troca do Archivo Black remedia o bloco e empurrava
                tudo abaixo em 813px — sozinho, todo o CLS da página.
              */
              className="type-display text-[clamp(2.6rem,8vw,7rem)] text-fg opacity-0 whitespace-nowrap min-h-[1.76em]"
            >
              Salgados
              <br />
              para festa
            </h1>

            <div ref={supportRef} className="mt-9 sm:mt-11 max-w-lg">
              <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
                Fritos, assados e folhados feitos por encomenda. Box degustação a
                partir de{" "}
                <strong className="text-amber font-bold">
                  {formatPrice(entryPrice)}
                </strong>
                .
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <MagneticButton
                  as="a"
                  href="#festa"
                  className="inline-flex items-center justify-center min-h-[3.5rem] px-9 bg-amber text-bg font-bold text-sm uppercase tracking-[0.14em] whitespace-nowrap"
                >
                  Montar meu pedido
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href={getWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center min-h-[3.5rem] px-9 border border-border-strong text-fg font-bold text-sm uppercase tracking-[0.14em] whitespace-nowrap hover:border-amber hover:text-amber transition-colors duration-300"
                >
                  Falar no WhatsApp
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Quadro de preços: informação real ocupando a metade direita, no
              lugar do vazio que a composição teria sem foto. */}
          <div ref={indexRef} className="lg:w-80 lg:pb-2">
            <p className="type-label text-[0.62rem] text-fg-muted pb-4 border-b border-border-strong">
              Linhas para festa
            </p>
            <ul>
              {priceIndex.map((line) => (
                <li
                  key={line.name}
                  className="flex items-baseline justify-between gap-4 py-3 border-b border-border"
                >
                  <span className="text-sm text-fg">{line.name}</span>
                  <span className="text-sm text-fg-muted tabular-nums whitespace-nowrap">
                    desde{" "}
                    <strong className="text-amber font-bold">
                      {formatPrice(line.from)}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-fg-muted">
              Pacotes de 50 ou 100 unidades.
            </p>
          </div>
        </div>

        <a
          href="#festa"
          className="mt-12 md:mt-16 inline-flex items-center gap-3 text-fg-muted hover:text-amber transition-colors duration-300 min-h-[2.75rem]"
        >
          <span className="type-label text-[0.62rem]">Ver o cardápio</span>
          <ArrowDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
