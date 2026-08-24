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
 * Área de atendimento e prazo de encomenda entraram: os dois vieram do dono e
 * estão no `site.ts`. O prazo viaja na `description`, porque `FoodEstablishment`
 * não tem campo para "antecedência mínima de pedido" — o campo que existe,
 * `deliveryLeadTime`, é de `OfferShippingDetails`, que descreve frete de
 * e-commerce e traria junto uma promessa de prazo de transporte que não é o
 * caso aqui.
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
    /*
     * Duas entradas, porque o dono confirmou duas coisas diferentes: a base é
     * Viamão, e o atendimento alcança a região metropolitana com entrega.
     *
     * A região entra como `AdministrativeArea` e NÃO como uma lista de cidades.
     * O dono citou nomes de cidade num áudio, mas nome de cidade é dado de
     * negócio: declarar aqui uma cidade que ele não atende faria o Google
     * mostrar o negócio para quem ele não pode servir, que é pior do que não
     * aparecer. A lista nominal entra quando vier confirmada por escrito.
     */
    areaServed: [
      {
        "@type": "City",
        name: site.city,
        addressRegion: site.state,
        addressCountry: site.country,
      },
      {
        "@type": "AdministrativeArea",
        name: "Região Metropolitana de Porto Alegre",
      },
    ],
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
