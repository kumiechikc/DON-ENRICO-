"use client"

import { MapPin, Clock, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"

const info = [
  { icon: MapPin, label: "Porto Alegre, RS" },
  { icon: Clock, label: "Seg-Sex: 10h às 20h | Sáb: 10h às 18h" },
  { icon: Phone, label: "(51) 99015-6798" },
]

export function LocalizacaoSection() {
  return (
    <section id="localizacao" className="py-16 md:py-24 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Onde Estamos" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {info.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm md:text-base text-foreground">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="aspect-video rounded-2xl border border-white/[0.08] bg-card flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <MapPin className="w-7 h-7 text-primary/50" strokeWidth={1.5} aria-hidden="true" />
              <span className="text-sm">Atendemos toda a região de Porto Alegre</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
