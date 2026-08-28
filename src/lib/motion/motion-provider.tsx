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
import { LENIS } from "./tokens"

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
 *   "leve"      aparelho fraco. Sem rolagem interpolada e sem nada amarrado ao
 *               scroll — mas COM vídeo e COM os laços de transformação, que são
 *               compostos na GPU e custam quase nada.
 *   "nenhum"    a pessoa PEDIU menos movimento. Aqui nada se mexe, nem o vídeo.
 *               É preferência declarada, não palpite sobre o aparelho.
 *
 * A separação entre "completo" e "leve" é por CUSTO REAL, e a primeira versão
 * errou nisso. O caro é o Lenis, que sequestra a rolagem e interpola posição a
 * cada quadro, e o ScrollTrigger, que mede layout a cada evento. O barato é uma
 * `transform` em laço num elemento com `will-change` — a esteira de sabores é
 * exatamente isso, e ficou desligada no celular do dono do site sem precisar.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Nivel = "completo" | "leve" | "nenhum"

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
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return "leve"
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) {
    return "leve"
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
      duration: LENIS.duracao,
      easing: LENIS.easing,
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
 * Três perguntas diferentes, porque três coisas custam diferente.
 *
 * `motionEnabled` — vale a pena o que é CARO: Lenis, ScrollTrigger, shader, e
 *                   qualquer animação que precise medir o scroll.
 * `videoEnabled`  — o `<video>` pode ser montado e tocar.
 * `lacosLeves`    — laços de `transform` compostos na GPU, como a esteira de
 *                   sabores. Custam quase nada e não medem layout.
 *
 * Um componente que pergunta `motionEnabled` para decidir sobre uma `transform`
 * está desligando algo barato junto com o caro. Foi o que aconteceu com a
 * esteira.
 */
export function useMotion() {
  const nivel = useContext(MotionContext)
  return {
    motionEnabled: nivel === "completo",
    videoEnabled: nivel !== "nenhum",
    lacosLeves: nivel !== "nenhum",
  }
}
