import { SectionHeading } from "@/components/ui/section-heading"
import { PackageCard } from "@/components/product/package-card"
import { boxDegustacao } from "@/lib/data/menu"

export function BoxSection() {
  return (
    <section id="box" className="py-16 md:py-24 bg-surface-2 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="lg:pt-2">
            <SectionHeading
              eyebrow="Para provar"
              title="Box degustação"
              subtitle="A porção menor, para conhecer antes de encomendar para a festa."
            />
          </div>
          <PackageCard category={boxDegustacao} />
        </div>
      </div>
    </section>
  )
}
