"use client"

import { useState } from "react"
import { Check, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"
import { useCart } from "@/lib/cart/cart-context"
import { formatPrice } from "@/lib/utils"
import { boxes } from "@/lib/data/products"

function BoxCard({ box, bestValue }: { box: (typeof boxes)[0]; bestValue?: boolean }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id: box.id, name: box.name, price: box.price, image: "📦" })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <motion.div
      className="relative bg-card border border-white/[0.06] rounded-xl p-6 md:p-8 text-center hover:border-primary/30 transition-all duration-300"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      {bestValue && (
        <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          Melhor Custo-Benefício
        </span>
      )}

      <p className="font-heading text-[clamp(3rem,8vw,4.5rem)] font-black text-primary leading-none">
        {box.quantity}
      </p>
      <p className="font-body text-sm text-muted-foreground mt-1 uppercase tracking-wider">
        unidades
      </p>

      <p className="font-heading text-2xl md:text-3xl font-bold mt-4">
        {formatPrice(box.price)}
      </p>

      <p className="text-sm text-muted-foreground mt-3">{box.description}</p>

      <button
        onClick={handleAdd}
        className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
          added
            ? "bg-primary text-primary-foreground"
            : "fire-gradient text-white hover:opacity-90"
        }`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4" />
            Adicionado!
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            Adicionar Box
          </>
        )}
      </button>
    </motion.div>
  )
}

export function BoxSection() {
  return (
    <section id="box" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Box Degustação"
          subtitle="Monte seu box com salgados sortidos — fritos na hora!"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <BoxCard box={boxes[0]} />
          <BoxCard box={boxes[1]} bestValue />
        </div>
      </div>
    </section>
  )
}
