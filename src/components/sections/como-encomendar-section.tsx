"use client"

import { useReveal } from "@/lib/motion/use-reveal"

/*
 * Substitui a antiga seção "Sobre", que só elogiava a própria comida. Os três
 * passos descrevem o que o site realmente faz — nada aqui é promessa que dependa
 * de dado que o dono ainda não confirmou.
 *
 * A CONFIRMAR COM O DONO, para virar informação de verdade nesta seção:
 * prazo mínimo de encomenda, bairros atendidos / se há entrega ou só retirada,
 * e formas de pagamento aceitas.
 */
const steps = [
  {
    n: "01",
    title: "Monte o pedido",
    body: "Escolha a linha, a quantidade e os sabores direto no cardápio desta página.",
  },
  {
    n: "02",
    title: "Envie pelo WhatsApp",
    body: "O pedido chega pronto na conversa, com os sabores e o total já escritos.",
  },
  {
    n: "03",
    title: "Combine na conversa",
    body: "Prazo, entrega e pagamento a gente acerta ali mesmo, com você.",
  },
]

function Step({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useReveal<HTMLLIElement>("rise", { delay: index * 0.08 })

  return (
    <li
      ref={ref}
      data-reveal
      className="group relative grid grid-cols-[auto_1fr] gap-6 md:gap-10 items-start border-t border-border pt-8 md:pt-10"
    >
      {/* O número em escala grande é o elemento gráfico da seção: sem ele os
          três passos viram três parágrafos iguais. */}
      <span className="type-display text-[clamp(3rem,7vw,6rem)] leading-none text-transparent [-webkit-text-stroke:2px_var(--amber)] transition-colors duration-500 group-hover:text-amber">
        {step.n}
      </span>
      <div className="pt-1 md:pt-3">
        <h3 className="type-display text-xl md:text-2xl text-fg">{step.title}</h3>
        <p className="mt-3 text-sm md:text-base text-fg-muted leading-relaxed max-w-sm">
          {step.body}
        </p>
      </div>
    </li>
  )
}

export function ComoEncomendarSection() {
  return (
    <section id="como-encomendar" className="border-t border-border py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20">
          <div>
            <p className="type-label text-[0.68rem] text-amber mb-5">Simples assim</p>
            <h2 className="type-display text-[clamp(2.25rem,6vw,4rem)] text-fg">
              Como
              <br />
              encomendar
            </h2>
          </div>

          <ol className="flex flex-col gap-2">
            {steps.map((step, i) => (
              <Step key={step.n} step={step} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
