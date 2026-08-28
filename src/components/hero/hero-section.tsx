"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
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

  const entryPrice = Math.min(...boxDegustacao.tiers.map((t) => t.price))

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
      {/* Camada 1 — a luz. O gradiente é o estado base: se o shader não rodar
          (aparelho fraco, movimento desligado), a cena continua sendo uma
          fritadeira acesa na sombra, não um retângulo preto. */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(125%_90%_at_50%_118%,#8A4318_0%,#3A1809_42%,#120B08_76%)]">
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
