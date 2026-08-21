"use client"

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/*
 * Fundação de movimento do site.
 *
 * Uma decisão define tudo o que vem depois: `motionEnabled` é a chave mestra.
 * Quando ela é falsa — porque a pessoa pediu menos movimento no sistema, ou
 * porque o aparelho não dá conta — nenhuma animação é registrada, o scroll
 * suave nem inicia, e o conteúdo aparece direto no estado final. Não existe
 * "meia animação": ou anima direito, ou é estático e perfeitamente legível.
 *
 * É o que separa site premiado de demo bonita: a demo assume desktop potente,
 * o site profissional trata o resto do mundo como caso principal.
 */

const MotionContext = createContext<boolean>(false)

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/**
 * Assina a preferência do sistema. Ficar ouvindo em vez de ler uma vez faz o
 * site responder na hora se a pessoa ligar "reduzir movimento" com a página
 * aberta — situação real de quem ativa o ajuste por causa de enjoo.
 */
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/*
 * Além da preferência declarada, olha memória e núcleos: rodar shader e
 * ScrollTrigger num Android de entrada — que é boa parte do público de um site
 * de salgados em Porto Alegre — trava a rolagem e gasta bateria. A ausência das
 * duas informações é tratada como "provavelmente dá conta", para não punir quem
 * só usa um navegador que não as expõe.
 */
function getSnapshot(): boolean {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return false

  const nav = navigator as Navigator & { deviceMemory?: number }
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) {
    return false
  }
  return true
}

// No servidor não há movimento: o HTML sai no estado final e o cliente decide
// depois se anima. Isso mantém a primeira renderização idêntica dos dois lados.
const getServerSnapshot = () => false

export function MotionProvider({ children }: { children: ReactNode }) {
  const motionEnabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    // A classe deixa o CSS desligar as revelações sem depender de JavaScript
    // ter rodado em cada componente.
    document.documentElement.classList.toggle("no-motion", !motionEnabled)
  }, [motionEnabled])

  useEffect(() => {
    if (!motionEnabled) return

    gsap.registerPlugin(ScrollTrigger)

    /*
     * Lenis interpola a rolagem — é a base do "toque" dos sites premiados. Sem
     * isso, qualquer animação amarrada ao scroll fica no passo travado do mouse
     * wheel. O ScrollTrigger precisa ser avisado a cada quadro para os dois
     * relógios não desencontrarem.
     */
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // No toque a rolagem nativa é melhor que qualquer interpolação: mexer
      // nela quebra o "flick" que o sistema já faz bem.
      syncTouch: false,
    })

    lenis.on("scroll", ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [motionEnabled])

  return (
    <MotionContext.Provider value={motionEnabled}>{children}</MotionContext.Provider>
  )
}

export function useMotion() {
  return { motionEnabled: useContext(MotionContext) }
}
