import type { CartItem } from "./types"

const WHATSAPP_NUMBER = "5551990156798"

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/*
 * O objetivo desta mensagem é o pedido chegar completo na primeira vez: sem os
 * sabores escolhidos, o dono precisa perguntar tudo de novo por WhatsApp — que
 * é exatamente onde o pedido se perde hoje.
 */
export function generateWhatsAppMessage(items: CartItem[], total: number): string {
  const itemLines = items
    .map((item) => {
      const line = `• ${item.quantity}x ${item.name} — R$ ${formatBRL(
        item.price * item.quantity
      )}`
      if (item.flavors.length === 0) return line
      return `${line}\n   Sabores: ${item.flavors.join(", ")}`
    })
    .join("\n")

  return `Olá! Gostaria de fazer um pedido na Don Enrico Lanches:

*Meu pedido*
${itemLines}

*Total: R$ ${formatBRL(total)}*`
}

export function getWhatsAppUrl(items: CartItem[], total: number): string {
  const message = generateWhatsAppMessage(items, total)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function getWhatsAppDirectUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}`
}

export const PHONE_DISPLAY = "(51) 99015-6798"
export const PHONE_TEL = "+5551990156798"
export const INSTAGRAM_HANDLE = "@donenricolanches"
export const INSTAGRAM_URL = "https://instagram.com/donenricolanches"
