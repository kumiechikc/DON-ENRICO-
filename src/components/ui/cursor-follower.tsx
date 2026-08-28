"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useMotion } from "@/lib/motion/motion-provider"
import { CURSOR, DURACAO, EASE } from "@/lib/motion/tokens"

/*
 * Anel que segue o ponteiro e cresce sobre o que é clicável.
 *
 * A decisão que importa aqui é o que NÃO fazer: o cursor do sistema continua
 * visível. Trocar o cursor nativo por um ponto desenhado é o erro comum desta
 * técnica — destrói as affordances que a pessoa já conhece (a mãozinha do link,
 * a barra do texto), atrapalha quem tem baixa visão e não sobrevive a nenhum
 * travamento de JavaScript. O anel é uma camada extra, nunca um substituto.
 *
 * Só existe em aparelho com ponteiro fino e movimento ligado; no celular não é
 * criado, então não custa nada.
 */
export function CursorFollower() {
  const ringRef = useRef<HTMLDivElement>(null)
  const { motionEnabled } = useMotion()

  useEffect(() => {
    const ring = ringRef.current
    if (!ring || !motionEnabled) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

    // `quickTo` cria um setter interpolado reutilizável: bem mais barato que
    // disparar um tween novo a cada movimento do mouse.
    const seguir = {
      duration: CURSOR.duracaoSeguir,
      ease: EASE.acompanhamento,
    }
    const moveX = gsap.quickTo(ring, "x", seguir)
    const moveY = gsap.quickTo(ring, "y", seguir)

    let visible = false

    const onMove = (event: PointerEvent) => {
      if (!visible) {
        visible = true
        gsap.to(ring, {
          opacity: 1,
          duration: DURACAO.reacao,
          ease: EASE.estado,
        })
      }
      moveX(event.clientX)
      moveY(event.clientY)

      // Cresce e muda de cor sobre qualquer coisa acionável.
      const overInteractive = !!(event.target as Element)?.closest?.(
        'a[href], button, [role="button"], input, select, textarea'
      )
      gsap.to(ring, {
        scale: overInteractive ? CURSOR.escalaSobreAlvo : 1,
        borderColor: overInteractive
          ? "rgba(245,165,36,0.9)"
          : "rgba(248,239,227,0.35)",
        duration: DURACAO.reacao,
        ease: EASE.estado,
        overwrite: "auto",
      })
    }

    const onLeave = () => {
      visible = false
      gsap.to(ring, {
        opacity: 0,
        duration: DURACAO.saida,
        ease: EASE.estado,
      })
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
      gsap.killTweensOf(ring)
    }
  }, [motionEnabled])

  if (!motionEnabled) return null

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9998] h-8 w-8 -ml-4 -mt-4 rounded-full border opacity-0 will-change-transform"
      style={{ borderColor: "rgba(248,239,227,0.35)" }}
    />
  )
}
