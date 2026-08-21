"use client"

import { useState, useEffect } from "react"
import { Plus, Check } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { formatPrice, cn } from "@/lib/utils"
import type { FlavorPack } from "@/lib/data/menu"

/*
 * Linha de um pacote de sabor único (congelados). O tamanho do pacote aparece
 * uma vez no cabeçalho da coluna, não repetido em cada uma das dezenove linhas.
 */
export function ProductCard({ pack }: { pack: FlavorPack }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: pack.id,
      name: `${pack.name} — pacote com ${pack.packSize}`,
      price: pack.price,
      flavors: [],
    })
    setAdded(true)
  }

  useEffect(() => {
    if (!added) return
    const timer = window.setTimeout(() => setAdded(false), 1400)
    return () => window.clearTimeout(timer)
  }, [added])

  return (
    <li className="flex items-center justify-between gap-3 bg-surface border border-border pl-4 pr-2 py-2">
      <h4 className="text-sm sm:text-base font-semibold text-fg leading-snug min-w-0">
        {pack.name}
      </h4>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-bold text-fg tabular-nums">
          {formatPrice(pack.price)}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] border transition-colors duration-150",
            added
              ? "bg-fg border-fg text-white"
              : "bg-bg border-border-strong text-fg hover:border-fg hover:bg-brand"
          )}
          aria-label={
            added
              ? `${pack.name} adicionado ao pedido`
              : `Adicionar ${pack.name}, pacote com ${pack.packSize}, ao pedido`
          }
        >
          {added ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Plus className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </li>
  )
}
