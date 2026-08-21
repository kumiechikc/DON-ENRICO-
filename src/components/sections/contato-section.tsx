import { Phone } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { InstagramIcon } from "@/components/ui/instagram-icon"
import {
  getWhatsAppDirectUrl,
  PHONE_DISPLAY,
  PHONE_TEL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "@/lib/cart/whatsapp"

export function ContatoSection() {
  return (
    <section id="contato" className="py-16 md:py-24 bg-brand">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Painel âmbar com texto escuro: 7.24:1. Branco aqui reprovaria. */}
        <h2 className="type-display text-[clamp(2rem,6vw,3.5rem)] text-fg max-w-2xl">
          Faça sua encomenda
        </h2>
        <p className="mt-4 max-w-xl text-fg/80 text-base md:text-lg leading-relaxed">
          Chame no WhatsApp com o pedido montado ou tire suas dúvidas direto com a
          gente.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
          <a
            href={getWhatsAppDirectUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 min-h-[3.25rem] px-8 bg-fg text-white font-bold text-sm uppercase tracking-wider hover:bg-accent transition-colors duration-150"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Pedir no WhatsApp
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="inline-flex items-center justify-center gap-2.5 min-h-[3.25rem] px-8 border-2 border-fg text-fg font-bold text-sm uppercase tracking-wider hover:bg-fg hover:text-white transition-colors duration-150"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 min-h-[3.25rem] px-8 border-2 border-fg text-fg font-bold text-sm uppercase tracking-wider hover:bg-fg hover:text-white transition-colors duration-150"
          >
            <InstagramIcon className="w-4 h-4" />
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </section>
  )
}
