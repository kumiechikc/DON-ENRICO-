export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: "salgado" | "doce"
  emoji: string
}

export const products: Product[] = [
  {
    id: "coxinha",
    name: "Coxinha de Frango",
    description: "Massa crocante recheada com frango desfiado temperado",
    price: 2.5,
    category: "salgado",
    emoji: "🍗",
  },
  {
    id: "bolinha-queijo",
    name: "Bolinha de Queijo",
    description: "Queijo derretido envolto em massa dourada e crocante",
    price: 2.5,
    category: "salgado",
    emoji: "🧀",
  },
  {
    id: "risoles",
    name: "Risoles Presunto e Queijo",
    description: "Massa fininha recheada com presunto e queijo cremoso",
    price: 2.5,
    category: "salgado",
    emoji: "🥟",
  },
  {
    id: "calabresinha",
    name: "Calabresinha c/Cheddar",
    description: "Calabresa defumada com cheddar cremoso",
    price: 3.0,
    category: "salgado",
    emoji: "🌶️",
  },
  {
    id: "croquete",
    name: "Croquete c/ Requeijão",
    description: "Croquete crocante com requeijão derretido",
    price: 2.5,
    category: "salgado",
    emoji: "🟤",
  },
  {
    id: "enroladinho",
    name: "Enroladinho de Salsicha",
    description: "Salsicha enrolada em massa folhada dourada",
    price: 2.0,
    category: "salgado",
    emoji: "🌭",
  },
  {
    id: "pastel-carne",
    name: "Pastelzinho de Carne",
    description: "Mini pastel crocante com recheio de carne temperada",
    price: 2.5,
    category: "salgado",
    emoji: "🥩",
  },
  {
    id: "pastel-queijo",
    name: "Pastelzinho de Queijo",
    description: "Mini pastel crocante com queijo derretido",
    price: 2.5,
    category: "salgado",
    emoji: "🧀",
  },
  {
    id: "mini-churros",
    name: "Mini Churros",
    description: "Churros crocantes com açúcar e canela",
    price: 2.0,
    category: "doce",
    emoji: "🍩",
  },
]

export interface Box {
  id: string
  name: string
  quantity: number
  price: number
  description: string
}

export const boxes: Box[] = [
  {
    id: "box-25",
    name: "Box Degustação 25un",
    quantity: 25,
    price: 19.9,
    description: "Escolha entre nossos salgados sortidos",
  },
  {
    id: "box-50",
    name: "Box Degustação 50un",
    quantity: 50,
    price: 39.9,
    description: "Escolha entre nossos salgados sortidos",
  },
]
