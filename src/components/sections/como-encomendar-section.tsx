/*
 * Substitui a antiga seção "Sobre", que só tinha elogio genérico à própria
 * comida. Os três passos abaixo descrevem o que o site realmente faz — nada
 * aqui é promessa que dependa de dado que o dono ainda não confirmou.
 *
 * A CONFIRMAR COM O DONO, para virar informação de verdade nesta seção:
 * prazo mínimo de encomenda, bairros atendidos / se há entrega ou só retirada,
 * e formas de pagamento aceitas.
 */
const steps = [
  {
    n: "1",
    title: "Monte o pedido",
    body: "Escolha a linha, a quantidade e os sabores direto no cardápio desta página.",
  },
  {
    n: "2",
    title: "Envie pelo WhatsApp",
    body: "O pedido chega pronto na conversa, com os sabores e o total já escritos.",
  },
  {
    n: "3",
    title: "Combine na conversa",
    body: "Prazo, entrega e pagamento a gente acerta ali mesmo, com você.",
  },
]

export function ComoEncomendarSection() {
  return (
    <section
      id="como-encomendar"
      className="py-16 md:py-24 bg-surface-2 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="type-display text-[clamp(1.75rem,4.5vw,2.5rem)] text-fg mb-10 md:mb-14">
          Como encomendar
        </h2>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <li key={step.n} className="border-t-4 border-amber pt-5">
              {/*
                Âmbar puro não alcança 3:1 sobre o creme, então o número usa a
                variante escura — a barra acima é que carrega o âmbar cheio.
              */}
              <span className="type-display text-5xl md:text-6xl text-amber">
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-bold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
