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
 * ─────────────────────────────────────────────────────────────────────────────
 * SÃO TRÊS ESTADOS, E NÃO DOIS. A DIFERENÇA IMPORTA.
 *
 * A primeira versão tinha uma chave só: ou anima tudo, ou nada. O "nada" valia
 * para dois casos muito diferentes — quem PEDIU menos movimento no sistema, e
 * quem tem um aparelho fraco. Tratá-los igual custou caro: com o hero virando
 * vídeo, o aparelho fraco passou a ficar sem a peça principal do site, e a
 * página inteira perdia a personalidade justamente para o público que ela
 * atende.
 *
 * O motivo original da trava era o shader WebGL, que é caro de verdade. Vídeo
 * não é a mesma coisa: todo celular dos últimos dez anos decodifica H.264 em
 * hardware, e um `<video>` de fundo custa menos que o shader que ele substituiu.
 *
 *   "completo"  tudo ligado: Lenis, ScrollTrigger, revelações e vídeo.
 *   "video"     aparelho fraco. Sem rolagem interpolada, sem animação amarrada
 *               ao scroll, sem shader — mas o vídeo toca, porque é barato e é
 *               o que a página tem de melhor.
 *   "nenhum"    a pessoa PEDIU menos movimento. Aqui nada se mexe, nem o vídeo.
 *               É preferência declarada, não palpite sobre o aparelho.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Nivel = "completo" | "video" | "nenhum"

const MotionContext = createContext<Nivel>("nenhum")

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
 * A preferência declarada vem primeiro e é absoluta. Memória e núcleos vêm
 * depois e só rebaixam para "video": rodar Lenis e ScrollTrigger num Android de
 * entrada trava a rolagem, mas tirar o vídeo dele seria punir o aparelho por
 * algo que ele faz bem.
 *
 * A ausência das duas informações é tratada como "dá conta", para não castigar
 * quem usa navegador que não as expõe — o Safari, por exemplo, não tem
 * `deviceMemory`.
 *
 * Devolve string e não objeto de propósito: `useSyncExternalStore` compara por
 * identidade, e um objeto novo a cada leitura faria a página renderizar em laço.
 */
function getSnapshot(): Nivel {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return "nenhum"

  const nav = navigator as Navigator & { deviceMemory?: number }
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return "video"
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) {
    return "video"
  }
  return "completo"
}

/*
 * No servidor o nível é "nenhum": o HTML sai no estado final, sem vídeo e sem
 * animação, e o cliente decide depois. Isso mantém a primeira renderização
 * idêntica dos dois lados, que é o que evita erro de hidratação.
 */
const getServerSnapshot = (): Nivel => "nenhum"

export function MotionProvider({ children }: { children: ReactNode }) {
  const nivel = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const motionEnabled = nivel === "completo"

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

  return <MotionContext.Provider value={nivel}>{children}</MotionContext.Provider>
}

/**
 * `motionEnabled` — animação amarrada ao scroll, revelações, shader.
 * `videoEnabled` — o `<video>` pode ser montado e tocar.
 *
 * Os dois só coincidem nos extremos. No meio fica o aparelho fraco, que ganha o
 * vídeo e não ganha o resto.
 */
export function useMotion() {
  const nivel = useContext(MotionContext)
  return { motionEnabled: nivel === "completo", videoEnabled: nivel !== "nenhum" }
}
