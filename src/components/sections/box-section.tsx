"use client"

import { motion } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"
import { ProductImage } from "@/components/ui/product-image"
import { AddToCartButton } from "@/components/ui/add-to-cart-button"
import { formatPrice } from "@/lib/utils"
import { boxDegustacao } from "@/lib/data/menu"

export function BoxSection() {
  return (
    <section id="box" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Box Degustação"
          subtitle="Um box de salgados sortidos, fritos na hora — do jeito que a gente entrega desde sempre."
        />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <ProductImage
            src={boxDegustacao.image}
            alt="Box degustação de salgados sortidos da Don Enrico"
            className="aspect-[4/3] rounded-2xl"
            sizes="(min-width: 768px) 45vw, 90vw"
          />

          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {boxDegustacao.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {boxDegustacao.flavors.map((flavor) => (
                <li
                  key={flavor}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                >
                  {flavor}
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3">
              {boxDegustacao.tiers.map((tier, i) => (
                <div
                  key={tier.quantity}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-card px-5 py-4"
                >
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {tier.quantity} unidades
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(tier.price)}
                    </p>
                  </div>
                  <AddToCartButton
                    id={`${boxDegustacao.id}-${tier.quantity}`}
                    name={`${boxDegustacao.name} — ${tier.quantity} un`}
                    price={tier.price}
                    variant={i === boxDegustacao.tiers.length - 1 ? "solid" : "quiet"}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
