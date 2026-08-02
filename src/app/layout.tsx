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
  title: "Don Enrico Salgados | O Sabor que Impõe Respeito",
  description:
    "Salgados artesanais fritos na hora em Porto Alegre. Coxinha, bolinha de queijo, risoles e mais. Peça pelo WhatsApp!",
  keywords: ["salgados", "salgados artesanais", "Porto Alegre", "coxinha", "bolinha de queijo", "Don Enrico"],
  openGraph: {
    title: "Don Enrico Salgados",
    description: "Salgados artesanais fritos na hora. O Sabor que Impõe Respeito.",
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
