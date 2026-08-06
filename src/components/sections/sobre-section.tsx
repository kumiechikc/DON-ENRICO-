"use client"

import { motion } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"
import { ProductImage } from "@/components/ui/product-image"

// Preencha com "/produtos/sobre.jpg" quando a foto da produção chegar.
const SOBRE_IMAGE: string | undefined = undefined

export function SobreSection() {
  return (
    <section id="sobre" className="py-16 md:py-24 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Sobre a Don Enrico Lanches" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          <motion.div
            className="md:col-span-3 space-y-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base md:text-lg text-foreground leading-relaxed">
              Na Don Enrico, cada salgado é feito no capricho: massa na medida,
              recheio generoso e o tempero de quem faz isso todo dia.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Trabalhamos com encomendas fechadas — box degustação, pacotes de 50 e
              100 unidades para festa e a linha de congelados para você fritar ou
              assar em casa na hora que quiser.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Do preparo artesanal à sua mesa: crocantes, saborosos e feitos com
              respeito ao seu paladar.
            </p>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <ProductImage
              src={SOBRE_IMAGE}
              alt="Produção artesanal dos salgados da Don Enrico Lanches"
              className="aspect-[3/4] rounded-2xl"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
