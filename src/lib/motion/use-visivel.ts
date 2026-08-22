"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Diz se o elemento está na tela, e em que medida.
 *
 * `ativo` costuma ser o `videoEnabled` ou o `motionEnabled` do MotionProvider.
 * Quando ele é falso, nenhum observador é criado: em aparelho fraco ou com
 * movimento reduzido, o custo não é só a animação, é também a própria máquina
 * de observar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SÃO TRÊS RESPOSTAS, PORQUE SÃO TRÊS PERGUNTAS.
 *
 * `visivel`     — está perto, com 200px de folga. Serve para COMEÇAR A BAIXAR:
 *                 o arquivo precisa de tempo de antecedência para estar pronto
 *                 quando o olho chegar.
 * `jaApareceu`  — gruda em verdadeiro. Serve para o que é caro de buscar e não
 *                 deve ser jogado fora ao sair da tela — um vídeo já baixado,
 *                 por exemplo: desmontá-lo obrigaria a baixar de novo na volta.
 * `bemVisivel`  — está REALMENTE sendo visto, um terço dele dentro da janela e
 *                 sem folga nenhuma. Serve para COMEÇAR A TOCAR.
 *
 * A distinção entre `visivel` e `bemVisivel` não é preciosismo, é um defeito que
 * aconteceu: o clipe do corte toca uma vez e para no último quadro. Com os 200px
 * de folga ele começava antes de entrar na tela e, num celular rolando devagar,
 * já tinha acabado quando a pessoa chegava nele. O dono do site relatou uma
 * "foto estática" — era o último quadro do vídeo, parado.
 *
 * Baixa cedo, toca na hora.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function useVisivel<T extends HTMLElement = HTMLDivElement>(ativo: boolean) {
  const ref = useRef<T>(null)
  const [estado, setEstado] = useState({
    visivel: false,
    jaApareceu: false,
    bemVisivel: false,
  })

  useEffect(() => {
    if (!ativo) return
    const el = ref.current
    if (!el) return

    // Perto: com folga, para dar tempo de baixar.
    const perto = new IntersectionObserver(
      ([entrada]) => {
        setEstado((anterior) => ({
          ...anterior,
          visivel: entrada.isIntersecting,
          jaApareceu: anterior.jaApareceu || entrada.isIntersecting,
        }))
      },
      { rootMargin: "200px" }
    )

    /*
     * Sendo visto: sem folga e com um terço à mostra. Dois observadores em vez
     * de um com várias soleiras porque a `intersectionRatio` é medida contra a
     * raiz JÁ EXPANDIDA pelo `rootMargin` — misturar os dois daria uma fração
     * que não corresponde ao que a pessoa enxerga.
     */
    const vendo = new IntersectionObserver(
      ([entrada]) => {
        setEstado((anterior) => ({ ...anterior, bemVisivel: entrada.isIntersecting }))
      },
      { threshold: 0.34 }
    )

    perto.observe(el)
    vendo.observe(el)
    return () => {
      perto.disconnect()
      vendo.disconnect()
    }
  }, [ativo])

  /*
   * O desligamento é derivado, não guardado. Zerar o estado dentro do efeito
   * quando `ativo` fica falso provocaria uma renderização em cascata a cada
   * mudança de preferência — e o resultado seria o mesmo destes `&&`.
   */
  return {
    ref,
    visivel: ativo && estado.visivel,
    jaApareceu: ativo && estado.jaApareceu,
    bemVisivel: ativo && estado.bemVisivel,
  }
}
