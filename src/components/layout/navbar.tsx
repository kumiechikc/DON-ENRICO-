"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onCartOpen: () => void
}

const navLinks = [
  { label: "Cardápio", href: "#cardapio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
]

export function Navbar({ onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b-2 border-b-transparent shadow-lg"
          : "bg-transparent"
      )}
      style={scrolled ? { borderImage: "linear-gradient(135deg, #CC0000, #EA580C, #F97316, #F28C28) 1" } : undefined}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 md:h-20">
        <a href="#" className="font-heading text-lg md:text-xl font-bold tracking-widest uppercase">
          <span className="text-foreground">Don </span>
          <span className="text-primary">Enrico</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCartOpen}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={`Carrinho com ${totalItems} itens`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-5 right-5 p-2"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </button>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-heading text-2xl font-bold tracking-wide text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
