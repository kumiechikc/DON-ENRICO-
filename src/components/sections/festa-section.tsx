import { SectionHeading } from "@/components/ui/section-heading"
import { PackageCard } from "@/components/product/package-card"
import { festaCategories } from "@/lib/data/menu"

export function FestaSection() {
  return (
    <section id="festa" className="py-16 md:py-24 border-b border-border">
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
