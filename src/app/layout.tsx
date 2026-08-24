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

/*
 * `optional` em vez de `swap` no texto corrido, de propósito.
 *
 * Com `swap` o navegador pinta na fonte de fallback e troca quando o Archivo
 * chega. Como as métricas diferem, o parágrafo do hero quebrava numa linha a
 * mais e encolhia 26px na troca — sozinho isso empurrava 813px de conteúdo e
 * respondia por todo o CLS da página (0.131, acima do limite de 0.1).
 *
 * Com `optional` o navegador usa o fallback se a fonte não chegar em ~100ms e
 * NÃO troca no meio da sessão: zero deslocamento. O custo é que uma parte das
 * primeiras visitas lê em fonte de sistema; da segunda em diante a fonte já
 * está em cache. Para texto corrido essa troca compensa.
 *
 * O título segue com `swap`, porque ali a fonte É a identidade — e lá o
 * deslocamento foi resolvido reservando a altura das linhas.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "optional",
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
    "coxinha Viamão",
    "salgadinhos para festa Viamão",
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
      className={`${archivoBlack.variable} ${archivo.variable} h-full antialiased grain`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Sem JavaScript, nada devolve a opacidade dos elementos marcados para
          revelação — o cardápio inteiro ficaria invisível. O navegador aplica
          este bloco sozinho nesse caso, sem depender de script nenhum.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
