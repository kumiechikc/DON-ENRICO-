export interface Tier {
  quantity: number
  price: number
  /*
   * Quantos sabores o cliente pode combinar nesta faixa.
   *
   * CONFIRMADO pelo sócio em 26/08/2026: 1 sabor em 25 unidades, 2 em 50 e 2 em
   * 100. O encarte só dizia "máximo dois sabores por cento", que era claro para
   * 100 e ambíguo para as faixas menores; a leitura conservadora que estava aqui
   * era a certa, e agora é regra, não mais palpite.
   *
   * Nenhuma outra parte do código presume esses valores: trocar o número aqui
   * muda a interface, a validação e a mensagem do WhatsApp juntas.
   *
   * Ignorado quando a linha é `sortido`, porque aí não há escolha nenhuma.
   */
  maxFlavors: number
}

// `image` é o id de uma foto registrada em src/lib/media/fotos.ts. Enquanto a
// linha não tiver foto, fica vazio e o ProductImage cai no espaço reservado da
// marca. Para publicar uma foto: trate o original com scripts/tratar-foto.mjs,
// registre em fotos.ts, e aponte o id aqui.
//
// A foto só entra na linha em que a cena BATE com o produto. Trocar de linha
// para preencher um espaço vazio é prometer um salgado e entregar outro.
export interface AssortedCategory {
  id: string
  name: string
  description: string
  /*
   * Quando a linha é `sortido`, esta lista deixa de ser um menu de escolha e
   * passa a ser informação: é o que costuma vir na caixa. Continua valendo a
   * pena mostrar, porque é ela que responde "o que eu vou comer".
   */
  flavors: string[]
  tiers: Tier[]
  image?: string
  maxFlavorsNote?: string
  /*
   * A casa monta a combinação; o cliente não escolhe sabor.
   *
   * Confirmado pelo sócio em 26/08/2026 para o Box Degustação. Antes o site
   * dizia "sortido" na descrição E mostrava os nove sabores para marcar, ao
   * mesmo tempo — as duas coisas não podem ser verdade, e a que estava errada
   * era a interface.
   */
  sortido?: boolean
  /** Explica o sortido dentro do card. Só aparece quando `sortido` é verdadeiro. */
  sortidoNote?: string
}

/*
 * Sem campo de imagem: as linhas de congelados são compactas de propósito (são
 * 19 sabores) e não mostram foto. Se um dia quisermos miniatura aqui, o campo
 * volta junto com o componente que o lê.
 */
export interface FlavorPack {
  id: string
  /*
   * Identidade do produto fora do site: é por este código que o pedido chega na
   * planilha de operação e encontra o preço e a linha de produção. Fica junto do
   * cardápio, e não montado em outro lugar, porque duas listas do mesmo produto
   * divergem na primeira mudança — e a divergência só aparece quando um pedido
   * real cai na planilha com SKU que ninguém reconhece.
   */
  sku: string
  name: string
  price: number
  packSize: number
}

/**
 * SKU de uma faixa de linha sortida ("Clássicos Fritos, 100 unidades").
 *
 * O gerador da planilha chama esta mesma função, então o código que sai do
 * carrinho e o que está cadastrado no Catálogo são o mesmo por construção.
 */
export function assortedSku(categoryId: string, quantity: number): string {
  return `${categoryId}-${quantity}`
}

export const boxDegustacao: AssortedCategory = {
  id: "box-degustacao",
  name: "Box Degustação",
  description: "Sortido dos clássicos fritos, para provar.",
  // A cena é literalmente um sortido de clássicos fritos, de perto.
  image: "box-degustacao",
  sortido: true,
  sortidoNote:
    "A casa monta a combinação. Tem um sabor que você faz questão? Peça na conversa que a gente vê.",
  flavors: [
    "Coxinha de frango",
    "Bolinha de queijo",
    "Risoles presunto e queijo",
    "Calabresinha c/ cheddar",
    "Croquete c/ requeijão",
    "Enroladinho de salsicha",
    "Pastelzinho de carne",
    "Pastelzinho de queijo",
    "Mini churros",
  ],
  tiers: [
    { quantity: 25, price: 19.9, maxFlavors: 1 },
    { quantity: 50, price: 39.9, maxFlavors: 2 },
  ],
}

const MAX_FLAVORS_NOTE = "Máximo dois sabores por cento"

export const festaCategories: AssortedCategory[] = [
  {
    id: "classicos-fritos",
    name: "Clássicos Fritos",
    description: "Fritos na hora. Os sabores tradicionais.",
    // Coxinha e croquete, que são dois dos sabores desta linha.
    image: "classicos-fritos",
    flavors: [
      "Coxinha de frango",
      "Bolinha de queijo",
      "Enrolado de salsicha",
      "Croquete c/ requeijão",
      "Calabresinha c/ cheddar",
      "Risoles presunto e queijo",
      "Pastelzinho de carne",
      "Pastelzinho de queijo",
      "Mini churros",
    ],
    tiers: [
      { quantity: 50, price: 39.9, maxFlavors: 2 },
      { quantity: 100, price: 69.9, maxFlavors: 2 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
  {
    id: "assados-especiais",
    name: "Assados Especiais",
    description: "Assados no forno, sem fritura.",
    flavors: [
      "Enroladinho de salsicha",
      "Joelho calabresa e queijo",
      "Esfiha de frango",
      "Empadinha de frango",
      "Pastelzinho de carne",
      "Pastelzinho suíço",
    ],
    tiers: [
      { quantity: 50, price: 44.9, maxFlavors: 2 },
      { quantity: 100, price: 79.9, maxFlavors: 2 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
  {
    id: "folhados-premium",
    name: "Folhados Premium",
    description: "Massa folhada, assada no forno.",
    flavors: [
      "Enroladinho de salsicha",
      "Pastel presunto e queijo",
      "Empadinha de frango",
    ],
    tiers: [
      { quantity: 50, price: 44.9, maxFlavors: 2 },
      { quantity: 100, price: 79.9, maxFlavors: 2 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
  {
    id: "selecao-don-enrico",
    name: "Seleção Don Enrico",
    description: "Mini pizzas, croissants, empadinhas e tortinhas.",
    flavors: [
      "Mini pizza de calabresa",
      "Mini pizza de frango",
      "Mini pizza de mussarela",
      "Mini pizza milho e queijo",
      "Hamburguinho de presunto e queijo",
      "Croissant de chocolate",
      "Croissant de presunto e queijo",
      "Pastelzinho de palmito",
      "Empadinha de palmito",
      "Empadinha de brócolis",
      "Tortinha de espinafre",
    ],
    tiers: [
      { quantity: 50, price: 59.9, maxFlavors: 2 },
      { quantity: 100, price: 109.9, maxFlavors: 2 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
]

export const CONGELADOS_PACK_SIZE = 50

export const congeladosFritar: FlavorPack[] = [
  { id: "coxinha-frango", sku: "cong-frito-coxinha-frango", name: "Coxinha de frango", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "calabresa-cheddar", sku: "cong-frito-calabresa-cheddar", name: "Calabresa c/ cheddar", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "bolinha-queijo", sku: "cong-frito-bolinha-queijo", name: "Bolinha de queijo", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "risoles-presunto-queijo", sku: "cong-frito-risoles-presunto-queijo", name: "Risoles presunto e queijo", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "enrolado-salsicha", sku: "cong-frito-enrolado-salsicha", name: "Enrolado de salsicha", price: 22, packSize: CONGELADOS_PACK_SIZE },
  { id: "croquete-requeijao", sku: "cong-frito-croquete-requeijao", name: "Croquete c/ requeijão", price: 27, packSize: CONGELADOS_PACK_SIZE },
  { id: "pastelzinho-carne", sku: "cong-frito-pastelzinho-carne", name: "Pastelzinho de carne", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "pastelzinho-queijo", sku: "cong-frito-pastelzinho-queijo", name: "Pastelzinho de queijo", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-churros", sku: "cong-frito-mini-churros", name: "Mini churros", price: 27, packSize: CONGELADOS_PACK_SIZE },
  { id: "sortidos", sku: "cong-frito-sortidos", name: "Sortidos", price: 25, packSize: CONGELADOS_PACK_SIZE },
]

export const congeladosAssados: FlavorPack[] = [
  { id: "esfiha-frango", sku: "cong-assado-esfiha-frango", name: "Esfiha de frango", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "esfiha-carne", sku: "cong-assado-esfiha-carne", name: "Esfiha de carne", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "empadinha-frango", sku: "cong-assado-empadinha-frango", name: "Empadinha de frango", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "empadinha-brocolis", sku: "cong-assado-empadinha-brocolis", name: "Empadinha de brócolis", price: 35, packSize: CONGELADOS_PACK_SIZE },
  { id: "enrolado-salsicha-assado", sku: "cong-assado-enrolado-salsicha-assado", name: "Enrolado de salsicha", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "pastelzinho-carne-assado", sku: "cong-assado-pastelzinho-carne-assado", name: "Pastelzinho de carne", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-pizza-mussarela", sku: "cong-assado-mini-pizza-mussarela", name: "Mini pizza mussarela", price: 35, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-pizza-frango", sku: "cong-assado-mini-pizza-frango", name: "Mini pizza frango", price: 35, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-pizza-calabresa", sku: "cong-assado-mini-pizza-calabresa", name: "Mini pizza calabresa", price: 35, packSize: CONGELADOS_PACK_SIZE },
]
