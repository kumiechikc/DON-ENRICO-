"use client"

import { useEffect, useRef, useState } from "react"
import { useMotion } from "@/lib/motion/motion-provider"
import { acharClipe, arquivosDoClipe } from "@/lib/media/clipes"
import { cn } from "@/lib/utils"

/**
 * Um plano do filme: pôster primeiro, vídeo depois, e só quando vale a pena.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * As quatro regras, e o que cada uma evita:
 *
 * 1. O PÔSTER É O LCP, o vídeo nunca.
 *    O pôster é uma imagem estática que já vem no HTML. O vídeo entra depois,
 *    por cima, quando estiver pronto. Se o vídeo fosse o elemento principal, o
 *    LCP passaria de ~900ms para o tempo de baixar megabytes no 4G — e LCP é a
 *    métrica que decide se a pessoa espera ou fecha a aba.
 *
 * 2. APARELHO FRACO E REDUCED-MOTION NÃO BAIXAM VÍDEO NENHUM.
 *    O `MotionProvider` já decide isso (preferência do sistema, memória do
 *    aparelho, número de núcleos). Aqui a consequência é literal: o `<video>`
 *    nem é montado, então o navegador não tem o que pedir. Quem está no Android
 *    de entrada economiza o download inteiro e vê o pôster, que é uma foto boa.
 *
 * 3. SÓ CARREGA QUANDO ENTRA NA TELA.
 *    IntersectionObserver monta o vídeo na aproximação e pausa quando sai. Cinco
 *    clipes decodificando ao mesmo tempo esquenta o celular e come bateria por
 *    um fundo que ninguém está olhando.
 *
 * 4. PROPORÇÃO DECLARADA SEMPRE.
 *    Largura e altura vêm do manifesto e viram `aspect-ratio`. Sem isso a
 *    página pula quando o vídeo chega, e o CLS — hoje zero — estoura.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sem clipe registrado no manifesto, o componente não renderiza nada e o que
 * estiver atrás dele aparece. É o mesmo contrato do `ProductImage` com as fotos.
 */
export function CinemaLoop({
  clipe: id,
  className,
  /** Preenche o container em vez de respeitar a própria proporção. Para fundo. */
  preencher = false,
}: {
  clipe: string
  className?: string
  preencher?: boolean
}) {
  const clipe = acharClipe(id)
  const { motionEnabled } = useMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [deveCarregar, setDeveCarregar] = useState(false)
  const [tocando, setTocando] = useState(false)

  /*
   * Observa a entrada na tela. A margem de 200px monta o vídeo um pouco antes
   * de aparecer, para ele já estar rodando quando o olho chegar — sem isso o
   * primeiro quadro visível é sempre o pôster congelado.
   */
  useEffect(() => {
    if (!clipe || !motionEnabled) return
    const el = containerRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setDeveCarregar(true)
          videoRef.current?.play().catch(() => {
            /*
             * O navegador pode recusar o autoplay mesmo com `muted`, por
             * economia de bateria ou preferência do usuário. Não é erro: o
             * pôster continua no lugar e a página segue igual.
             */
          })
        } else {
          videoRef.current?.pause()
        }
      },
      { rootMargin: "200px" }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [clipe, motionEnabled])

  if (!clipe) return null

  const arquivos = arquivosDoClipe(clipe.id)
  const decorativo = clipe.descricao === ""

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={preencher ? undefined : { aspectRatio: `${clipe.largura} / ${clipe.altura}` }}
      /*
       * Quando o vídeo é fundo decorativo, o conjunto inteiro sai da árvore de
       * acessibilidade. Anunciar "vídeo" sem conteúdo só atrapalha quem navega
       * por leitor de tela.
       */
      aria-hidden={decorativo || undefined}
    >
      {/*
        O pôster fica embaixo e nunca sai. É ele que segura o layout, que aparece
        sem JavaScript, e que continua sendo a imagem para quem tem movimento
        desligado. O vídeo só sobe por cima quando começa a tocar.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={arquivos.poster}
        alt={decorativo ? "" : clipe.descricao}
        width={clipe.largura}
        height={clipe.altura}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {motionEnabled && deveCarregar && (
        <video
          ref={videoRef}
          width={clipe.largura}
          height={clipe.altura}
          muted
          /*
           * Sem `playsInline` o iOS abre o vídeo em tela cheia e destrói a
           * página. É o detalhe que mais quebra hero em celular.
           */
          playsInline
          loop={clipe.modo === "loop"}
          autoPlay
          preload="auto"
          onPlaying={() => setTocando(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            tocando ? "opacity-100" : "opacity-0"
          )}
        >
          {/* O WebM vem primeiro: quem souber ler pega o arquivo menor. */}
          <source src={arquivos.webm} type="video/webm" />
          <source src={arquivos.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
