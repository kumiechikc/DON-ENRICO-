/**
 * Nomes de aba, colunas e listas fixas.
 *
 * Tudo que a planilha e o código precisam concordar mora aqui. Se um cabeçalho
 * for renomeado na mão dentro da planilha, o `Instalar / atualizar` devolve o
 * nome original — as fórmulas e o código procuram a coluna pelo nome.
 */

const ABAS = {
  resumo: 'Resumo',
  pedidos: 'Pedidos',
  itens: 'Itens',
  estoque: 'Estoque',
  movimentos: 'Movimentos',
  catalogo: 'Catálogo',
  sabores: 'Sabores',
}

const COLUNAS = {
  Pedidos: [
    'ID',
    'Código',
    'Recebido em',
    'Origem',
    'Cliente',
    'Telefone',
    'Entrega em',
    'Status',
    'Pagamento',
    'Total',
    'Estoque',
    'Obs',
  ],
  Itens: ['ID pedido', 'SKU', 'Produto', 'Sabores', 'Pacotes', 'Unidades', 'Preço', 'Subtotal'],
  Movimentos: ['Data', 'Tipo', 'Item', 'Unidades', 'Pedido', 'Obs'],
  Estoque: [
    'Item',
    'Nome',
    'Linha',
    'Mínimo',
    'Entradas',
    'Saídas',
    'Saldo',
    'Comprometido',
    'Livre',
    'Alerta',
  ],
  'Catálogo': ['SKU', 'Linha', 'Produto', 'Unidades', 'Preço', 'Máx. sabores', 'Ativo'],
  Sabores: ['Linha', 'Sabor', 'Item de estoque'],
}

/*
 * O ciclo de vida do pedido.
 *
 * Dois pontos mexem no estoque, e a escolha de quais é deliberada:
 *
 * — CONFIRMADO gera RESERVA. O salgado ainda está no congelador, então o saldo
 *   físico não muda; o que muda é o quanto sobrou de livre para prometer a
 *   outro cliente. É o erro clássico de planilha de encomenda: o saldo diz 300,
 *   o dono aceita mais um pedido de 200, e 400 já estavam prometidos.
 *
 * — ENTREGUE vira VENDA. Aí o produto saiu de verdade.
 *
 * Os estados do meio existem para o dono enxergar a fila da semana, e não
 * mexem em nada.
 */
const STATUS = {
  novo: 'Novo',
  confirmado: 'Confirmado',
  producao: 'Em produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_LISTA = [
  STATUS.novo,
  STATUS.confirmado,
  STATUS.producao,
  STATUS.pronto,
  STATUS.entregue,
  STATUS.cancelado,
]

/** Estados em que o pedido está de pé e o produto segue reservado. */
const STATUS_RESERVAM = [STATUS.confirmado, STATUS.producao, STATUS.pronto]

const MOVIMENTO = {
  producao: 'Produção',
  reserva: 'Reserva',
  venda: 'Venda',
  perda: 'Perda',
  ajusteMais: 'Ajuste +',
  ajusteMenos: 'Ajuste -',
}

const MOVIMENTO_LISTA = [
  MOVIMENTO.producao,
  MOVIMENTO.reserva,
  MOVIMENTO.venda,
  MOVIMENTO.perda,
  MOVIMENTO.ajusteMais,
  MOVIMENTO.ajusteMenos,
]

/*
 * Formas de pagamento como a operação realmente funciona.
 *
 * Não há coluna de taxa nem de valor líquido: o parcelamento é combinado na
 * conversa e a maquininha vai na entrega, então a planilha não tem como saber a
 * taxa de cada venda. Uma coluna que só ficaria vazia ou errada é pior que
 * coluna nenhuma, porque alguém vai acabar somando aquilo achando que é real.
 */
const PAGAMENTOS = ['Pendente', 'Pix', 'Dinheiro', 'Cartão na entrega']

const ORIGENS = ['Site', 'WhatsApp', 'Pessoalmente', 'Telefone', 'Instagram']

/** Limites do endpoint público. Ver WebApp.gs para o motivo de cada um. */
const LIMITES = {
  maxItens: 40,
  maxPacotes: 200,
  maxCorpoBytes: 8000,
}
