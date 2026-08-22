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

/*
 * VAZIO DE PROPÓSITO.
 *
 * Os clipes ainda não foram gerados. O caminho inteiro está pronto e testado
 * com um clipe sintético (62 KB em VP9), mas colocar aqui um arquivo que não
 * existe faria o site pedir um vídeo 404 para todo visitante.
 *
 * Quando o primeiro plano chegar do Flow, a entrada é assim:
 *
 *   { id: "corte", descricao: "Uma coxinha se parte ao meio e o recheio escorre",
 *     largura: 1280, altura: 720, modo: "unico" }
 */
export const clipes: Clipe[] = []

export function acharClipe(id: string): Clipe | undefined {
  return clipes.find((c) => c.id === id)
}

/** Caminhos dos três arquivos que o script de compressão gera. */
export function arquivosDoClipe(id: string) {
  return {
    webm: `/cinema/${id}.webm`,
    mp4: `/cinema/${id}.mp4`,
    poster: `/cinema/${id}-poster.webp`,
  }
}
