/**
 * As sequências de quadros — tiras de imagem que viram animação por rolagem.
 *
 * Uma sequência é uma imagem só, com N quadros lado a lado, todos da mesma
 * largura. O componente avança o quadro conforme a seção passa pela tela: quem
 * controla a quebra é o dedo de quem rola, não um vídeo tocando sozinho.
 *
 * Para acrescentar:
 *
 *   1. npm run sequencia -- tira-original.png corte 5
 *   2. copie a entrada que o script imprime para a lista abaixo
 *   3. npm run check:midia
 *
 * `largura` e `altura` são de UM quadro, não da tira inteira — é a proporção
 * que o navegador precisa reservar. Sem elas a página pula quando a imagem
 * chega, e o CLS, que hoje é zero, sai do orçamento.
 */

export interface Sequencia {
  /** Nome do arquivo sem extensão, o mesmo passado ao script. */
  id: string
  /** Quantos quadros a tira tem. */
  quadros: number
  /** Dimensões de UM quadro. */
  largura: number
  altura: number
  /**
   * Descrição da cena para quem não enxerga.
   *
   * Vazio quando a peça é decorativa e o texto ao lado já diz tudo: aí ela sai
   * da árvore de acessibilidade, o que é melhor do que anunciar "imagem" sem
   * dizer de quê.
   */
  descricao: string
}

/*
 * VAZIO DE PROPÓSITO.
 *
 * A tira do corte ainda não chegou em arquivo. O caminho inteiro está pronto e
 * foi verificado com uma tira sintética — inclusive o caso em que os quadros
 * não têm a mesma largura, que é o defeito que a ferramenta existe para
 * consertar.
 */
export const sequencias: Sequencia[] = []

export function acharSequencia(id: string): Sequencia | undefined {
  return sequencias.find((s) => s.id === id)
}

export function arquivoDaSequencia(id: string): string {
  return `/cinema/${id}.webp`
}
