import { PHONE_DISPLAY, PHONE_TEL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/cart/whatsapp"

const links = [
  { label: "Festa", href: "#festa" },
  { label: "Box degustação", href: "#box" },
  { label: "Congelados", href: "#congelados" },
  { label: "Como encomendar", href: "#como-encomendar" },
]

export function Footer() {
  return (
    <footer className="bg-fg text-white/70 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="type-display text-lg text-white">Don Enrico Lanches</p>
            <p className="mt-2 text-sm italic">O sabor que impõe respeito</p>
            <p className="mt-3 text-sm">Porto Alegre, RS</p>
          </div>

          <nav aria-label="Seções do site">
            <p className="type-label text-[0.7rem] text-white mb-3">Cardápio</p>
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="type-label text-[0.7rem] text-white mb-3">Contato</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="text-sm hover:text-white transition-colors duration-150"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors duration-150"
                >
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 pt-6 border-t border-white/15 text-xs">
          &copy; {new Date().getFullYear()} Don Enrico Lanches
        </p>
      </div>
    </footer>
  )
}
