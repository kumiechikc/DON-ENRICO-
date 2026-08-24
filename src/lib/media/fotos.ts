/**
 * As fotos de produto, e o que cada uma pode afirmar.
 *
 * Fonte única, no mesmo desenho de `clipes.ts`. Registrar aqui é o que põe uma
 * foto no ar; sem entrada, o bloco cai no espaço reservado da marca.
 *
 * Para acrescentar uma foto:
 *
 *   1. node scripts/tratar-foto.mjs <original> <id> --corte L:A:X:Y
 *   2. acrescente a entrada aqui, com as dimensões que o script reportou
 *   3. npm run check:midia
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A DESCRIÇÃO É UMA AFIRMAÇÃO SOBRE O PRODUTO, NÃO UMA LEGENDA
 *
 * A foto de um site de comida diz "é isto que você vai receber". Por isso cada
 * entrada aqui registra o que a cena REALMENTE mostra, e a foto só é ligada a
 * uma linha do cardápio quando as duas coisas batem.
 *
 * Duas fotos que o dono mandou ficaram de fora por causa dessa regra, e o
 * motivo está escrito no fim deste arquivo. Nenhuma foto entra "para preencher".
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Foto {
  id: string
  /**
   * Caminhos CRUS em public/, sem o prefixo do site. Quem renderiza passa por
   * `arquivoPublico()`, como nos clipes: este arquivo também é lido pelo Node
   * nas conferências, e um import do app aqui derrubaria a leitura.
   */
  arquivo: string
  /** Variante estreita. O celular baixa metade do peso da versão grande. */
  arquivoEstreito: string
  largura: number
  altura: number
  larguraEstreita: number
  /** O que a cena mostra, para quem não enxerga a imagem. */
  descricao: string
}

export const fotos: Foto[] = [
  {
    id: "box-degustacao",
    arquivo: "/produtos/box-degustacao.webp",
    arquivoEstreito: "/produtos/box-degustacao-640.webp",
    largura: 1080,
    altura: 608,
    larguraEstreita: 640,
    /*
     * Vale para o Box Degustação porque o box é "sortido dos clássicos fritos",
     * e é exatamente isso que a foto mostra. Um enrolado de salsicha aparece
     * cortado, com a salsicha à mostra: a descrição diz isso, porque quem usa
     * leitor de tela também está decidindo o que pedir.
     */
    descricao:
      "Salgados fritos misturados de perto: coxinhas, bolinhas de queijo, croquetes e enrolados de salsicha, um deles cortado mostrando a salsicha",
  },
  {
    id: "classicos-fritos",
    arquivo: "/produtos/classicos-fritos.webp",
    arquivoEstreito: "/produtos/classicos-fritos-640.webp",
    largura: 1066,
    altura: 600,
    larguraEstreita: 640,
    descricao:
      "Duas bandejas cheias de coxinhas douradas e croquetes, recém-fritos e alinhados na caixa",
  },
  {
    id: "encomenda-pronta",
    arquivo: "/produtos/encomenda-pronta.webp",
    arquivoEstreito: "/produtos/encomenda-pronta-640.webp",
    largura: 1200,
    altura: 676,
    larguraEstreita: 640,
    /*
     * Esta não é foto de uma linha do cardápio: é a foto de uma encomenda
     * inteira, pronta para sair. Por isso ela não está em `menu.ts` e sim ao
     * lado do prazo, onde o que ela prova é a capacidade de produzir, não o
     * sabor de um item.
     */
    descricao:
      "Onze caixas de salgados prontas sobre a mesa, entre fritos e assados, de uma encomenda para festa",
  },
]

export function acharFoto(id: string): Foto | undefined {
  return fotos.find((f) => f.id === id)
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * O QUE FICOU DE FORA, E POR QUÊ
 *
 * BANDEJA REDONDA SORTIDA — não entrou, e provavelmente não é da casa.
 *
 *   Ela chegou com 550x355 pixels e 0,26 byte por pixel. As outras quatro
 *   chegaram com 1080 a 1600 pixels de largura e 0,11 a 0,16 byte por pixel,
 *   que é a assinatura de foto de celular passada pelo WhatsApp. Quinhentos e
 *   cinquenta pixels é tamanho de imagem baixada de página da web, não de foto
 *   tirada por alguém.
 *
 *   A cor confirma: R193 G105 B52, com o percentil 95 em 239. É laranja
 *   saturado e com o brilho estourado, tratamento de banco de imagem — as
 *   outras quatro estão entre R117 e R156, que é comida de verdade sob lâmpada
 *   de cozinha.
 *
 *   Publicar foto de banco como se fosse do produto é propaganda enganosa, e
 *   ainda há a questão de direito autoral de uma imagem cuja origem ninguém
 *   sabe. Fica de fora até o dono confirmar de onde ela veio.
 *
 * MINI SANDUÍCHES (BAURUZINHOS) — foto boa, produto que o site não vende.
 *
 *   É a melhor foto do lote: nítida, com luz frontal, alface verde e viva. Só
 *   que não existe nenhum lanche assim em `menu.ts`, e nenhum encarte trouxe
 *   um. Foto de um item que não está à venda é convite para um pedido que a
 *   cozinha vai ter que recusar.
 *
 *   Se a casa faz e vende, o item entra no cardápio e a foto entra junto — ela
 *   está guardada e é a primeira que eu ligaria.
 * ─────────────────────────────────────────────────────────────────────────────
 */
