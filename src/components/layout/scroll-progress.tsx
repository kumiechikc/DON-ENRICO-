"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useMotion } from "@/lib/motion/motion-provider"
import { EASE } from "@/lib/motion/tokens"

/*
 * Registro no nível do módulo, pelo mesmo motivo escrito em `use-reveal.ts`:
 * React roda os efeitos de baixo para cima, então registrar dentro de um
 * provider deixaria os primeiros gatilhos chamando um plugin ausente. É
 * idempotente; repetir não custa.
 */
gsap.registerPlugin(ScrollTrigger)

/*
 * A barra de progresso da rolagem.
 * ─────────────────────────────────────────────────────────────────────────────
 * É a primeira peça do site presa ao PROGRESSO da rolagem, e não disparada por
 * ela. Até aqui, `scrub` não aparecia em uma linha do código (`docs/BRIEF-MOVIMENTO.md`
 * §1.2); os três arquivos que tocavam em ScrollTrigger usavam-no só como detector
 * de entrada em viewport.
 *
 * POR QUE ELA EXISTE, E A PERGUNTA QUE ELA RESPONDE
 *
 * O site é um cardápio único de 8.390px, sem paginação e sem índice. Quem rola
 * não tem como saber se falta um terço ou se acabou. A pergunta "isso ainda vai
 * longe?" é de quem está decidindo se continua ou se já chama no WhatsApp — e é
 * a única razão pela qual esta barra passou pelo corte de §3.1, que exige que
 * cada peça responda a algo que o cliente pergunta de verdade.
 *
 * O padrão veio medido de lenis.dev, onde `scrollbar__inner` faz scaleX
 * 0 → 0,171 → 0,342 ao longo da página (`docs/BRIEF-MOVIMENTO.md` §2.3).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRÊS DECISÕES QUE PARECEM DETALHE E NÃO SÃO
 *
 * 1. `scaleX`, e não `width`. Largura é layout: animá-la a cada quadro obriga o
 *    navegador a recalcular e reintroduz o risco de CLS, que hoje está em zero e
 *    é conferido por máquina. `transform` roda no compositor e não toca layout.
 *    É a regra que a auditoria achou nos cinco sites: nenhum deles anima altura,
 *    largura, `top` ou `margin` (§2.6, lição 2).
 *
 * 2. `scrub: true`, sem número. Um número (`scrub: 0.5`) adiciona suavização
 *    própria, e o site já tem a do Lenis. As duas empilhadas atrasam a barra
 *    visivelmente em relação ao conteúdo, e uma barra de progresso que mente
 *    sobre a posição é pior do que barra nenhuma.
 *
 * 3. Ela não é renderizada quando o movimento está desligado. Não é preguiça: a
 *    arquitetura põe ScrollTrigger inteiro atrás de `motionEnabled` (decisão de
 *    2026-08-22), então sem ele a barra ficaria parada em zero — afirmando "você
 *    está no topo" para quem está no rodapé. Ausente é honesto; travada é falso,
 *    e a barra nativa do navegador continua lá para quem precisa se situar.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const { motionEnabled } = useMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !motionEnabled) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          /*
           * Progresso é linear por definição: qualquer curva mentiria sobre a
           * posição. `EASE.continuo` é o token que já guarda o "sem curva" —
           * escrever `"none"` aqui na mão é o que `check:movimento` reprova, e
           * com razão: era assim que as quatro curvas herdadas nasceram.
           */
          ease: EASE.continuo,
          scrollTrigger: {
            /*
             * O INTERVALO É NUMÉRICO, E ISSO CUSTOU UMA MEDIÇÃO.
             *
             * A primeira versão usava `trigger: document.documentElement` com
             * `start: "top top"` e `end: "bottom bottom"`, que é o que a
             * intuição pede para "a página inteira". A barra ficou parada em
             * zero, com o GSAP escrevendo `scale(0, 1)` a cada quadro — viva,
             * atualizando, e sempre no mesmo valor.
             *
             * A causa: `<html>` mede 900px de altura, não os 8390 da página.
             * `scrollHeight` é 8390, mas `getBoundingClientRect().height` e
             * `offsetHeight` são 900, porque o elemento tem altura de uma tela e
             * quem rola é o `<body>` (8389,7px). ScrollTrigger posiciona por
             * rect, então `start` e `end` caíram os dois no mesmo ponto: um
             * intervalo de comprimento zero, onde progresso não tem para onde
             * andar.
             *
             * Trocar para `document.body` funcionaria, mas continuaria medindo
             * geometria de elemento para responder uma pergunta que não é sobre
             * elemento nenhum. Uma barra de progresso do documento quer o
             * INTERVALO DE ROLAGEM, e `ScrollTrigger.maxScroll` devolve
             * exatamente isso, sem intermediário que possa medir errado.
             */
            start: 0,
            /*
             * Função, e não número, junto com `invalidateOnRefresh`: a altura da
             * página muda quando a fonte assenta, quando o carrinho abre, quando
             * a janela gira. Um número capturado na montagem ficaria mentindo
             * sobre o fim da página pelo resto da sessão — que é a mesma
             * família de defeito que o parágrafo acima descreve.
             */
            end: () => ScrollTrigger.maxScroll(window),
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [motionEnabled])

  if (!motionEnabled) return null

  return (
    <div
      ref={ref}
      /*
       * `aria-hidden` porque a informação é duplicada: quem usa leitor de tela
       * ou teclado já recebe a posição pela barra de rolagem do navegador e pela
       * ordem de foco. Anunciar um progresso decorativo a cada quadro seria
       * ruído, não acesso.
       */
      aria-hidden="true"
      /*
       * `origin-left` faz a barra crescer da esquerda; sem isso o `scaleX`
       * expande a partir do centro e a barra abre para os dois lados.
       * `bottom-0` a assenta sobre a borda inferior do cabeçalho, que já é fixo
       * — dentro de um elemento fora do fluxo, `absolute` não custa layout.
       */
      className="absolute bottom-0 inset-x-0 h-[3px] origin-left scale-x-0 bg-amber"
    />
  )
}
