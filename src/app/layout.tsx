import type { Metadata } from "next"
import { Archivo, Archivo_Black } from "next/font/google"
import { site } from "@/lib/site"
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
  // Sem metadataBase as URLs de Open Graph saem relativas e o preview quebra
  // quando o link é colado no WhatsApp.
  metadataBase: new URL(site.url),
  title: `${site.name} | Salgados para festa em ${site.city}`,
  description: site.description,
  keywords: [
    "salgados para festa",
    "salgados congelados",
    "encomenda de salgados",
    "coxinha Porto Alegre",
    "salgadinhos para festa Porto Alegre",
    site.name,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} — salgados para festa`,
    description: site.description,
    url: "/",
    siteName: site.name,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — salgados para festa`,
    description: site.description,
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
