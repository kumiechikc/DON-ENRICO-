import { SiteShell } from "@/components/layout/site-shell"
import { StructuredData } from "@/components/seo/structured-data"
import { HeroSection } from "@/components/hero/hero-section"
import { FestaSection } from "@/components/sections/festa-section"
import { BoxSection } from "@/components/sections/box-section"
import { CongeladosSection } from "@/components/sections/congelados-section"
import { ComoEncomendarSection } from "@/components/sections/como-encomendar-section"
import { ContatoSection } from "@/components/sections/contato-section"
import { Marquee } from "@/components/sections/marquee"
import { StatementSection } from "@/components/sections/statement-section"
import { boxDegustacao } from "@/lib/data/menu"

export default function Home() {
  return (
    <SiteShell>
      <StructuredData />
      <HeroSection />
      {/* A faixa quebra o ritmo logo depois da dobra e já mostra o que existe
          de sabor antes de o visitante chegar no cardápio. */}
      <Marquee items={boxDegustacao.flavors} />
      <FestaSection />
      <BoxSection />
      {/* Pausa: a página para de vender e a marca fala. */}
      <StatementSection />
      <CongeladosSection />
      <ComoEncomendarSection />
      <ContatoSection />
    </SiteShell>
  )
}
