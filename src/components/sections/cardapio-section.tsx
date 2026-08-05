"use client"

import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { SectionHeading } from "@/components/ui/section-heading"
import { ProductImage } from "@/components/ui/product-image"
import { AddToCartButton } from "@/components/ui/add-to-cart-button"
import { formatPrice } from "@/lib/utils"
import { festaCategories, type AssortedCategory } from "@/lib/data/menu"

function CategoryCard({ category, index }: { category: AssortedCategory; index: number }) {
  return (
    <motion.article
      className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <ProductImage
        src={category.image}
        alt={`${category.name} — Don Enrico Lanches`}
        className="aspect-[16/9]"
      />

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-heading text-xl font-bold">{category.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {category.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {category.flavors.map((flavor) => (
            <li
              key={flavor}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
            >
              {flavor}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7 space-y-3">
          {category.tiers.map((tier, i) => (
            <div
              key={tier.quantity}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] px-4 py-3"
            >
              <div>
                <p className="text-sm text-muted-foreground">{tier.quantity} unidades</p>
                <p className="font-heading text-lg font-bold text-primary">
                  {formatPrice(tier.price)}
                </p>
              </div>
              <AddToCartButton
                id={`${category.id}-${tier.quantity}`}
                name={`${category.name} — ${tier.quantity} un`}
                price={tier.price}
                variant={i === category.tiers.length - 1 ? "solid" : "quiet"}
              />
            </div>
          ))}

          {category.maxFlavorsNote && (
            <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {category.maxFlavorsNote}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export function CardapioSection() {
  return (
    <section id="cardapio" className="py-20 md:py-28 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Encomendas para Festa"
          subtitle="Escolha a linha, escolha a quantidade. A gente entrega tudo pronto para a sua festa."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {festaCategories.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
