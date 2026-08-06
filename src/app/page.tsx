"use client"

import { useState } from "react"
import { CartProvider } from "@/lib/cart/cart-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/hero/hero-section"
import { BoxSection } from "@/components/sections/box-section"
import { CardapioSection } from "@/components/sections/cardapio-section"
import { CongeladosSection } from "@/components/sections/congelados-section"
import { SobreSection } from "@/components/sections/sobre-section"
import { DepoimentosSection } from "@/components/sections/depoimentos-section"
import { LocalizacaoSection } from "@/components/sections/localizacao-section"
import { ContatoSection } from "@/components/sections/contato-section"
import { CartDrawer } from "@/components/cart/cart-drawer"

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <CartProvider>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="overflow-x-hidden">
        <HeroSection />
        <BoxSection />
        <CardapioSection />
        <CongeladosSection />
        <SobreSection />
        <DepoimentosSection />
        <LocalizacaoSection />
        <ContatoSection />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </CartProvider>
  )
}
