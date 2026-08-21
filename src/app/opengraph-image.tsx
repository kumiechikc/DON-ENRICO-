import { ImageResponse } from "next/og"
import { site } from "@/lib/site"
import { boxDegustacao } from "@/lib/data/menu"

/*
 * Cartão de preview do link. Importa mais aqui do que na maioria dos sites: o
 * canal de divulgação da empresa é o WhatsApp, e link compartilhado sem imagem
 * aparece como texto pelado na conversa.
 *
 * Duas restrições do renderizador (Satori) moldam este arquivo: toda div com
 * mais de um filho precisa de `display` explícito, e não há fonte externa de
 * propósito — a geração roda no build e buscar fonte na rede o deixaria frágil.
 */
export const dynamic = "force-static"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${site.name} — salgados para festa em ${site.city}`

const COL = { display: "flex", flexDirection: "column" } as const

export default function OpengraphImage() {
  const from = Math.min(...boxDegustacao.tiers.map((t) => t.price))
  const fromLabel = `R$ ${from.toFixed(2).replace(".", ",")}`

  return new ImageResponse(
    (
      <div
        style={{
          ...COL,
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          background: "#FDF7EF",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={COL}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#9A5B06",
            }}
          >
            {`${site.city} · Encomendas`}
          </div>
          <div
            style={{
              ...COL,
              marginTop: 26,
              fontSize: 104,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -3,
              textTransform: "uppercase",
              color: "#241610",
            }}
          >
            <span>Salgados</span>
            <span>para festa</span>
          </div>
          <div style={{ marginTop: 30, width: 150, height: 14, background: "#E8940C" }} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={COL}>
            <span style={{ fontSize: 34, fontWeight: 700, color: "#241610" }}>
              {site.name}
            </span>
            <span style={{ marginTop: 8, fontSize: 25, color: "#6B5648" }}>
              Fritos, assados, folhados e congelados
            </span>
          </div>

          <div
            style={{
              ...COL,
              alignItems: "flex-end",
              background: "#E8940C",
              padding: "16px 28px",
            }}
          >
            <span
              style={{
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#241610",
              }}
            >
              A partir de
            </span>
            <span style={{ fontSize: 44, fontWeight: 900, color: "#241610" }}>
              {fromLabel}
            </span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
