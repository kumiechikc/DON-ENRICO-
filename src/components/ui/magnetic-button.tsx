"use client"

import {
  useRef,
  useEffect,
  type ReactNode,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react"
import { gsap } from "gsap"
import { useMotion } from "@/lib/motion/motion-provider"

/*
 * Botão magnético: o elemento se inclina na direção do cursor quando ele chega
 * perto e volta com elasticidade ao sair. É um dos detalhes que separa site
 * caprichado de template — a interface reage antes do clique.
 *
 * Restrições que o mantêm honesto:
 * — deslocamento pequeno (máximo ~10px), para o alvo não fugir do cursor de
 *   quem tem dificuldade motora;
 * — nada é registrado quando o movimento está desligado, nem em aparelho sem
 *   ponteiro fino, onde não existe hover e o efeito só custaria bateria.
 *
 * A tipagem é uma união discriminada em vez de genérico polimórfico: só existem
 * dois casos reais (link e botão) e a união os infere corretamente, enquanto o
 * genérico apagava as props do elemento.
 */
type Common = { children: ReactNode; strength?: number }

type Props =
  | (Common & { as: "a" } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | (Common & { as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)

function useMagnet(strength: number) {
  const ref = useRef<HTMLElement>(null)
  const { motionEnabled } = useMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !motionEnabled) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

    const quickX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" })
    const quickY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" })

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      quickX((dx / rect.width) * strength * 2)
      quickY((dy / rect.height) * strength * 2)
    }
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" })
    }

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
      gsap.killTweensOf(el)
    }
  }, [motionEnabled, strength])

  return ref
}

export function MagneticButton(props: Props) {
  const { children, strength = 10 } = props
  const ref = useMagnet(strength)

  if (props.as === "a") {
    const { as: _as, children: _c, strength: _s, ...anchorProps } = props
    void _as
    void _c
    void _s
    return (
      <a ref={ref as React.RefObject<HTMLAnchorElement>} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { as: _as, children: _c, strength: _s, ...buttonProps } = props
  void _as
  void _c
  void _s
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      {...buttonProps}
    >
      {children}
    </button>
  )
}
