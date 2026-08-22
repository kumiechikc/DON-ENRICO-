"use client"

import { useEffect, useState } from "react"
import { useMotion } from "@/lib/motion/motion-provider"
import { useVisivel } from "@/lib/motion/use-visivel"
import { acharSequencia, arquivoDaSequencia } from "@/lib/media/sequencias"
import { cn } from "@/lib/utils"

/**
 * Uma tira de quadros que avança conforme a página rola.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE ISTO E NÃO VÍDEO
 *
 * A peça é uma imagem só. Não há decodificação de vídeo, não há dois encodes,
 * não há bateria queimando em segundo plano. E, o que decidiu a escolha: dá
 * para avançar quadro a quadro com precisão.
 *
 * Rolagem controlando vídeo é armadilha conhecida — `currentTime` em arquivo
 * comprimido busca o quadro-chave mais próximo, não o quadro pedido, e no
 * celular isso trava. Aqui o quadro é uma translação, e ela é exata.
 *
 * O resultado não é movimento suave, e não deveria ser: cinco quadros são cinco
 * estados que a pessoa escolhe parar e olhar. Quem dá o ritmo é o dedo.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * O caminho degradado não é uma versão pior. Sem JavaScript, com movimento
 * reduzido ou em aparelho fraco, fica o ÚLTIMO quadro — que na tira do corte é
 * a coxinha completamente aberta, o melhor quadro da sequência.
 */
export function Sequencia({
  sequencia: id,
  className,
}: {
  sequencia: string
  className?: string
}) {
  const seq = acharSequencia(id)
  const { motionEnabled } = useMotion()
  const { ref, visivel } = useVisivel<HTMLDivElement>(motionEnabled)

  /*
   * Começa no último quadro, e é isso que o servidor renderiza. Assim o primeiro
   * pixel que aparece já é o quadro bom, e quem nunca chegar a rodar JavaScript
   * fica com ele.
   */
  const ultimo = seq ? seq.quadros - 1 : 0
  const [quadro, setQuadro] = useState(ultimo)

  useEffect(() => {
    if (!seq || !visivel) return
    const el = ref.current
    if (!el) return

    let pedido = 0

    function medir() {
      pedido = 0
      const caixa = el!.getBoundingClientRect()
      /*
       * Progresso da peça atravessando a janela: 0 quando ela acabou de entrar
       * por baixo, 1 quando acabou de sair por cima. O percurso inteiro é a
       * altura da janela mais a da própria peça.
       */
      const percurso = window.innerHeight + caixa.height
      const andado = window.innerHeight - caixa.top
      const progresso = Math.min(1, Math.max(0, andado / percurso))
      setQuadro(Math.min(seq!.quadros - 1, Math.floor(progresso * seq!.quadros)))
    }

    function aoRolar() {
      // Agenda no próximo quadro de renderização: o evento de rolagem dispara
      // dezenas de vezes por segundo e recalcular em todas trava a rolagem.
      if (pedido === 0) pedido = window.requestAnimationFrame(medir)
    }

    medir()
    window.addEventListener("scroll", aoRolar, { passive: true })
    window.addEventListener("resize", aoRolar, { passive: true })

    return () => {
      window.removeEventListener("scroll", aoRolar)
      window.removeEventListener("resize", aoRolar)
      if (pedido !== 0) window.cancelAnimationFrame(pedido)
    }
  }, [seq, visivel, ref])

  if (!seq) return null

  const decorativa = seq.descricao === ""

  return (
    <div
      ref={ref}
      /*
       * Marca a peça para a conferência automatizada. O que ela precisa medir é
       * o quadro em que a tira parou, e sem um seletor estável ela teria que
       * adivinhar por caminho de arquivo — que muda sem aviso.
       */
      data-sequencia={seq.id}
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: `${seq.largura} / ${seq.altura}` }}
      role={decorativa ? undefined : "img"}
      aria-label={decorativa ? undefined : seq.descricao}
      aria-hidden={decorativa || undefined}
    >
      {/*
        Um <img> deslocado, e não uma imagem de fundo: assim o navegador faz o
        carregamento tardio nativo (imagem de fundo é buscada assim que o
        elemento entra na árvore, esteja na tela ou não) e a peça continua
        aparecendo sem JavaScript.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={arquivoDaSequencia(seq.id)}
        alt=""
        width={seq.largura * seq.quadros}
        height={seq.altura}
        loading="lazy"
        decoding="async"
        className="absolute left-0 top-0 h-full max-w-none"
        style={{
          width: `${seq.quadros * 100}%`,
          transform: `translateX(-${(quadro / seq.quadros) * 100}%)`,
        }}
      />
    </div>
  )
}
