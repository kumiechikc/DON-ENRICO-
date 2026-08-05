export interface Tier {
  quantity: number
  price: number
}

// `image` fica vazio até o cliente enviar a foto: o componente ProductImage cai
// num fallback da marca. Para publicar uma foto, salve o arquivo em
// public/produtos/<id>.jpg e aponte image: "/produtos/<id>.jpg" aqui.
export interface AssortedCategory {
  id: string
  name: string
  description: string
  flavors: string[]
  tiers: Tier[]
  image?: string
  maxFlavorsNote?: string
}

export interface FlavorPack {
  id: string
  name: string
  price: number
  packSize: number
  image?: string
}

export const boxDegustacao: AssortedCategory = {
  id: "box-degustacao",
  name: "Box Degustação",
  description: "Salgados sortidos fritos na hora, prontos para saborear.",
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
    { quantity: 25, price: 19.9 },
    { quantity: 50, price: 39.9 },
  ],
}

const MAX_FLAVORS_NOTE = "Máximo dois sabores por cento"

export const festaCategories: AssortedCategory[] = [
  {
    id: "classicos-fritos",
    name: "Clássicos Fritos",
    description: "Os salgados de sempre, crocantes e fritos na hora.",
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
      { quantity: 50, price: 39.9 },
      { quantity: 100, price: 69.9 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
  {
    id: "assados-especiais",
    name: "Assados Especiais",
    description: "Assados na medida, leves e douradinhos.",
    flavors: [
      "Enroladinho de salsicha",
      "Joelho calabresa e queijo",
      "Esfiha de frango",
      "Empadinha de frango",
      "Pastelzinho de carne",
      "Pastelzinho suíço",
    ],
    tiers: [
      { quantity: 50, price: 44.9 },
      { quantity: 100, price: 79.9 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
  {
    id: "folhados-premium",
    name: "Folhados Premium",
    description: "Massa folhada amanteigada, recheio generoso.",
    flavors: [
      "Enroladinho de salsicha",
      "Pastel presunto e queijo",
      "Empadinha de frango",
    ],
    tiers: [
      { quantity: 50, price: 44.9 },
      { quantity: 100, price: 79.9 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
  {
    id: "selecao-don-enrico",
    name: "Seleção Don Enrico",
    description: "Nossa linha especial, para quem quer impressionar.",
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
      { quantity: 50, price: 59.9 },
      { quantity: 100, price: 109.9 },
    ],
    maxFlavorsNote: MAX_FLAVORS_NOTE,
  },
]

export const CONGELADOS_PACK_SIZE = 50

export const congeladosFritar: FlavorPack[] = [
  { id: "coxinha-frango", name: "Coxinha de frango", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "calabresa-cheddar", name: "Calabresa c/ cheddar", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "bolinha-queijo", name: "Bolinha de queijo", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "risoles-presunto-queijo", name: "Risoles presunto e queijo", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "enrolado-salsicha", name: "Enrolado de salsicha", price: 22, packSize: CONGELADOS_PACK_SIZE },
  { id: "croquete-requeijao", name: "Croquete c/ requeijão", price: 27, packSize: CONGELADOS_PACK_SIZE },
  { id: "pastelzinho-carne", name: "Pastelzinho de carne", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "pastelzinho-queijo", name: "Pastelzinho de queijo", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-churros", name: "Mini churros", price: 27, packSize: CONGELADOS_PACK_SIZE },
  { id: "sortidos", name: "Sortidos", price: 25, packSize: CONGELADOS_PACK_SIZE },
]

export const congeladosAssados: FlavorPack[] = [
  { id: "esfiha-frango", name: "Esfiha de frango", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "esfiha-carne", name: "Esfiha de carne", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "empadinha-frango", name: "Empadinha de frango", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "empadinha-brocolis", name: "Empadinha de brócolis", price: 35, packSize: CONGELADOS_PACK_SIZE },
  { id: "enrolado-salsicha-assado", name: "Enrolado de salsicha", price: 25, packSize: CONGELADOS_PACK_SIZE },
  { id: "pastelzinho-carne-assado", name: "Pastelzinho de carne", price: 30, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-pizza-mussarela", name: "Mini pizza mussarela", price: 35, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-pizza-frango", name: "Mini pizza frango", price: 35, packSize: CONGELADOS_PACK_SIZE },
  { id: "mini-pizza-calabresa", name: "Mini pizza calabresa", price: 35, packSize: CONGELADOS_PACK_SIZE },
]
