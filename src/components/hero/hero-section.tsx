"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useMotion } from "@/lib/motion/motion-provider"
import { useSplitReveal } from "@/lib/motion/use-split-text"
import { EASE, HERO } from "@/lib/motion/tokens"
import { getWhatsAppDirectUrl } from "@/lib/cart/whatsapp"
import { boxDegustacao } from "@/lib/data/menu"
import { site } from "@/lib/site"
import { formatPrice } from "@/lib/utils"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { CinemaLoop } from "@/components/media/cinema-loop"
import { acharClipe } from "@/lib/media/clipes"

/*
 * O shader entra por import dinâmico e sem SSR: WebGL não existe no servidor, e
 * mantê-lo fora do bundle inicial deixa o primeiro pixel da página aparecer sem
 * esperar por ele.
 */
const HeatShader = dynamic(() => import("./heat-shader"), {
  ssr: false,
  loading: () => null,
})

/*
 * Registro no nível do módulo, pelo mesmo motivo escrito em `use-reveal.ts`:
 * React roda os efeitos de baixo para cima, então registrar dentro de um
 * provider deixaria os primeiros gatilhos chamando um plugin ausente.
 */
gsap.registerPlugin(ScrollTrigger)

/*
 * A altura MÁXIMA que a janela pode assumir, e por que ela não é `innerHeight`.
 *
 * O hero é `min-h-[100svh]` — `svh` é o viewport PEQUENO, medido com a barra de
 * endereço do celular aberta. Quando ela se recolhe, a área visível cresce e
 * passa a ser maior que a seção. É exatamente nesse instante que uma camada
 * transladada revelaria vazio embaixo, e é por isso que a folga se calcula
 * contra `lvh` (o viewport GRANDE) e não contra a altura de agora: medir o
 * estado atual daria folga zero no desktop e folga insuficiente no celular
 * justamente quando ela é necessária.
 *
 * Se o navegador não conhecer `lvh`, a altura declarada é inválida, o elemento
 * mede zero, e a conta cai em `innerHeight` — que é o melhor palpite disponível.
 */
function alturaMaximaDaJanela(): number {
  const sonda = document.createElement("div")
  sonda.style.cssText =
    "position:absolute;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none"
  document.body.appendChild(sonda)
  const altura = sonda.getBoundingClientRect().height
  sonda.remove()
  return altura || window.innerHeight
}

export function HeroSection() {
  const { motionEnabled } = useMotion()
  /*
   * Queda em três níveis, do melhor para o que sempre funciona:
   *
   *   1. o clipe, quando existe no manifesto;
   *   2. o shader de calor, que é WebGL e não precisa de arquivo nenhum;
   *   3. o gradiente em CSS, que funciona até sem JavaScript.
   *
   * A escolha é feita aqui e não dentro do CinemaLoop porque o shader custa
   * bateria: rodar os dois ao mesmo tempo seria pagar duas vezes pelo mesmo
   * fundo.
   */
  const clipeDoHero = acharClipe("lampada")
  const titleRef = useSplitReveal<HTMLHeadingElement>({
    delay: HERO.atrasoTitulo,
    label: "Salgados para festa",
  })
  const supportRef = useRef<HTMLDivElement>(null)
  const secaoRef = useRef<HTMLElement>(null)
  const camadaFundoRef = useRef<HTMLDivElement>(null)

  /*
   * O shader só monta depois que a página assentou. Disputar CPU com a
   * hidratação do React atrasa o momento em que a página fica interativa, e o
   * fundo é decoração — pode chegar meio segundo depois sem ninguém notar.
   */
  const [shaderReady, setShaderReady] = useState(false)
  useEffect(() => {
    if (!motionEnabled) return
    const id = window.setTimeout(() => setShaderReady(true), HERO.esperaShaderMs)
    return () => window.clearTimeout(id)
  }, [motionEnabled])

  useEffect(() => {
    if (!motionEnabled) return
    const ctx = gsap.context(() => {
      gsap.from(supportRef.current, {
        opacity: 0,
        y: HERO.deslocamentoApoio,
        duration: HERO.duracaoApoio,
        ease: EASE.entrada,
        delay: HERO.atrasoApoio,
      })
    })
    return () => ctx.revert()
  }, [motionEnabled])

  /*
   * M2 — profundidade no hero (`docs/BRIEF-MOVIMENTO.md` §3.2).
   * ───────────────────────────────────────────────────────────────────────────
   * A camada da luz anda a meia taxa da rolagem. Junto com a barra de progresso,
   * é a segunda peça do site presa ao PROGRESSO da rolagem em vez de disparada
   * por ela.
   *
   * O QUE ELA RESOLVE: o hero é a única tela com mídia sangrando, e ela saía de
   * cena rígida, como um cartaz sendo puxado. Meia taxa dá o afastamento sem que
   * o olho persiga o fundo em vez de ler o título.
   *
   * SÓ A CAMADA 1 SE MEXE, e isso é deliberado. Os dois véus (camadas 2 e 3)
   * ficam parados, porque são eles que sustentam o contraste medido no pixel —
   * o véu de baixo existe por causa de quatro textos que reprovavam, o pior em
   * 1,08:1. Se ele viajasse junto com o clipe, a garantia viajaria com ele.
   *
   * ───────────────────────────────────────────────────────────────────────────
   * A CONTA DA FOLGA, QUE É O ÚNICO JEITO DE NÃO REVELAR BORDA
   *
   * Com H = altura da seção e V = altura máxima da janela, a camada percorre
   * `y = p·H·taxa` enquanto a seção atravessa a tela (p de 0 a 1). O fundo dela
   * fica em `H − p·H·taxa`, que nunca sobe acima do fundo da própria seção — ou
   * seja, ENQUANTO H ≥ V A FOLGA NECESSÁRIA É ZERO. A seção encolhe para fora da
   * tela na mesma conta em que a camada sobe.
   *
   * O caso que quebra é H < V: acontece no celular quando a barra de endereço se
   * recolhe e a janela fica maior que os `100svh` da seção. Aí falta `(V−H)/2`
   * embaixo, e uma escala a partir do centro que resolva isso é
   *
   *     s = 1 + 2·((V−H)/2)/H = V/H
   *
   * Daí `Math.max(1, V/H)`: no desktop dá exatamente 1 (nenhuma escala, nenhuma
   * perda de nitidez no clipe) e no celular dá o mínimo que cobre. É a folga
   * calculada a partir do deslocamento, que era o que o brief exigia em vez de
   * um `1.15` chutado.
   *
   * As duas medidas entram como FUNÇÃO, e o gatilho tem `invalidateOnRefresh`:
   * girar o aparelho muda H e V, e um número capturado no primeiro quadro
   * ficaria mentindo pelo resto da sessão.
   */
  useEffect(() => {
    const secao = secaoRef.current
    const camada = camadaFundoRef.current
    if (!secao || !camada || !motionEnabled) return

    /*
     * `will-change` só depois da primeira rolagem, e não na montagem.
     *
     * O pôster do hero É o elemento de LCP (decisão de 2026-08-22), e o LCP tem
     * orçamento conferido por máquina. Promover a camada a compositor antes do
     * primeiro quadro pintado é mexer no caminho crítico da métrica para ganhar
     * suavidade num movimento que ainda nem começou — ninguém rolou. Depois do
     * primeiro gesto de rolagem, o LCP já aconteceu e a promoção é de graça.
     */
    const promover = () => {
      camada.style.willChange = "transform"
    }
    window.addEventListener("scroll", promover, { once: true, passive: true })

    const ctx = gsap.context(() => {
      const deslocamentoMaximo = () => secao.offsetHeight * HERO.taxaParallax
      const folga = () =>
        Math.max(1, alturaMaximaDaJanela() / Math.max(1, secao.offsetHeight))

      gsap.fromTo(
        camada,
        { y: 0, scale: folga },
        {
          y: deslocamentoMaximo,
          /*
           * A escala é a mesma nas duas pontas: ela não anima, ela só precisa
           * estar aplicada durante a travessia. Declarar nos dois lados é o que
           * mantém a folga sob o mesmo `invalidateOnRefresh` do deslocamento,
           * em vez de virar um `gsap.set` solto que ninguém recalcula.
           */
          scale: folga,
          /*
           * Sem curva: com `scrub`, a curva é a rolagem do usuário. Qualquer
           * easing aqui descolaria a camada do dedo dele.
           */
          ease: EASE.continuo,
          scrollTrigger: {
            trigger: secao,
            start: "top top",
            end: "bottom top",
            /*
             * `scrub: true`, sem número, pelo mesmo motivo escrito em
             * `scroll-progress.tsx`: um número empilha suavização própria em
             * cima da do Lenis, e as duas juntas atrasam a camada de um jeito
             * que se lê como travamento, não como peso.
             */
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      )
    }, secao)

    return () => {
      window.removeEventListener("scroll", promover)
      camada.style.willChange = ""
      ctx.revert()
    }
  }, [motionEnabled])

  const entryPrice = Math.min(...boxDegustacao.tiers.map((t) => t.price))

  return (
    <section
      ref={secaoRef}
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden"
    >
      {/* Camada 1 — a luz. O gradiente é o estado base: se o shader não rodar
          (aparelho fraco, movimento desligado), a cena continua sendo uma
          fritadeira acesa na sombra, não um retângulo preto.

          É esta camada, e só ela, que anda a meia taxa da rolagem (M2). O
          `overflow-hidden` da seção acima é o que recorta o que sobra; sem ele,
          a camada deslocada empurraria a página. */}
      <div
        ref={camadaFundoRef}
        className="absolute inset-0 z-0 bg-[radial-gradient(125%_90%_at_50%_118%,#8A4318_0%,#3A1809_42%,#120B08_76%)]"
      >
        {clipeDoHero ? (
          <CinemaLoop
            clipe="lampada"
            preencher
            className="absolute inset-0"
            /*
             * Em 390x844 o `object-cover` escala o clipe para 1500x844: a altura
             * fecha exata e SÓ A LARGURA sobra. Ou seja o corte é horizontal, e
             * `object-top` não faria nada — o que decide o que sobrevive é o
             * eixo X. Com a lâmpada e a coxinha em x≈800 de 1280, a conta dá
             * 66%. Confirmado na tela em 375, 390 e 430.
             */
            enquadramento="object-[66%_center] lg:object-center"
          />
        ) : (
          shaderReady && <HeatShader />
        )}
      </div>

      {/* Camada 2 — véu direcional. Escurece onde o texto pousa (embaixo à
          esquerda) e deixa a luz respirar no resto. Um véu uniforme e opaco
          apagaria o shader inteiro, que foi o primeiro erro desta composição. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(105deg,rgba(18,11,8,0.86)_0%,rgba(18,11,8,0.55)_42%,rgba(18,11,8,0.12)_78%)]"
      />

      {/*
        Camada 3 — véu de baixo para cima, e ele existe por uma medição.

        O véu direcional acima foi calibrado para o shader, que é escuro à
        direita. O clipe da lâmpada não é: a mesa de metal reflete a luz e ocupa
        a metade de baixo do quadro, justamente onde o conteúdo pousa. Sem este
        véu, a conferência de contraste pintado reprova quatro textos do celular,
        o pior deles em 1,08:1 contra os 4,5 exigidos.

        As paradas não são gosto, são o resultado de medir. Todo o texto do hero
        fica abaixo de 60% da altura (a página é `justify-end`), então o véu é
        forte até ali e cai rápido acima — que é onde a lâmpada mora. Escurecer
        o topo junto seria pagar a legibilidade com a cena, sem precisar.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(18,11,8,0.96)_0%,rgba(18,11,8,0.93)_45%,rgba(18,11,8,0.75)_60%,rgba(18,11,8,0.25)_72%,transparent_84%)] lg:bg-[linear-gradient(to_top,rgba(18,11,8,0.9)_0%,rgba(18,11,8,0.55)_24%,rgba(18,11,8,0.15)_46%,transparent_66%)]"
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 pb-14 md:pb-20 pt-32">
        {/*
          Uma coluna só. A grade de duas existia para o quadro de preços da
          direita, que saiu daqui: ele repetia linha por linha o que os cards do
          cardápio já mostram logo abaixo, e era a única coisa do hero em cima do
          lado claro do clipe — onde o contraste medido dava 2,75 no desktop e
          1,01 no celular, contra os 4,5 da WCAG AA. Tirar resolveu os dois
          problemas de uma vez, e a metade direita passou a ser da cena.
        */}
        <div>
            {/*
              A área de atendimento, e não o lema.

              Aqui era "Viamão · O sabor que impõe respeito": meia linha de
              cidade e meia de slogan, separadas por um ponto médio. O lema já
              aparece inteiro na pausa do meio da página e no rodapé, então esta
              linha estava repetindo o que a página diz melhor mais adiante — e
              gastando a única linha pequena que o topo comporta.

              Quem chega no site de um salgadeiro procura três coisas antes de
              qualquer outra: se atende onde ele mora, em quanto tempo, e quanto
              custa. As três agora estão na dobra: esta linha responde a
              primeira, o parágrafo responde as outras duas.
            */}
            <p className="type-label text-[0.68rem] sm:text-xs text-amber mb-6 sm:mb-8">
              {site.deliveryArea.curta}
            </p>

            <h1
              ref={titleRef}
              /*
                O título tem duas linhas e `line-height: 0.88`, então reservar
                1.76em garante a mesma altura antes e depois da fonte chegar.
                Sem isso a troca do Archivo Black remedia o bloco e empurrava
                tudo abaixo em 813px — sozinho, todo o CLS da página.
              */
              className="type-display text-[clamp(2.6rem,8vw,7rem)] text-fg opacity-0 whitespace-nowrap min-h-[1.76em]"
            >
              Salgados
              <br />
              para festa
            </h1>

            <div ref={supportRef} className="mt-9 sm:mt-11 max-w-lg">
              {/*
                "Peça hoje, receba amanhã" é o prazo dito pelo lado que é boa
                notícia. O mesmo fato aparece por extenso e sem arredondamento em
                "Como encomendar" (mínimo de 24 horas, abaixo disso o pedido é
                avaliado): aqui é a promessa curta, lá é o contrato.
              */}
              <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
                Fritos, assados e folhados feitos por encomenda.{" "}
                <strong className="text-fg font-bold">
                  {site.leadTime.titulo}.
                </strong>{" "}
                Box degustação a partir de{" "}
                <strong className="text-amber font-bold">
                  {formatPrice(entryPrice)}
                </strong>
                .
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <MagneticButton
                  as="a"
                  href="#festa"
                  className="inline-flex items-center justify-center min-h-[3.5rem] px-9 bg-amber text-bg font-bold text-sm uppercase tracking-[0.14em] whitespace-nowrap"
                >
                  Montar meu pedido
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href={getWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center min-h-[3.5rem] px-9 border border-border-strong text-fg font-bold text-sm uppercase tracking-[0.14em] whitespace-nowrap hover:border-amber hover:text-amber transition-colors duration-[var(--duration-superficie)] ease-[var(--ease-estado)]"
                >
                  Falar no WhatsApp
                </MagneticButton>
              </div>
            </div>
        </div>

        {/*
          Aqui havia um "Ver o cardápio ↓" com seta pulando. Saiu por dois
          motivos, e o segundo é o que decide:

          1. Ele apontava para #festa — o mesmo destino do botão "Montar meu
             pedido", trinta pixels acima. Dois chamados para a mesma ação na
             mesma tela dividem a atenção sem oferecer escolha nenhuma.
          2. Quem ainda não rolou está olhando o topo da página. Não precisa de
             um rótulo dizendo que dá para rolar.

          O topo ficou com quatro peças: a linha da área, o título, o parágrafo
          e os dois botões. É o que cabe em uma decisão.
        */}
      </div>
    </section>
  )
}
