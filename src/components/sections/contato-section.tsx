import { Phone } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { InstagramIcon } from "@/components/ui/instagram-icon"
import { MagneticButton } from "@/components/ui/magnetic-button"
import {
  getWhatsAppDirectUrl,
  PHONE_DISPLAY,
  PHONE_TEL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "@/lib/cart/whatsapp"

export function ContatoSection() {
  return (
    <section id="contato" className="relative overflow-hidden border-t border-border">
      {/* A mesma luz do hero, agora vindo de cima: fecha a página com o mesmo
          vocabulário visual com que ela abriu. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_50%_-10%,#7A3A16_0%,#2A1206_42%,#120B08_75%)]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 md:py-36 text-center">
        {/* "Peça agora" saiu daqui: o título já é o pedido, e logo abaixo dele
            há um botão que diz "Pedir no WhatsApp". Três chamados para a mesma
            ação em cinco centímetros de tela. */}
        <h2 className="type-display text-[clamp(2.5rem,9vw,6.5rem)] text-fg">
          Sua festa
          <br />
          merece respeito
        </h2>

        <div className="mt-12 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
          <MagneticButton
            as="a"
            href={getWhatsAppDirectUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 min-h-[3.75rem] px-10 bg-amber text-bg font-bold text-sm uppercase tracking-[0.14em]"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Pedir no WhatsApp
          </MagneticButton>

          <MagneticButton
            as="a"
            href={`tel:${PHONE_TEL}`}
            className="inline-flex items-center justify-center gap-3 min-h-[3.75rem] px-10 border border-border-strong text-fg font-bold text-sm uppercase tracking-[0.14em] hover:border-amber hover:text-amber transition-colors duration-[var(--duration-superficie)] ease-[var(--ease-estado)]"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {PHONE_DISPLAY}
          </MagneticButton>

          <MagneticButton
            as="a"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 min-h-[3.75rem] px-10 border border-border-strong text-fg font-bold text-sm uppercase tracking-[0.14em] hover:border-amber hover:text-amber transition-colors duration-[var(--duration-superficie)] ease-[var(--ease-estado)]"
          >
            <InstagramIcon className="w-4 h-4" />
            {INSTAGRAM_HANDLE}
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
