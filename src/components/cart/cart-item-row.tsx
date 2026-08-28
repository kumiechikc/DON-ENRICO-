"use client"

import { Minus, Plus, X } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { formatPrice } from "@/lib/utils"
import type { CartItem } from "@/lib/cart/types"

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <li className="py-4 border-b border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg leading-snug">{item.name}</p>
          {item.flavors.length > 0 && (
            <p className="mt-1 text-xs text-fg-muted">{item.flavors.join(", ")}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="shrink-0 inline-flex items-center justify-center min-w-[2.25rem] min-h-[2.25rem] text-fg-muted hover:text-red transition-colors duration-[var(--duration-controle)] ease-[var(--ease-estado)]"
          aria-label={`Remover ${item.name} do pedido`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center border border-border-strong">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="inline-flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem] text-fg hover:text-red transition-colors duration-[var(--duration-controle)] ease-[var(--ease-estado)]"
            aria-label={`Diminuir quantidade de ${item.name}`}
          >
            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="w-9 text-center text-sm font-bold tabular-nums" aria-hidden="true">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="inline-flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem] text-fg hover:text-red transition-colors duration-[var(--duration-controle)] ease-[var(--ease-estado)]"
            aria-label={`Aumentar quantidade de ${item.name}`}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm font-bold text-fg tabular-nums">
          <span className="sr-only">{item.quantity} unidades, subtotal </span>
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </li>
  )
}
