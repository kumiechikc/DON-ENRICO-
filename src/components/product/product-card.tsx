"use client"

import { motion } from "framer-motion"
import { ProductImage } from "@/components/ui/product-image"
import { AddToCartButton } from "@/components/ui/add-to-cart-button"
import { formatPrice } from "@/lib/utils"
import type { FlavorPack } from "@/lib/data/menu"

export function ProductCard({ pack, index = 0 }: { pack: FlavorPack; index?: number }) {
  return (
    <motion.article
      className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-card p-3 sm:p-4"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: (index % 3) * 0.04 }}
    >
      <ProductImage
        src={pack.image}
        alt={`${pack.name} congelado — pacote com ${pack.packSize} unidades`}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shrink-0"
        sizes="80px"
      />

      <div className="min-w-0 flex-1">
        <h4 className="font-heading text-sm sm:text-base font-bold leading-tight">
          {pack.name}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {pack.packSize} unidades
        </p>
        <p className="mt-1 text-base font-bold text-primary">{formatPrice(pack.price)}</p>
      </div>

      <AddToCartButton
        id={pack.id}
        name={`${pack.name} — pacote ${pack.packSize} un`}
        price={pack.price}
        iconOnly
        variant="quiet"
        className="shrink-0"
      />
    </motion.article>
  )
}
