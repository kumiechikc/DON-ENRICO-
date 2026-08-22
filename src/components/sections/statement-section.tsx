"use client"

import { useReveal } from "@/lib/motion/use-reveal"
import { site } from "@/lib/site"

/*
 * O momento de respiro da página.
 *
 * Entre o cardápio e os congelados o site precisa parar de vender por alguns
 * segundos: sem isso são três mil pixels de card atrás de card, o que cansa e
 * achata tudo. Aqui a marca fala uma frase só, grande, e nada mais acontece.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A VERSÃO ANTERIOR ARRASTAVA A FRASE NA HORIZONTAL, E ESTAVA ERRADA.
 *
 * A frase saía em 160px e 2696px de largura numa tela de 1440 — quase o dobro
 * do quadro. A ideia era que a rolagem revelasse o resto; o efeito real era um
 * texto cortado dos dois lados em qualquer momento da travessia, que lê como
 * defeito e não como intenção. Reduzir só o tamanho não resolvia: em 88px ela
 * ainda media 1483px e continuava cortada.
 *
 * Então a frase passa a CABER, e a deriva sai junto. Duas razões de peso:
 *
 *  1. Uma frase que cabe não tem o que revelar — manter a deriva seria
 *     maquinário rodando a cada quadro para mover vinte pixels que ninguém vê.
 *  2. A página JÁ tem uma faixa de texto correndo na horizontal, a dos sabores,
 *     logo depois do hero. Duas eram repetição, e a dos sabores diz algo (os
 *     sabores que existem) enquanto esta só se mexia.
 *
 * O que ficou no lugar é a revelação de entrada que o resto do site usa, pelo
 * `useReveal` — reaproveitando o que já existe em vez de manter uma animação
 * própria só para esta seção.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function StatementSection() {
  const ref = useReveal<HTMLParagraphElement>("rise", { start: "top 78%" })

  return (
    <section
      aria-label="Nosso lema"
      className="relative overflow-hidden border-y border-border py-24 md:py-40"
    >
      {/* Brasa distante ao fundo: liga esta pausa à luz do hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_140%_at_50%_50%,rgba(138,67,24,0.32)_0%,transparent_70%)]"
      />

      <p
        ref={ref}
        data-reveal
        /*
         * `text-balance` reparte as linhas quando a frase quebra, em vez de
         * deixar uma palavra órfã na segunda. O teto de 6vw mantém a frase
         * inteira dentro do quadro no desktop, com margem.
         *
         */
        className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center text-balance type-display type-display-duas-linhas text-[clamp(2rem,6vw,4.5rem)] text-fg"
      >
        {site.tagline}
      </p>
    </section>
  )
}
