import { SectionHeading } from "@/components/ui/section-heading"
import { ProductCard } from "@/components/product/product-card"
import {
  congeladosFritar,
  congeladosAssados,
  CONGELADOS_PACK_SIZE,
  type FlavorPack,
} from "@/lib/data/menu"

function PackList({ title, packs }: { title: string; packs: FlavorPack[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-fg pb-2 mb-4">
        <h3 className="type-label text-xs text-fg">{title}</h3>
        <span className="text-xs text-fg-muted whitespace-nowrap">
          pacote c/ {CONGELADOS_PACK_SIZE}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {packs.map((pack) => (
          <ProductCard key={pack.id} pack={pack} />
        ))}
      </ul>
    </div>
  )
}

export function CongeladosSection() {
  return (
    <section id="congelados" className="py-16 md:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Linha praticidade"
          title="Congelados"
          subtitle={`Pacote fechado com ${CONGELADOS_PACK_SIZE} unidades de um sabor só, para guardar no freezer e preparar na hora que quiser.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <PackList title="Para fritar" packs={congeladosFritar} />
          <PackList title="Assados — só aquecer" packs={congeladosAssados} />
        </div>
      </div>
    </section>
  )
}
