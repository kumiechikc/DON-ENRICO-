import type { Metadata } from "next"
import { Playfair_Display_SC, Karla } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
  display: "swap",
})

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Don Enrico Lanches | O Sabor que Impõe Respeito",
  description:
    "Salgados para festa e congelados em Porto Alegre. Box degustação, encomendas de 50 e 100 unidades e linha praticidade. Peça pelo WhatsApp!",
  keywords: [
    "salgados para festa",
    "salgados congelados",
    "encomenda de salgados",
    "Porto Alegre",
    "coxinha",
    "Don Enrico Lanches",
  ],
  openGraph: {
    title: "Don Enrico Lanches",
    description: "Salgados para festa e congelados. O Sabor que Impõe Respeito.",
    locale: "pt_BR",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${karla.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
