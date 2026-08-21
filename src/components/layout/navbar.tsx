"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { useDialog } from "@/lib/hooks/use-dialog"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Festa", href: "#festa" },
  { label: "Box", href: "#box" },
  { label: "Congelados", href: "#congelados" },
  { label: "Contato", href: "#contato" },
]

export function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const menuRef = useDialog(menuOpen, () => setMenuOpen(false))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-200",
        scrolled ? "bg-bg/95 backdrop-blur border-b border-border" : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16 md:h-20">
        <a href="#" className="type-display text-base md:text-lg text-fg shrink-0">
          Don Enrico
        </a>

        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-semibold text-fg-muted hover:text-fg transition-colors duration-150"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCartOpen}
            className="relative inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] lg:px-3 text-fg hover:text-accent transition-colors duration-150"
            aria-label={
              totalItems > 0
                ? `Abrir pedido — ${totalItems} ${totalItems === 1 ? "item" : "itens"}`
                : "Abrir pedido, vazio"
            }
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            <span className="hidden lg:inline ml-2 text-sm font-semibold">Pedido</span>
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 min-w-[1.15rem] h-[1.15rem] px-1 bg-accent text-white text-[0.7rem] font-bold flex items-center justify-center rounded-full tabular-nums"
              >
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="md:hidden inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] text-fg"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          ref={menuRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="md:hidden fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center gap-7"
        >
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute top-3 right-4 inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.75rem] text-fg"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="type-display text-2xl text-fg hover:text-accent transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
