"use client"

import { useEffect, useRef, useState } from "react"
import { useMotion } from "@/lib/motion/motion-provider"
import { useVisivel } from "@/lib/motion/use-visivel"
import { acharClipe, arquivosDoClipe } from "@/lib/media/clipes"
import { arquivoPublico } from "@/lib/caminho-publico"
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
  /**
   * Classes de `object-position` para escolher que parte do quadro sobrevive ao
   * corte do `object-cover`. Só faz sentido com `preencher`.
   *
   * Vai no pôster E no vídeo, sempre juntas: se os dois discordarem, o quadro
   * pula lateralmente no instante em que o vídeo sobe por cima.
   */
  enquadramento,
}: {
  clipe: string
  className?: string
  preencher?: boolean
  enquadramento?: string
}) {
  const clipe = acharClipe(id)
  /*
   * `videoEnabled`, e não `motionEnabled`: o vídeo continua fora do ar para
   * quem pediu menos movimento, mas volta para o aparelho fraco. Decodificar
   * H.264 em hardware é mais barato que o shader que este clipe substituiu, e
   * era esse aparelho que ficava sem a peça principal da página.
   */
  const { videoEnabled } = useMotion()
  /*
   * `jaApareceu` gruda: uma vez baixado, o vídeo não é desmontado ao sair da
   * tela. Desmontar jogaria fora o que já foi baixado e obrigaria a baixar de
   * novo na volta — o oposto do que a economia pretende.
   */
  const { ref: containerRef, visivel, jaApareceu } = useVisivel<HTMLDivElement>(
    videoEnabled && Boolean(clipe)
  )
  const videoRef = useRef<HTMLVideoElement>(null)

  const [tocando, setTocando] = useState(false)

  useEffect(() => {
    if (!visivel) {
      videoRef.current?.pause()
      return
    }

    videoRef.current?.play().catch(() => {
      /*
       * O navegador pode recusar o autoplay mesmo com `muted` — o modo de
       * economia de bateria do iOS faz isso sempre. Não é erro, e o pôster
       * continua no lugar; mas depois do primeiro toque na página a permissão
       * existe, então vale tentar de novo uma vez. Sem isso, quem está com
       * pouca bateria nunca vê o clipe, mesmo tendo o arquivo baixado.
       */
      const tentarDeNovo = () => {
        videoRef.current?.play().catch(() => {})
      }
      window.addEventListener("pointerdown", tentarDeNovo, { once: true })
      window.addEventListener("touchstart", tentarDeNovo, { once: true })
    })
  }, [visivel])

  if (!clipe) return null

  /*
   * O manifesto guarda caminho cru para poder ser lido pelo Node nas
   * conferências; o prefixo do site entra aqui, num lugar só. Sem ele o vídeo
   * responde 404 no GitHub Pages, onde o site mora em /DON-ENRICO-/.
   */
  const crus = arquivosDoClipe(clipe.id)
  const arquivos = {
    webm: arquivoPublico(crus.webm),
    mp4: arquivoPublico(crus.mp4),
    poster: arquivoPublico(crus.poster),
  }
  const decorativo = clipe.descricao === ""

  return (
    <div
      ref={containerRef}
      /*
       * Marca a peça para a conferência de contraste. Ela precisa saber quais
       * seções têm vídeo atrás do texto, porque nessas o fundo declarado no CSS
       * não é o fundo que a pessoa enxerga.
       */
      data-clipe={clipe.id}
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
        className={cn("absolute inset-0 h-full w-full object-cover", enquadramento)}
      />

      {jaApareceu && (
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
            enquadramento,
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
