"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import type { CartItem, CartAction } from "./types"

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((i) => i.id === action.item.id)
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...state, { ...action.item, quantity: 1 }]
    }
    case "REMOVE_ITEM":
      return state.filter((i) => i.id !== action.id)
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return state.filter((i) => i.id !== action.id)
      }
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: action.quantity } : i
      )
    case "CLEAR":
      return []
    default:
      return state
  }
}

const STORAGE_KEY = "don-enrico-cart"

/*
 * O que está no localStorage veio de uma versão anterior do site ou de alguém
 * editando à mão, então nada aqui é confiável: cada campo é validado antes de
 * virar estado. Um carrinho corrompido é descartado em silêncio em vez de
 * quebrar a página.
 */
function parseStoredCart(raw: string): CartItem[] {
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) return []

  return parsed.flatMap((entry): CartItem[] => {
    if (typeof entry !== "object" || entry === null) return []
    const { id, sku, name, price, quantity, flavors } = entry as Record<string, unknown>

    if (typeof id !== "string" || id === "") return []
    if (typeof name !== "string" || name === "") return []
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) return []
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return []
    }

    return [
      {
        id,
        /*
         * Carrinho salvo antes de o SKU existir não tem esse campo. Em vez de
         * descartar o pedido de alguém que estava montando, cai no id sem os
         * sabores: nas linhas de festa isso já é o SKU certo, e nas demais o
         * registro na planilha anota o item como "conferir" — o pedido no
         * WhatsApp continua completo de qualquer jeito.
         */
        sku: typeof sku === "string" && sku !== "" ? sku : id.split("__")[0],
        name,
        price,
        quantity,
        flavors: Array.isArray(flavors)
          ? flavors.filter((f): f is string => typeof f === "string")
          : [],
      },
    ]
  })
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? parseStoredCart(saved) : []
  } catch {
    // localStorage bloqueado (aba anônima, cookies desligados) ou JSON inválido.
    return []
  }
}

/*
 * `false` no servidor e `true` depois que o React assume a página. Isso deixa a
 * primeira renderização do navegador idêntica à do servidor (carrinho vazio) e
 * só então revela o que estava salvo — sem descasamento de hidratação e sem
 * chamar setState dentro de efeito.
 */
const emptySubscribe = () => () => {}
function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const hasMounted = useHasMounted()
  // O initializer preguiçoso roda uma vez: no servidor devolve [], no navegador
  // já devolve o carrinho salvo, sem precisar de um efeito para carregá-lo.
  const [items, dispatch] = useReducer(cartReducer, undefined, readStoredCart)

  useEffect(() => {
    if (!hasMounted) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Sem espaço ou sem permissão: o carrinho segue funcionando na memória.
    }
  }, [items, hasMounted])

  const value = useMemo<CartContextValue>(() => {
    const visible = hasMounted ? items : []
    return {
      items: visible,
      totalItems: visible.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: visible.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
      updateQuantity: (id, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", id, quantity }),
      clearCart: () => dispatch({ type: "CLEAR" }),
    }
  }, [items, hasMounted])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider")
  return ctx
}
