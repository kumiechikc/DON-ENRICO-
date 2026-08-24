"use client"

import { useState, useRef, useId, useEffect } from "react"
import { Check } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { buildCartItemId } from "@/lib/cart/types"
import { assortedSku } from "@/lib/data/menu"
import { formatPrice, cn } from "@/lib/utils"
import { useReveal } from "@/lib/motion/use-reveal"
import { ProductImage } from "@/components/ui/product-image"
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
  const cardRef = useReveal<HTMLDivElement>("rise")

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
      id: buildCartItemId(assortedSku(category.id, tier.quantity), selected),
      sku: assortedSku(category.id, tier.quantity),
      name: `${category.name} — ${tier.quantity} unidades`,
      price: tier.price,
      flavors: selected,
    })
    setJustAdded(true)
    setSelected([])
  }

  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(() => setJustAdded(false), 1800)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const flavorLimitLabel =
    tier.maxFlavors === 1 ? "Escolha 1 sabor" : `Escolha até ${tier.maxFlavors} sabores`

  return (
    <div
      ref={cardRef}
      data-reveal
      className="group relative flex flex-col bg-surface border border-border transition-colors duration-500 hover:border-border-strong"
    >
      {/* Luz âmbar que acende ao passar o cursor: o card reage antes do clique. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(245,165,36,0.09) 0%, transparent 70%)",
        }}
      />

      {category.image && (
        <ProductImage
          foto={category.image}
          className="aspect-[16/9] border-0 border-b border-border"
          sizes="(min-width: 1024px) 45vw, 92vw"
        />
      )}

      <div className="relative px-6 sm:px-7 pt-7 pb-5 border-b border-border">
        <h3 className="type-display text-2xl sm:text-3xl text-fg">
          {category.name}
        </h3>
        <p className="mt-3 text-sm text-fg-muted">{category.description}</p>
      </div>

      <div className="relative px-6 sm:px-7 py-7 flex flex-col gap-7">
        <fieldset>
          <legend className="type-label text-[0.62rem] text-fg-muted mb-3">
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
                    "flex-1 min-w-[8.5rem] min-h-[3.5rem] px-4 py-2.5 border text-left transition-[color,background-color,border-color,opacity] duration-300",
                    active
                      ? "bg-amber border-amber text-bg"
                      : "border-border-strong text-fg hover:border-amber"
                  )}
                >
                  <span className="block type-label text-[0.6rem] opacity-75">
                    {t.quantity} unidades
                  </span>
                  <span className="block text-lg font-bold leading-tight tabular-nums">
                    {formatPrice(t.price)}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="type-label text-[0.62rem] text-fg-muted mb-1.5">
            {flavorLimitLabel}
          </legend>
          {category.maxFlavorsNote && (
            // Regra de negócio da cozinha, não letra miúda: fica legível.
            <p className="mb-3.5 text-xs font-semibold text-amber">
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
                    "inline-flex items-center gap-1.5 min-h-[2.75rem] px-3.5 py-1.5 border text-sm transition-[color,background-color,border-color,opacity] duration-300",
                    active
                      ? "bg-amber border-amber text-bg font-semibold"
                      : "border-border-strong text-fg-muted hover:border-amber hover:text-fg",
                    blocked && "opacity-35 cursor-not-allowed hover:border-border-strong hover:text-fg-muted"
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
            /*
             * Marca estável para a conferência do fluxo de pedido.
             *
             * Ela procurava o botão pelo texto, com /Adicionar —/. Trocar o
             * travessão por um ponto médio na etiqueta derrubou a suíte inteira,
             * sem que nada do PEDIDO tivesse mudado. Uma conferência de
             * comportamento não deve depender da pontuação de um rótulo: o
             * rótulo é copy, e copy muda.
             */
            data-adicionar=""
            className={cn(
              "w-full min-h-[3.5rem] px-5 font-bold text-sm uppercase tracking-[0.14em] transition-[color,background-color,border-color,opacity] duration-300",
              justAdded
                ? "bg-amber text-bg"
                : "bg-fg text-bg hover:bg-amber"
            )}
          >
            {/*
              Ponto médio, e não travessão. O travessão é o sinal de pontuação
              que mais entrega texto escrito por gerador, e aqui ele nem estava
              pontuando: estava separando duas coisas numa etiqueta de botão,
              que é trabalho de espaço ou de ponto.
            */}
            {justAdded ? "Adicionado ao pedido" : `Adicionar · ${formatPrice(tier.price)}`}
          </button>

          {showHint && (
            <p id={hintId} className="mt-2.5 text-xs font-semibold text-red">
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
