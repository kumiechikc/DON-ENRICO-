import { getWhatsAppDirectUrl } from "@/lib/cart/whatsapp"

export function Footer() {
  return (
    <footer className="relative bg-[#050505] pt-12 pb-6">
      <div className="absolute top-0 left-0 right-0 h-[2px] fire-gradient" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-heading text-lg font-bold tracking-widest uppercase">
              <span className="text-foreground">Don </span>
              <span className="text-primary">Enrico</span>
              <span className="text-foreground"> Salgados</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground italic">
              O Sabor que Impõe Respeito
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">Links</p>
            <div className="flex flex-col gap-2">
              {["Cardápio", "Sobre", "Depoimentos", "Contato"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">Contato</p>
            <a
              href={getWhatsAppDirectUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Peça pelo WhatsApp
            </a>
            <p className="mt-2 text-sm text-muted-foreground">(51) 99015-6798</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Don Enrico Salgados. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
