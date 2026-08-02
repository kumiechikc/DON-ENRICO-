"use client"

import { motion } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"

export function SobreSection() {
  return (
    <section id="sobre" className="py-16 md:py-24 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Sobre a Don Enrico" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          <motion.div
            className="md:col-span-3 space-y-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base md:text-lg text-foreground leading-relaxed">
              Na Don Enrico, cada salgado é uma obra-prima.{" "}
              <span className="fire-text font-semibold">Fritos na hora</span>, com
              ingredientes selecionados e o tempero que só quem tem tradição sabe
              fazer.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Nossa missão é simples: entregar o melhor salgado que você já provou.
              Sem atalhos, sem compromisso com a qualidade. Cada mordida é uma
              experiência.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Do preparo artesanal à sua mesa — crocantes, saborosos e feitos com
              respeito ao seu paladar.
            </p>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="aspect-[3/4] bg-muted rounded-xl flex items-center justify-center">
              <span className="text-6xl">🍴</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
