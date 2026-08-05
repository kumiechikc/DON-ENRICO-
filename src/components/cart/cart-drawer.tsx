"use client"

import { X, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { getWhatsAppUrl } from "@/lib/cart/whatsapp"
import { formatPrice } from "@/lib/utils"
import { CartItemRow } from "./cart-item-row"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice } = useCart()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/5 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-heading text-lg font-bold">
            Seu Pedido{" "}
            {totalItems > 0 && (
              <span className="text-muted-foreground font-body text-sm">
                ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            <p className="font-heading text-lg font-bold">Seu carrinho está vazio</p>
            <p className="text-sm text-muted-foreground">
              Explore nosso cardápio e adicione seus salgados favoritos!
            </p>
            <a
              href="#cardapio"
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Ver Cardápio
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-base font-bold">Total</span>
                <span className="font-body text-xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <a
                href={getWhatsAppUrl(items, totalPrice)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Finalizar pelo WhatsApp
              </a>

              <p className="text-center text-xs text-muted-foreground">
                Seu pedido será enviado para nosso WhatsApp
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
