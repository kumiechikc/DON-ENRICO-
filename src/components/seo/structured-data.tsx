import { site } from "@/lib/site"
import {
  boxDegustacao,
  festaCategories,
  congeladosFritar,
  congeladosAssados,
  CONGELADOS_PACK_SIZE,
} from "@/lib/data/menu"
import { PHONE_TEL, INSTAGRAM_URL } from "@/lib/cart/whatsapp"

/*
 * Dados estruturados para o Google entender que isto é um negócio local de
 * comida em Viamão, com catálogo e preço.
 *
 * O que NÃO está aqui, de propósito: `address` com rua, `openingHours` e
 * coordenadas. Nenhum desses foi confirmado pelo dono, e schema com dado
 * inventado é pior que schema ausente — o Google penaliza divergência entre o
 * que a marcação afirma e a realidade. Entram assim que vierem as respostas do
 * Bloco 1 de docs/PERGUNTAS-CLIENTE.md.
 */
export function StructuredData() {
  const offers = [
    ...boxDegustacao.tiers.map((tier) => ({
      "@type": "Offer" as const,
      name: `${boxDegustacao.name} — ${tier.quantity} unidades`,
      price: tier.price.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    })),
    ...festaCategories.flatMap((category) =>
      category.tiers.map((tier) => ({
        "@type": "Offer" as const,
        name: `${category.name} — ${tier.quantity} unidades`,
        price: tier.price.toFixed(2),
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      }))
    ),
    ...[...congeladosFritar, ...congeladosAssados].map((pack) => ({
      "@type": "Offer" as const,
      name: `${pack.name} — congelado, pacote com ${CONGELADOS_PACK_SIZE}`,
      price: pack.price.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    })),
  ]

  const data = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: site.name,
    description: site.description,
    slogan: site.tagline,
    url: `${site.url}/`,
    telephone: PHONE_TEL,
    sameAs: [INSTAGRAM_URL],
    servesCuisine: "Salgados",
    address: {
      // Sem rua e número até o dono confirmar; cidade e estado são certos.
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: site.state,
      addressCountry: site.country,
    },
    areaServed: {
      "@type": "City",
      name: site.city,
    },
    priceRange: "R$",
    makesOffer: offers,
  }

  return (
    <script
      type="application/ld+json"
      /*
       * Hoje os dados vêm de menu.ts, que é nosso. O escape existe para o dia em
       * que o cardápio vier de planilha ou CMS: um "</script>" dentro de um nome
       * de sabor fecharia o bloco e injetaria markup na página.
       */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
