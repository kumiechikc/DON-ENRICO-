"use client"

import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  id: string
  name: string
  price: number
  image?: string
  label?: string
  iconOnly?: boolean
  variant?: "solid" | "quiet"
  className?: string
}

export function AddToCartButton({
  id,
  name,
  price,
  image,
  label = "Adicionar",
  iconOnly = false,
  variant = "solid",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id, name, price, image })
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <button
      onClick={handleAdd}
      aria-label={`Adicionar ${name} ao pedido`}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold",
        "min-h-[44px] cursor-pointer transition-colors duration-200",
        iconOnly ? "min-w-[44px] px-0" : "px-4",
        variant === "solid"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-white/12 text-foreground hover:border-primary hover:text-primary",
        added && "bg-primary text-primary-foreground border-primary",
        className
      )}
    >
      {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      {!iconOnly && (added ? "Adicionado" : label)}
    </button>
  )
}
