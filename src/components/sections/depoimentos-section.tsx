"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import { SectionHeading } from "@/components/ui/section-heading"

const testimonials = [
  {
    quote: "Os melhores salgados que já comi! Crocantes por fora, suculentos por dentro. Peço toda semana!",
    name: "Maria S.",
    stars: 5,
  },
  {
    quote: "Pedi o Box 50 pra festa e foi sucesso total. Acabou em 20 minutos!",
    name: "João P.",
    stars: 5,
  },
  {
    quote: "A calabresinha com cheddar é viciante. Qualidade absurda!",
    name: "Ana L.",
    stars: 5,
  },
  {
    quote: "Atendimento rápido, salgados fresquinhos. Don Enrico nunca decepciona.",
    name: "Carlos R.",
    stars: 5,
  },
  {
    quote: "Melhor coxinha de Porto Alegre, sem discussão. O sabor realmente impõe respeito!",
    name: "Fernanda M.",
    stars: 5,
  },
]

export function DepoimentosSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth ?? 320
    scrollRef.current.scrollBy({
      left: dir === "left" ? -cardWidth - 20 : cardWidth + 20,
      behavior: "smooth",
    })
  }

  return (
    <section id="depoimentos" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="O Que Nossos Clientes Dizem" />

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="snap-start shrink-0 w-[85vw] sm:w-[340px] bg-card border border-white/[0.06] rounded-xl p-6 relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <span className="absolute top-3 left-5 text-5xl text-primary/20 font-serif leading-none select-none">
                  &ldquo;
                </span>
                <p className="text-sm md:text-base text-foreground italic leading-relaxed mt-6">
                  {t.quote}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t.name}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5 fill-accent text-accent"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
