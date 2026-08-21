"use client"

import { useEffect, useRef } from "react"

/**
 * Marca como `inert` tudo que não faz parte do diálogo.
 *
 * A armadilha de foco resolve o Tab, mas não a árvore de acessibilidade: sem
 * isto, quem usa leitor de tela continua conseguindo percorrer o rodapé e o
 * cardápio por trás de um menu aberto, como se a página estivesse normal.
 *
 * O algoritmo sobe do painel até o body e, em cada nível, marca os irmãos que
 * não estão no caminho — assim funciona mesmo quando o diálogo mora dentro do
 * header, que é o caso do menu do celular.
 */
function inertBackground(panel: HTMLElement): () => void {
  const marcados: HTMLElement[] = []

  let node: HTMLElement | null = panel
  while (node && node.parentElement && node !== document.body) {
    for (const irmao of Array.from(node.parentElement.children)) {
      if (irmao === node) continue
      if (!(irmao instanceof HTMLElement)) continue
      if (irmao.hasAttribute("inert")) continue
      irmao.setAttribute("inert", "")
      marcados.push(irmao)
    }
    node = node.parentElement
  }

  return () => marcados.forEach((el) => el.removeAttribute("inert"))
}

/**
 * Comportamento de diálogo modal para camadas abertas por cima da página
 * (carrinho e menu do celular): fecha no Esc, prende o Tab dentro do painel,
 * esconde o fundo de leitores de tela, trava a rolagem e devolve o foco a quem
 * abriu.
 *
 * Devolve a ref que deve ser colocada no elemento do painel.
 */
export function useDialog(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    openerRef.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    // Foca o próprio painel: leitores de tela anunciam o diálogo antes de o
    // usuário começar a tabular pelo conteúdo.
    panel?.focus()

    const restaurarFundo = panel ? inertBackground(panel) : () => {}

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== "Tab" || !panel) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      restaurarFundo()
      document.body.style.overflow = previousOverflow
      openerRef.current?.focus()
    }
  }, [open, onClose])

  return panelRef
}
