/**
 * Onde cada plano do filme vive.
 *
 * Fonte única dos clipes, como `menu.ts` é do cardápio. Registrar aqui é o que
 * põe um clipe no ar; enquanto a lista estiver vazia, o site funciona
 * exatamente como hoje e nenhum byte de vídeo é baixado.
 *
 * Para acrescentar um clipe:
 *
 *   1. node scripts/comprimir-clipe.mjs <arquivo-do-flow.mp4> lampada
 *   2. acrescente a entrada aqui, com as dimensões que o script reportou
 *   3. npm run check:midia
 *
 * As dimensões são obrigatórias e não são decoração: sem elas o navegador não
 * sabe quanto espaço reservar, o conteúdo pula quando o vídeo carrega, e o CLS
 * — que hoje é zero — sai do orçamento.
 */

export interface Clipe {
  /** Nome do arquivo sem extensão, o mesmo passado ao script de compressão. */
  id: string
  /**
   * Descrição da cena para quem não enxerga o vídeo.
   *
   * Vazio quando o clipe é puramente decorativo e o texto ao lado já diz tudo:
   * aí ele vira `aria-hidden` e o leitor de tela não anuncia nada, que é melhor
   * do que anunciar "vídeo" sem dizer de quê.
   */
  descricao: string
  largura: number
  altura: number
  /**
   * `loop` fica rodando enquanto estiver na tela. `unico` toca uma vez quando
   * entra e para no último quadro — é o certo para o plano do corte, onde
   * repetir a quebra em laço vira desenho animado em vez de cinema.
   */
  modo: "loop" | "unico"
}

export const clipes: Clipe[] = [
  {
    id: "lampada",
    /*
     * Fundo do hero, puramente decorativo: o título "Salgados para festa" está
     * por cima e já diz o que a página é. Descrever o vídeo aqui faria o leitor
     * de tela anunciar uma cena antes do título, que é a informação.
     */
    descricao: "",
    largura: 1280,
    altura: 720,
    modo: "loop",
  },
  {
    id: "corte",
    /*
     * A descrição diz o que a cena mostra, e o recheio aqui é frango desfiado —
     * que é a coxinha de frango do cardápio, não o croquete c/ requeijão. São
     * linhas diferentes com preços diferentes, e prometer no site uma e entregar
     * outra na porta é o tipo de detalhe que o cliente percebe.
     */
    descricao:
      "Uma coxinha se parte ao meio e mostra o frango desfiado por dentro, com vapor subindo",
    largura: 1280,
    altura: 720,
    modo: "unico",
  },
]

export function acharClipe(id: string): Clipe | undefined {
  return clipes.find((c) => c.id === id)
}

/**
 * Caminhos dos três arquivos que o script de compressão gera.
 *
 * CRUS, sem o prefixo do site. Quem renderiza passa por `arquivoPublico()` —
 * este arquivo é lido direto pelo Node nas conferências, e um import de módulo
 * do app aqui derrubaria a leitura.
 */
export function arquivosDoClipe(id: string) {
  return {
    webm: `/cinema/${id}.webm`,
    mp4: `/cinema/${id}.mp4`,
    poster: `/cinema/${id}-poster.webp`,
  }
}
