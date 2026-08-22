import { SectionHeading } from "@/components/ui/section-heading"
import { PackageCard } from "@/components/product/package-card"
import { CinemaLoop } from "@/components/media/cinema-loop"
import { festaCategories } from "@/lib/data/menu"

export function FestaSection() {
  return (
    <section id="festa" className="py-16 md:py-24 border-b border-border">
      <div className="mx-auto mb-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        {/*
          A cartela de abertura do cardápio.

          Vem antes do título porque é ela que dá o motivo de ler o resto: o
          visitante chega da faixa de sabores, encontra a quebra, e só então a
          página pede uma decisão. Toca uma vez e para no último quadro — em
          laço, a quebra repetida vira desenho animado em vez de cinema.

          Emoldurada, e não recortada no fundo. A cena tem mesa de ardósia e luz
          de ambiente, então ela é uma fotografia, não um objeto flutuando: a
          moldura de uma linha é a mesma que os cards do cardápio usam, e é o que
          faz a peça pertencer à página. (A versão sem mesa pedia o contrário,
          `mix-blend-screen` para dissolver o preto — aqui isso acenderia a mesa
          numa faixa clara atravessando o quadro.)

          Mais estreita que o resto da seção, e alinhada à esquerda com o
          título. Na largura total do cardápio a peça ocupava dois terços da
          tela no desktop e empurrava o título inteiro para fora: quem descia do
          hero levava uma tela cheia de vídeo antes de qualquer informação.
          Centralizada, ela brigava com o título, que é alinhado à esquerda.
          Compartilhando a margem esquerda, as duas viram a mesma peça.
        */}
        <div className="max-w-3xl">
          <CinemaLoop clipe="corte" className="border border-border" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Encomendas para festa"
          title="Escolha a linha e os sabores"
          subtitle="Quatro linhas, sempre em pacote fechado de 50 ou 100 unidades. Monte a combinação aqui e ela vai junto no WhatsApp."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-start">
          {festaCategories.map((category) => (
            <PackageCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
