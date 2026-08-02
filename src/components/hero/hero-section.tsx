"use client"

import dynamic from "next/dynamic"
import { ChevronDown } from "lucide-react"

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false })

export function HeroSection() {
  return (
    <section className="relative min-h-screen min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="font-body text-xs sm:text-sm font-semibold tracking-[0.3em] text-primary uppercase mb-4 animate-[fadeIn_0.6s_ease_0.3s_both]">
          Salgados Artesanais
        </p>

        <h1 className="font-heading text-[clamp(2.5rem,7vw,5rem)] font-black leading-[0.95] tracking-tight animate-[fadeIn_0.6s_ease_0.5s_both]">
          <span className="block text-foreground">Don Enrico</span>
          <span className="block text-primary mt-1">Salgados</span>
        </h1>

        <p className="mt-4 font-body text-base sm:text-lg md:text-xl text-muted-foreground italic font-light animate-[fadeIn_0.6s_ease_0.7s_both]">
          O Sabor que Impõe Respeito
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fadeIn_0.6s_ease_0.9s_both]">
          <a
            href="#cardapio"
            className="fire-gradient px-8 py-3.5 rounded-lg text-white font-bold text-sm tracking-wide hover:scale-105 hover:shadow-[0_4px_24px_rgba(234,88,12,0.4)] transition-all duration-200"
          >
            Peça Agora
          </a>
          <a
            href="#cardapio"
            className="px-8 py-3.5 rounded-lg border border-white/20 text-foreground font-medium text-sm hover:border-primary hover:text-primary transition-all duration-200"
          >
            Ver Cardápio
          </a>
        </div>
      </div>

      <a
        href="#cardapio"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/60 animate-[bounce-down_1.5s_ease-in-out_infinite]"
        aria-label="Rolar para o cardápio"
      >
        <ChevronDown className="w-6 h-6" />
      </a>

    </section>
  )
}
