"use client"

import { useReveal } from "@/lib/motion/use-reveal"
import { site } from "@/lib/site"

/*
 * Substitui a antiga seção "Sobre", que só elogiava a própria comida.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUAS MUDANÇAS, E A SEGUNDA É CONSEQUÊNCIA DA PRIMEIRA.
 *
 * 1. A COLUNA DA ESQUERDA PASSOU A TER CONTEÚDO.
 *
 *    Ela era só um título e um rótulo, e a seção inteira vivia na direita. O
 *    dono confirmou as duas informações que faltavam — prazo mínimo de 24 horas
 *    e atendimento em Viamão e região, com entrega — e elas são exatamente o que
 *    o visitante procura antes de decidir. Então elas ocupam a coluna que estava
 *    vazia, em vez de virarem mais um parágrafo no fim da página.
 *
 * 2. OS ALGARISMOS 01 / 02 / 03 SAÍRAM.
 *
 *    Eram três numerais gigantes em contorno, e eram o elemento gráfico da
 *    seção. O problema é que numerar passo a passo é a assinatura mais
 *    reconhecível de página feita por gerador: o número não informa nada que a
 *    ordem da lista já não diga, e "01" não é um rótulo, é enfeite com cara de
 *    rótulo.
 *
 *    O lugar da escala grande passou a ser o prazo, na esquerda. Ali o número é
 *    informação de verdade: 24 horas é o que o cliente precisa saber, e é o que
 *    o dono chama de diferencial da empresa. Escala grande é um recurso caro;
 *    gastá-la num "01" e deixar o prazo em corpo de texto era a troca errada.
 *
 *    No lugar dos numerais, os passos ganharam um trilho vertical: ele mostra
 *    que existe uma sequência, que é a única coisa que os números diziam.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A CONFIRMAR COM O DONO, para esta seção ficar completa:
 * lista nominal das cidades atendidas, taxa de entrega (e se varia por
 * distância), se existe retirada e em que endereço, quantidade mínima e máxima
 * de pedido, e as formas de pagamento aceitas.
 */
const steps = [
  {
    title: "Monte o pedido",
    body: "Escolha a linha, a quantidade e os sabores direto no cardápio desta página.",
  },
  {
    title: "Envie pelo WhatsApp",
    body: "O pedido chega pronto na conversa, com os sabores e o total já escritos.",
  },
  {
    title: "Confirme dia e hora",
    body: "A entrega e o pagamento a gente acerta ali mesmo, com você.",
  },
]

function Step({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useReveal<HTMLLIElement>("rise", { delay: index * 0.08 })

  return (
    <li ref={ref} data-reveal className="pl-7 md:pl-9 pb-10 last:pb-0">
      <h3 className="type-display text-xl md:text-2xl text-fg">{step.title}</h3>
      <p className="mt-3 text-sm md:text-base text-fg-muted leading-relaxed max-w-md">
        {step.body}
      </p>
    </li>
  )
}

/**
 * Um fato confirmado pelo dono.
 *
 * `destaque` existe porque os dois fatos não valem a mesma coisa. Na primeira
 * versão os dois vinham em âmbar e na mesma escala, e o resultado foi duas
 * manchetes gritando lado a lado: nenhuma das duas lia como a principal, e a
 * área de atendimento, que é uma informação de conferência ("serve pra mim?"),
 * disputava com o prazo, que é o argumento de venda.
 *
 * Uma alta e uma baixa. O prazo fica em âmbar e em escala; a entrega fica em
 * texto normal, do tamanho de uma resposta.
 */
function Fato({
  titulo,
  corpo,
  index,
  destaque = false,
}: {
  titulo: string
  corpo: string
  index: number
  destaque?: boolean
}) {
  const ref = useReveal<HTMLDivElement>("rise", { delay: 0.1 + index * 0.1 })

  return (
    <div ref={ref} data-reveal>
      <h3
        className={
          destaque
            ? "type-display text-[clamp(1.5rem,3.2vw,2.25rem)] text-amber leading-tight text-balance"
            : "type-display text-lg md:text-xl text-fg"
        }
      >
        {titulo}
      </h3>
      <p className="mt-3 text-sm md:text-base text-fg-muted leading-relaxed max-w-sm">
        {corpo}
      </p>
    </div>
  )
}

export function ComoEncomendarSection() {
  return (
    <section id="como-encomendar" className="border-t border-border py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20">
          <div>
            <h2 className="type-display text-[clamp(2.25rem,6vw,4rem)] text-fg">
              Como
              <br />
              encomendar
            </h2>

            {/*
              Os dois fatos que o cliente procura antes de qualquer preço. Uma
              linha fina separa cada um: a seção toda usa esse mesmo desenho de
              divisória, e nenhum dos dois blocos vira card — não há hierarquia
              de elevação entre "prazo" e "entrega", são dois fatos irmãos.
            */}
            <div className="mt-12 flex flex-col gap-10 border-t border-border pt-10">
              <Fato
                titulo={site.leadTime.titulo}
                corpo={site.leadTime.corpo}
                index={0}
                destaque
              />
              <div className="border-t border-border pt-10">
                <Fato
                  titulo={site.deliveryArea.titulo}
                  corpo={site.deliveryArea.corpo}
                  index={1}
                />
              </div>
            </div>
          </div>

          {/*
            O trilho no lugar dos numerais, e ele é uma borda da própria lista,
            não um elemento desenhado por cima.

            Isso importa: uma borda começa e termina exatamente onde a lista
            começa e termina, sem número mágico nenhum. O último passo tem
            `pb-0`, então a linha para no fim do último parágrafo em vez de
            continuar para um quarto passo que não existe. Qualquer versão com
            `position: absolute` precisaria de uma altura calculada à mão, e ela
            passaria a mentir no dia em que um passo virasse duas linhas.
          */}
          <ol className="self-start border-l border-border-strong lg:mt-4">
            {steps.map((step, i) => (
              <Step key={step.title} step={step} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
