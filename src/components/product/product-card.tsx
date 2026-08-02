"use client"

import { useState } from "react"
import { Plus, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/lib/cart/cart-context"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/data/products"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.emoji,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <motion.div
      className="group bg-card border border-white/[0.06] rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(234,88,12,0.08)] transition-all duration-250"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="aspect-[4/3] bg-muted flex items-center justify-center">
        <span className="text-5xl">{product.emoji}</span>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-base font-bold leading-tight">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              added
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground border border-white/10 hover:border-primary hover:text-primary"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Adicionado
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
