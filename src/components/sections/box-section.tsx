import { PackageCard } from "@/components/product/package-card"
import { boxDegustacao } from "@/lib/data/menu"
import { formatPrice } from "@/lib/utils"

export function BoxSection() {
  const menor = Math.min(...boxDegustacao.tiers.map((t) => t.price))

  return (
    <section id="box" className="relative border-t border-border py-24 md:py-36 overflow-hidden">
      {/* Brasa deslocada para a esquerda: a mesma luz do hero, agora rasante. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_100%_at_0%_50%,rgba(138,67,24,0.28)_0%,transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="type-label text-[0.68rem] text-amber mb-5">Para provar</p>
            <h2 className="type-display text-[clamp(2.5rem,7vw,5rem)] text-fg">
              Box
              <br />
              degustação
            </h2>
            <p className="mt-7 text-base md:text-lg text-fg-muted leading-relaxed max-w-md">
              A porção menor, para conhecer a mão antes de encomendar para a festa.
            </p>

            {/* Âncora de preço em escala grande: é o argumento desta seção. */}
            <p className="mt-10 flex items-baseline gap-3">
              <span className="type-label text-[0.62rem] text-fg-muted">
                a partir de
              </span>
              <span className="type-display text-[clamp(2.5rem,6vw,4.5rem)] text-amber">
                {formatPrice(menor)}
              </span>
            </p>
          </div>

          <PackageCard category={boxDegustacao} />
        </div>
      </div>
    </section>
  )
}
