import type { CartItem } from "./types"

const WHATSAPP_NUMBER = "5551990156798"

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function generateWhatsAppMessage(items: CartItem[], total: number): string {
  const itemLines = items
    .map((item) => `• ${item.quantity}x ${item.name} — R$ ${formatBRL(item.price * item.quantity)}`)
    .join("\n")

  return `Olá! Gostaria de fazer um pedido na Don Enrico:

🛒 *Meu Pedido:*
${itemLines}

💰 *Total: R$ ${formatBRL(total)}*

Aguardo confirmação! 🔥`
}

export function getWhatsAppUrl(items: CartItem[], total: number): string {
  const message = generateWhatsAppMessage(items, total)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function getWhatsAppDirectUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}`
}
