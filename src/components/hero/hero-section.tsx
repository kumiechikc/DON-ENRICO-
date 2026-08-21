import { getWhatsAppDirectUrl } from "@/lib/cart/whatsapp"
import { boxDegustacao, festaCategories } from "@/lib/data/menu"
import { formatPrice } from "@/lib/utils"

export function HeroSection() {
  // Índice de preços montado a partir do próprio cardápio: quando um preço muda
  // no menu.ts, a dobra acompanha sozinha.
  const entryPrice = Math.min(...boxDegustacao.tiers.map((t) => t.price))
  const priceIndex = festaCategories.map((c) => ({
    name: c.name,
    from: Math.min(...c.tiers.map((t) => t.price)),
  }))

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-end">
          <div>
            <p className="type-label text-xs text-brand-deep">
              Porto Alegre · Encomendas
            </p>

            <h1 className="mt-5 type-display text-[clamp(2.75rem,9vw,5.5rem)] text-fg">
              Salgados
              <br />
              para festa
            </h1>

            {/* Barra âmbar: o único gesto de cor forte da dobra. */}
            <div className="mt-7 h-2 w-24 bg-brand" aria-hidden="true" />

            <p className="mt-7 max-w-xl text-lg md:text-xl text-fg-muted leading-relaxed">
              Fritos, assados e folhados por encomenda — e a linha de congelados
              para assar em casa. Box degustação a partir de{" "}
              <strong className="text-fg font-bold">{formatPrice(entryPrice)}</strong>.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <a
                href="#festa"
                className="inline-flex items-center justify-center min-h-[3.25rem] px-8 bg-accent text-white font-bold text-sm uppercase tracking-wider hover:bg-accent-hover transition-colors duration-150"
              >
                Ver cardápio
              </a>
              <a
                href={getWhatsAppDirectUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[3.25rem] px-8 border border-border-strong text-fg font-bold text-sm uppercase tracking-wider hover:border-fg transition-colors duration-150"
              >
                Falar no WhatsApp
              </a>
            </div>

            <p className="mt-6 text-sm text-fg-muted italic">
              O sabor que impõe respeito
            </p>
          </div>

          {/*
            Quadro de preços como o de uma casa de salgados: preenche a metade
            direita com informação real em vez de enfeite, e dá ao visitante a
            faixa de preço antes de rolar a página.
          */}
          <div className="lg:w-72 border-t-2 border-fg pt-5">
            <p className="type-label text-[0.7rem] text-fg-muted mb-4">
              Linhas para festa
            </p>
            <ul className="flex flex-col gap-3">
              {priceIndex.map((line) => (
                <li
                  key={line.name}
                  className="flex items-baseline justify-between gap-4 border-b border-border pb-2"
                >
                  <span className="text-sm font-semibold text-fg">{line.name}</span>
                  <span className="text-sm text-fg-muted tabular-nums whitespace-nowrap">
                    a partir de{" "}
                    <strong className="text-fg font-bold">
                      {formatPrice(line.from)}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-fg-muted">Pacotes de 50 ou 100 unidades.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
