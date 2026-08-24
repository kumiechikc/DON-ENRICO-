/**
 * Dados públicos da empresa, num lugar só.
 *
 * Vale a mesma regra do resto do projeto: aqui só entra o que veio de fonte
 * confirmada (encartes e o dono). Endereço e horário de atendimento continuam
 * de fora porque ainda não foram confirmados — ver docs/PERGUNTAS-CLIENTE.md,
 * Bloco 1.
 */
export const site = {
  name: "Don Enrico Lanches",
  tagline: "O sabor que impõe respeito",
  description:
    "Salgados para festa e congelados por encomenda em Viamão e região metropolitana, com entrega. Box degustação, pacotes de 50 e 100 unidades e linha de congelados. Peça pelo WhatsApp com 24 horas de antecedência.",
  city: "Viamão",
  state: "RS",
  country: "BR",

  /*
   * Área de atendimento, confirmada pelo dono: a base é Viamão e o atendimento
   * alcança a região metropolitana, com entrega.
   *
   * O texto fala da região, e não de uma lista de cidades, DE PROPÓSITO. O dono
   * citou cidades no áudio, mas o nome de cidade é dado de negócio — e dado de
   * negócio que eu não consegui confirmar palavra por palavra não entra no site.
   * A lista nominal (e a taxa de entrega, que muda por distância) está no
   * Bloco 1 de docs/PERGUNTAS-CLIENTE.md esperando confirmação por escrito.
   * Quando vier, ela entra aqui e a frase abaixo vira a lista.
   */
  deliveryArea: {
    /** Linha da dobra: precisa caber num rótulo pequeno. */
    curta: "Viamão e região metropolitana",
    titulo: "A gente entrega",
    corpo: "Viamão e toda a região metropolitana de Porto Alegre.",
    /** Frase inteira, para o rodapé, onde não há título por perto. */
    longa:
      "Atendemos Viamão e toda a região metropolitana de Porto Alegre, com entrega.",
  },

  /*
   * Prazo de encomenda, confirmado pelo dono. É o diferencial que ele mais faz
   * questão de mostrar, então ele aparece na dobra e não só no rodapé.
   *
   * As duas metades importam e nenhuma pode ser arredondada:
   *
   *   1. 24 horas é o MÍNIMO pedido, não uma promessa de entrega em 24 horas.
   *      "Entrega em 24h" seria outra coisa, e seria mentira.
   *   2. Abaixo de 24 horas o pedido é AVALIADO, não recusado nem aceito de
   *      antemão. O dono disse que sempre deu certo; "sempre dá" no site viraria
   *      garantia, e garantia é o que ele não pode dar por escrito.
   */
  leadTime: {
    horas: 24,
    titulo: "Peça hoje, receba amanhã",
    corpo:
      "Pedimos no mínimo 24 horas de antecedência. Precisa para antes disso? Pergunte no WhatsApp: a gente avalia o pedido na hora.",
  },

  /*
   * O site é publicado em GitHub Pages num subcaminho. Se um dia entrar domínio
   * próprio, muda só aqui — a URL alimenta sitemap, robots e Open Graph.
   */
  url: "https://kumiechikc.github.io/DON-ENRICO-",
} as const
