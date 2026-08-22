"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Diz se o elemento está na tela, e se já esteve alguma vez.
 *
 * `ativo` costuma ser o `motionEnabled` do MotionProvider. Quando ele é falso,
 * nenhum observador é criado: em aparelho fraco ou com movimento reduzido, o
 * custo não é só a animação, é também a própria máquina de observar.
 *
 * `jaApareceu` gruda em verdadeiro. Serve para o que é caro de buscar e não
 * deve ser jogado fora ao sair da tela — um vídeo já baixado, por exemplo:
 * desmontá-lo obrigaria a baixar de novo na volta, o oposto da economia.
 *
 * A margem de 200px acorda o elemento um pouco antes de aparecer, para ele já
 * estar pronto quando o olho chegar.
 */
export function useVisivel<T extends HTMLElement = HTMLDivElement>(ativo: boolean) {
  const ref = useRef<T>(null)
  const [estado, setEstado] = useState({ visivel: false, jaApareceu: false })

  useEffect(() => {
    if (!ativo) return
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entrada]) => {
        setEstado((anterior) => ({
          visivel: entrada.isIntersecting,
          jaApareceu: anterior.jaApareceu || entrada.isIntersecting,
        }))
      },
      { rootMargin: "200px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ativo])

  /*
   * O desligamento é derivado, não guardado. Zerar o estado dentro do efeito
   * quando `ativo` fica falso provocaria uma renderização em cascata a cada
   * mudança de preferência — e o resultado seria o mesmo destes dois `&&`.
   */
  return {
    ref,
    visivel: ativo && estado.visivel,
    jaApareceu: ativo && estado.jaApareceu,
  }
}
