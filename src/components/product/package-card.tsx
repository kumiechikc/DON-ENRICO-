"use client"

import { useState, useRef, useId, useEffect } from "react"
import { Check } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { buildCartItemId } from "@/lib/cart/types"
import { formatPrice, cn } from "@/lib/utils"
import type { AssortedCategory } from "@/lib/data/menu"

/*
 * Card de uma linha vendida em pacote fechado (Box Degustação e encomendas de
 * festa). O cliente escolhe a faixa de quantidade e os sabores antes de
 * adicionar: sem isso o pedido chega no WhatsApp incompleto e o dono precisa
 * perguntar os sabores de novo.
 */
export function PackageCard({ category }: { category: AssortedCategory }) {
  const { addItem } = useCart()
  const [tierIndex, setTierIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [justAdded, setJustAdded] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const firstFlavorRef = useRef<HTMLButtonElement>(null)
  const hintId = useId()

  const tier = category.tiers[tierIndex]
  const atLimit = selected.length >= tier.maxFlavors

  const chooseTier = (index: number) => {
    setTierIndex(index)
    // Ao trocar para uma faixa que aceita menos sabores, corta o excedente em
    // vez de deixar o cliente montar uma combinação que a cozinha não aceita.
    const nextMax = category.tiers[index].maxFlavors
    setSelected((current) => current.slice(0, nextMax))
  }

  const toggleFlavor = (flavor: string) => {
    setShowHint(false)
    setSelected((current) => {
      if (current.includes(flavor)) return current.filter((f) => f !== flavor)
      if (current.length >= tier.maxFlavors) return current
      return [...current, flavor]
    })
  }

  const handleAdd = () => {
    /*
     * Sem sabor escolhido o botão não fica inerte: ele leva o cliente até a
     * escolha que falta. Um botão desabilitado aqui deixaria todos os cards com
     * cara de página quebrada, já que nenhum começa com sabor marcado.
     */
    if (selected.length === 0) {
      setShowHint(true)
      firstFlavorRef.current?.focus()
      return
    }

    addItem({
      id: buildCartItemId(`${category.id}-${tier.quantity}`, selected),
      name: `${category.name} — ${tier.quantity} unidades`,
      price: tier.price,
      flavors: selected,
    })
    setJustAdded(true)
    setSelected([])
  }

  // O aviso de "adicionado" se apaga sozinho. Com cleanup, para que um clique
  // repetido reinicie a contagem em vez de acumular timers.
  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(() => setJustAdded(false), 1800)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const flavorLimitLabel =
    tier.maxFlavors === 1 ? "Escolha 1 sabor" : `Escolha até ${tier.maxFlavors} sabores`

  return (
    <div className="flex flex-col bg-surface border border-border">
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border">
        <h3 className="type-display text-xl sm:text-2xl text-fg">{category.name}</h3>
        <p className="mt-2 text-sm text-fg-muted">{category.description}</p>
      </div>

      <div className="px-5 sm:px-6 py-5 sm:py-6 flex flex-col gap-6">
        <fieldset>
          <legend className="type-label text-[0.7rem] text-fg-muted mb-2.5">
            Quantidade
          </legend>
          <div className="flex flex-wrap gap-2">
            {category.tiers.map((t, i) => {
              const active = i === tierIndex
              return (
                <button
                  key={t.quantity}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseTier(i)}
                  className={cn(
                    "flex-1 min-w-[8.5rem] min-h-[3.25rem] px-4 py-2 border text-left transition-colors duration-150",
                    active
                      ? "bg-brand border-brand text-fg"
                      : "bg-bg border-border-strong text-fg hover:border-fg"
                  )}
                >
                  <span className="block type-label text-[0.7rem]">{t.quantity} un</span>
                  <span className="block text-lg font-bold leading-tight">
                    {formatPrice(t.price)}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="type-label text-[0.7rem] text-fg-muted mb-1">
            {flavorLimitLabel}
          </legend>
          {category.maxFlavorsNote && (
            // Regra de negócio da cozinha, não letra miúda: fica legível.
            <p className="mb-2.5 text-xs font-semibold text-brand-deep">
              {category.maxFlavorsNote}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {category.flavors.map((flavor, i) => {
              const active = selected.includes(flavor)
              const blocked = !active && atLimit
              return (
                <button
                  key={flavor}
                  ref={i === 0 ? firstFlavorRef : undefined}
                  type="button"
                  aria-pressed={active}
                  disabled={blocked}
                  onClick={() => toggleFlavor(flavor)}
                  className={cn(
                    "inline-flex items-center gap-1.5 min-h-[2.75rem] px-3 py-1.5 border text-sm transition-colors duration-150",
                    active
                      ? "bg-fg border-fg text-white"
                      : "bg-bg border-border-strong text-fg hover:border-fg",
                    blocked && "opacity-40 cursor-not-allowed hover:border-border-strong"
                  )}
                >
                  {active && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  {flavor}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div>
          <button
            type="button"
            onClick={handleAdd}
            aria-describedby={showHint ? hintId : undefined}
            className={cn(
              "w-full min-h-[3.25rem] px-5 font-bold text-sm uppercase tracking-wider transition-colors duration-150",
              justAdded
                ? "bg-brand text-fg"
                : "bg-fg text-white hover:bg-accent"
            )}
          >
            {justAdded ? "Adicionado ao pedido" : `Adicionar — ${formatPrice(tier.price)}`}
          </button>

          {showHint && (
            <p id={hintId} className="mt-2 text-xs font-semibold text-accent">
              Escolha {tier.maxFlavors === 1 ? "o sabor" : "ao menos 1 sabor"} antes de
              adicionar.
            </p>
          )}

          {/* O estado do botão muda em silêncio para leitores de tela. */}
          <p role="status" aria-live="polite" className="sr-only">
            {justAdded ? `${category.name} adicionado ao pedido.` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
