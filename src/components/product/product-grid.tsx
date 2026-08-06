"use client"

import { ProductCard } from "./product-card"
import type { FlavorPack } from "@/lib/data/menu"

export function ProductGrid({ packs }: { packs: FlavorPack[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {packs.map((pack, i) => (
        <ProductCard key={pack.id} pack={pack} index={i} />
      ))}
    </div>
  )
}
