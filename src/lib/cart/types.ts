export interface CartItem {
  /*
   * Identidade da linha do pedido. Para itens com sabor escolhido, o id embute a
   * combinação (ver buildCartItemId): "Clássicos Fritos 50un com coxinha" e
   * "Clássicos Fritos 50un com risoles" são linhas distintas do pedido, não a
   * mesma linha com quantidade 2.
   */
  id: string
  /*
   * Código do produto no cardápio ("classicos-fritos-100"). Serve para o pedido
   * chegar identificado na planilha de operação; o `id` acima não serve para
   * isso porque embute os sabores escolhidos.
   */
  sku: string
  name: string
  price: number
  quantity: number
  /** Sabores escolhidos pelo cliente. Vazio nos itens de sabor único. */
  flavors: string[]
}

export type CartAction =
  | { type: "ADD_ITEM"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QUANTITY"; id: string; quantity: number }
  | { type: "CLEAR" }

/**
 * Monta o id de uma linha do pedido. Os sabores entram ordenados para que a
 * mesma combinação escolhida em ordens diferentes caia na mesma linha.
 */
export function buildCartItemId(baseId: string, flavors: string[] = []): string {
  if (flavors.length === 0) return baseId
  return `${baseId}__${[...flavors].sort().join("+")}`
}
