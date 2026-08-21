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
import { boxDegustacao, festaCategories } from "@/lib/data/menu"

export default function Home() {
  /*
   * A faixa mostra a variedade real do cardápio, não só os nove sabores do box.
   * Sem remover repetidos ela exibiria "coxinha de frango" quatro vezes, já que
   * o mesmo sabor aparece em várias linhas.
   */
  const sabores = [
    ...new Set([
      ...boxDegustacao.flavors,
      ...festaCategories.flatMap((c) => c.flavors),
    ]),
  ]

  return (
    <SiteShell>
      <StructuredData />
      <HeroSection />
      {/* A faixa quebra o ritmo logo depois da dobra e já mostra o que existe
          de sabor antes de o visitante chegar no cardápio. */}
      <Marquee items={sabores} />
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
