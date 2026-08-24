import { PHONE_DISPLAY, PHONE_TEL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/cart/whatsapp"
import { site } from "@/lib/site"

const links = [
  { label: "Encomendas para festa", href: "#festa" },
  { label: "Box degustação", href: "#box" },
  { label: "Congelados", href: "#congelados" },
  { label: "Como encomendar", href: "#como-encomendar" },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-bg">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12 md:gap-8">
          <div>
            <p className="type-display text-2xl md:text-3xl text-fg">
              Don Enrico
              <span className="block text-amber">Lanches</span>
            </p>
            <p className="mt-4 text-sm text-fg-muted italic max-w-xs">
              {site.tagline}
            </p>
            {/* Era "Viamão · RS", em caixa alta e com ponto médio: dois
                fragmentos onde cabia a informação inteira. Rodapé é onde a
                pessoa procura de onde a empresa fala e até onde ela vai. */}
            <p className="mt-6 text-sm text-fg-muted max-w-xs leading-relaxed">
              {site.deliveryArea.longa}
            </p>
          </div>

          <nav aria-label="Seções do site">
            <p className="type-label text-[0.62rem] text-amber mb-4">Cardápio</p>
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center min-h-[2.75rem] text-sm text-fg-muted hover:text-fg transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="type-label text-[0.62rem] text-amber mb-4">Contato</p>
            <ul>
              <li>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="inline-flex items-center min-h-[2.75rem] text-sm text-fg-muted hover:text-fg transition-colors duration-300"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[2.75rem] text-sm text-fg-muted hover:text-fg transition-colors duration-300"
                >
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-14 pt-6 border-t border-border text-xs text-fg-muted">
          &copy; {new Date().getFullYear()} Don Enrico Lanches
        </p>
      </div>
    </footer>
  )
}
