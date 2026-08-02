"use client"

import { SectionHeading } from "@/components/ui/section-heading"
import { ProductGrid } from "@/components/product/product-grid"
import { products } from "@/lib/data/products"

export function CardapioSection() {
  return (
    <section id="cardapio" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Nosso Cardápio"
          subtitle="Fritos na hora — crocantes, saquinhos e prontos para saborear"
        />
        <ProductGrid products={products} />
      </div>
    </section>
  )
}
