"use client"

import { Snowflake } from "lucide-react"
import { SectionHeading } from "@/components/ui/section-heading"
import { ProductGrid } from "@/components/product/product-grid"
import { congeladosFritar, congeladosAssados } from "@/lib/data/menu"

export function CongeladosSection() {
  return (
    <section id="congelados" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Linha Praticidade"
          subtitle="Salgados congelados para ter a Don Enrico sempre no seu freezer. Cada pacote vem com 50 unidades de um sabor."
        />

        <div className="mb-6 flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-bold">Para fritar</h3>
        </div>
        <ProductGrid packs={congeladosFritar} />

        <div className="mt-16 mb-6 flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-bold">Assados, prontos para aquecer</h3>
        </div>
        <ProductGrid packs={congeladosAssados} />
      </div>
    </section>
  )
}
