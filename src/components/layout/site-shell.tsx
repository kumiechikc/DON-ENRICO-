"use client"

import { useState, useCallback, type ReactNode } from "react"
import { CartProvider } from "@/lib/cart/cart-context"
import { MotionProvider } from "@/lib/motion/motion-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CursorFollower } from "@/components/ui/cursor-follower"
import { IntroCurtain } from "@/components/ui/intro-curtain"

/*
 * Only the shell is a Client Component. As seções entram por `children` já
 * renderizadas no servidor, então o cardápio continua HTML estático — o
 * JavaScript cuida do carrinho e do movimento, não do conteúdo.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const closeCart = useCallback(() => setCartOpen(false), [])

  return (
    <MotionProvider>
      <CartProvider>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-amber focus:text-bg focus:px-4 focus:py-2 focus:font-bold focus:text-sm"
        >
          Pular para o conteúdo
        </a>

        <Navbar onCartOpen={() => setCartOpen(true)} />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer open={cartOpen} onClose={closeCart} />
        <CursorFollower />
        <IntroCurtain />
      </CartProvider>
    </MotionProvider>
  )
}
