"use client"

import { Minus, Plus, X } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { ProductImage } from "@/components/ui/product-image"
import { formatPrice } from "@/lib/utils"
import type { CartItem } from "@/lib/cart/types"

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5">
      <ProductImage
        src={item.image}
        alt={item.name}
        className="w-12 h-12 rounded-lg shrink-0"
        sizes="48px"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{item.name}</p>
        <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1.5 hover:text-primary transition-colors"
          aria-label="Diminuir quantidade"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1.5 hover:text-primary transition-colors"
          aria-label="Aumentar quantidade"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-sm font-bold text-primary w-16 text-right">
        {formatPrice(item.price * item.quantity)}
      </p>

      <button
        onClick={() => removeItem(item.id)}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
        aria-label={`Remover ${item.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
