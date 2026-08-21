"use client"

import { SectionHeading } from "@/components/ui/section-heading"
import { ProductCard } from "@/components/product/product-card"
import { useReveal } from "@/lib/motion/use-reveal"
import {
  congeladosFritar,
  congeladosAssados,
  CONGELADOS_PACK_SIZE,
  type FlavorPack,
} from "@/lib/data/menu"

function PackList({ title, packs }: { title: string; packs: FlavorPack[] }) {
  const ref = useReveal<HTMLUListElement>("stagger")

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b border-amber pb-3 mb-2">
        <h3 className="type-label text-[0.68rem] text-amber">{title}</h3>
        <span className="text-xs text-fg-muted whitespace-nowrap">
          pacote c/ {CONGELADOS_PACK_SIZE}
        </span>
      </div>
      <ul ref={ref} data-reveal>
        {packs.map((pack) => (
          <ProductCard key={pack.id} pack={pack} />
        ))}
      </ul>
    </div>
  )
}

export function CongeladosSection() {
  return (
    <section id="congelados" className="relative border-t border-border py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Linha praticidade"
          title="Sempre no seu freezer"
          subtitle={`Pacote fechado com ${CONGELADOS_PACK_SIZE} unidades de um sabor só, para preparar na hora que der vontade.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <PackList title="Para fritar" packs={congeladosFritar} />
          <PackList title="Assados — só aquecer" packs={congeladosAssados} />
        </div>
      </div>
    </section>
  )
}
