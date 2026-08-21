import type { Metadata } from "next"
import { Archivo, Archivo_Black } from "next/font/google"
import "./globals.css"

// Uma superfamília só: o Black carrega os títulos com peso de tipo de madeira,
// o Archivo normal sustenta o texto corrido em telas pequenas.
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
})

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Don Enrico Lanches | Salgados para festa em Porto Alegre",
  description:
    "Salgados para festa e congelados por encomenda. Box degustação a partir de R$ 19,90, pacotes de 50 e 100 unidades e linha de congelados. Peça pelo WhatsApp.",
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
    description:
      "Salgados para festa e congelados por encomenda em Porto Alegre. Peça pelo WhatsApp.",
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
    <html
      lang="pt-BR"
      className={`${archivoBlack.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
