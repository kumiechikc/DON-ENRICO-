/**
 * Dados públicos da empresa, num lugar só.
 *
 * Vale a mesma regra do resto do projeto: aqui só entra o que veio de fonte
 * confirmada (encartes e o dono). Endereço, horário de atendimento, prazo de
 * encomenda e área de entrega continuam de fora porque ainda não foram
 * confirmados — ver docs/PERGUNTAS-CLIENTE.md, Bloco 1.
 */
export const site = {
  name: "Don Enrico Lanches",
  tagline: "O sabor que impõe respeito",
  description:
    "Salgados para festa e congelados por encomenda em Porto Alegre. Box degustação, pacotes de 50 e 100 unidades e linha de congelados. Peça pelo WhatsApp.",
  city: "Porto Alegre",
  state: "RS",
  country: "BR",
  /*
   * O site é publicado em GitHub Pages num subcaminho. Se um dia entrar domínio
   * próprio, muda só aqui — a URL alimenta sitemap, robots e Open Graph.
   */
  url: "https://kumiechikc.github.io/DON-ENRICO-",
} as const
