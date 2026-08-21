"use client"

import { X, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { getWhatsAppUrl } from "@/lib/cart/whatsapp"
import { useDialog } from "@/lib/hooks/use-dialog"
import { formatPrice } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { CartItemRow } from "./cart-item-row"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const panelRef = useDialog(open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-fg/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        className="absolute right-0 inset-y-0 w-full max-w-md bg-bg border-l border-border flex flex-col"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <h2 className="type-display text-lg text-fg">
            Seu pedido
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-normal normal-case tracking-normal text-fg-muted">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] text-fg hover:text-accent transition-colors duration-150"
            aria-label="Fechar pedido"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag className="w-10 h-10 text-border-strong" aria-hidden="true" />
            <p className="text-base font-bold text-fg">Seu pedido está vazio</p>
            <p className="text-sm text-fg-muted">
              Escolha uma linha do cardápio e monte a sua combinação de sabores.
            </p>
            <a
              href="#festa"
              onClick={onClose}
              className="mt-2 inline-flex items-center justify-center min-h-[3rem] px-6 bg-accent text-white font-bold text-sm uppercase tracking-wider hover:bg-accent-hover transition-colors duration-150"
            >
              Ver cardápio
            </a>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>

            <div className="px-5 py-4 border-t border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="type-label text-xs text-fg-muted">Total</span>
                <span className="type-display text-2xl text-fg tabular-nums">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <a
                href={getWhatsAppUrl(items, totalPrice)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full min-h-[3.25rem] bg-accent text-white font-bold text-sm uppercase tracking-wider hover:bg-accent-hover transition-colors duration-150"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Enviar pelo WhatsApp
              </a>

              <p className="text-center text-xs text-fg-muted">
                O pedido abre no WhatsApp já escrito, com os sabores e o total.
              </p>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-fg-muted hover:text-accent underline underline-offset-2 transition-colors duration-150 self-center min-h-[2.25rem]"
              >
                Limpar pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
