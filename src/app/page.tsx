import { SiteShell } from "@/components/layout/site-shell"
import { StructuredData } from "@/components/seo/structured-data"
import { HeroSection } from "@/components/hero/hero-section"
import { FestaSection } from "@/components/sections/festa-section"
import { BoxSection } from "@/components/sections/box-section"
import { CongeladosSection } from "@/components/sections/congelados-section"
import { ComoEncomendarSection } from "@/components/sections/como-encomendar-section"
import { ContatoSection } from "@/components/sections/contato-section"

export default function Home() {
  return (
    <SiteShell>
      <StructuredData />
      <HeroSection />
      <FestaSection />
      <BoxSection />
      <CongeladosSection />
      <ComoEncomendarSection />
      <ContatoSection />
    </SiteShell>
  )
}
