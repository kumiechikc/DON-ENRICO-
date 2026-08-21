"use client"

import { useState, useEffect } from "react"
import { Plus, Check } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { formatPrice, cn } from "@/lib/utils"
import type { FlavorPack } from "@/lib/data/menu"

/*
 * Linha de um pacote de sabor único (congelados).
 *
 * A linha pontilhada entre nome e preço é o recurso tipográfico clássico de
 * cardápio impresso, e é o que faz esta lista parecer desenhada em vez de uma
 * tabela. Ela é feita com um flex-1 e `border-bottom: dotted` — nada de
 * caracteres de ponto repetidos, que leitores de tela leriam um por um.
 *
 * O tamanho do pacote aparece uma vez no cabeçalho da coluna, não repetido nas
 * dezenove linhas.
 */
export function ProductCard({ pack }: { pack: FlavorPack }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: pack.id,
      sku: pack.sku,
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
    <li className="group flex items-baseline gap-3 py-1">
      <h4 className="shrink-0 text-sm sm:text-base text-fg leading-snug transition-colors duration-300 group-hover:text-amber">
        {pack.name}
      </h4>

      {/* Condutor pontilhado: puramente decorativo. */}
      <span
        aria-hidden="true"
        className="flex-1 min-w-4 translate-y-[-0.28em] border-b border-dotted border-border-strong/60 transition-colors duration-300 group-hover:border-amber/70"
      />

      <span className="shrink-0 text-sm sm:text-base font-bold text-fg tabular-nums">
        {formatPrice(pack.price)}
      </span>

      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          "shrink-0 inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] border transition-[color,background-color,border-color,opacity] duration-300 self-center",
          added
            ? "bg-amber border-amber text-bg"
            : "border-border-strong/60 text-fg-muted hover:border-amber hover:text-amber"
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
    </li>
  )
}
