import type { CartItem } from "./types"

/*
 * Envia o pedido para a planilha de operação no mesmo instante em que o cliente
 * vai para o WhatsApp.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Duas decisões que valem mais que o código:
 *
 * 1. **Isto nunca pode atrapalhar a venda.** O pedido no WhatsApp funciona com
 *    ou sem planilha; o registro é conveniência do dono. Por isso `sendBeacon`,
 *    e não `fetch`: ele entrega em segundo plano, sobrevive à navegação para o
 *    WhatsApp e não tem como segurar o clique. Toda falha é engolida — se o
 *    Google estiver fora do ar, o cliente não fica sabendo, porque para ele não
 *    mudou nada.
 *
 * 2. **Preço e total não são enviados.** A planilha recalcula tudo pelo SKU. O
 *    endpoint é público num site estático, então qualquer valor que saísse
 *    daqui seria um valor que qualquer pessoa pode forjar. Mandar só o que é
 *    verificável do outro lado dispensa confiar no navegador.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sem `NEXT_PUBLIC_REGISTRO_URL` configurada, a função não faz nada — é o
 * estado do site hoje, e é assim que ele continua funcionando enquanto a
 * planilha não estiver publicada.
 */

const URL_REGISTRO = process.env.NEXT_PUBLIC_REGISTRO_URL
const TOKEN_REGISTRO = process.env.NEXT_PUBLIC_REGISTRO_TOKEN

export function registroAtivo(): boolean {
  return typeof URL_REGISTRO === "string" && URL_REGISTRO !== ""
}

export function registrarPedido(items: CartItem[], codigo: string): void {
  if (!registroAtivo()) return
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return
  if (items.length === 0) return

  const corpo = JSON.stringify({
    token: TOKEN_REGISTRO ?? "",
    codigo,
    itens: items.map((item) => ({
      sku: item.sku,
      pacotes: item.quantity,
      sabores: item.flavors,
    })),
  })

  try {
    /*
     * `text/plain` de propósito: com ele o navegador manda o POST direto. Com
     * `application/json` haveria uma requisição de verificação antes, e o Apps
     * Script não responde a esse tipo de verificação — o envio simplesmente não
     * sairia. O corpo continua sendo JSON; só o rótulo é outro.
     */
    navigator.sendBeacon(
      URL_REGISTRO as string,
      new Blob([corpo], { type: "text/plain;charset=UTF-8" })
    )
  } catch {
    // Ver decisão 1: registro é conveniência, venda é o que importa.
  }
}

/*
 * Alfabeto sem 0/O, 1/I/L e 5/S — o mesmo do Apps Script.
 *
 * O código aparece no topo da mensagem do WhatsApp e na planilha, e serve para
 * o dono ligar a conversa à linha do pedido com um olhar. Como ele vai ser lido
 * na tela e conferido à mão, caractere ambíguo aqui vira pedido trocado.
 */
const ALFABETO = "ABCDEFGHJKMNPQRTUVWXYZ23456789"

export function gerarCodigoPedido(): string {
  let saida = ""
  for (let i = 0; i < 4; i++) {
    saida += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length))
  }
  return saida
}
