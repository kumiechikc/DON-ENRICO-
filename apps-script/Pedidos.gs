/**
 * Criação e ciclo de vida do pedido.
 */

/**
 * Próximo número de pedido.
 *
 * Sequencial e não data/hora porque este número vai ser dito em voz alta e
 * escrito em etiqueta de caixa. "P-0043" é conversável; um carimbo de
 * milissegundos não é.
 */
function proximoId_() {
  const s = aba(ABAS.pedidos)
  const ultima = ultimaLinha(s, 1)
  if (ultima < 2) return 'P-0001'
  const ids = s.getRange(2, 1, ultima - 1, 1).getValues()
  let maior = 0
  for (let i = 0; i < ids.length; i++) {
    const m = String(ids[i][0]).match(/^P-(\d+)$/)
    if (m) maior = Math.max(maior, parseInt(m[1], 10))
  }
  return 'P-' + String(maior + 1).padStart(4, '0')
}

/** Códigos já usados, para o sorteio não repetir. */
function codigosEmUso_() {
  const s = aba(ABAS.pedidos)
  const ultima = ultimaLinha(s, 1)
  const usados = {}
  if (ultima < 2) return usados
  const valores = s.getRange(2, coluna(s, 'Código'), ultima - 1, 1).getValues()
  for (let i = 0; i < valores.length; i++) usados[String(valores[i][0])] = true
  return usados
}

/** Acha um pedido já gravado pelo código curto, ou devolve null. */
function pedidoPorCodigo_(codigo) {
  if (!codigo) return null
  const s = aba(ABAS.pedidos)
  const ultima = ultimaLinha(s, 1)
  if (ultima < 2) return null
  const colCodigo = coluna(s, 'Código')
  const dados = s.getRange(2, 1, ultima - 1, Math.max(colCodigo, 1)).getValues()
  for (let i = 0; i < dados.length; i++) {
    if (String(dados[i][colCodigo - 1]) === codigo) {
      return { id: String(dados[i][0]), linha: i + 2 }
    }
  }
  return null
}

function codigoInedito_() {
  const usados = codigosEmUso_()
  for (let i = 0; i < 50; i++) {
    const c = gerarCodigo()
    if (!usados[c]) return c
  }
  // 50 colisões seguidas em 810 mil combinações não acontece por acaso; se
  // acontecer, é bug, e falhar alto é melhor do que gravar código repetido.
  throw new Error('não foi possível sortear um código livre')
}

/**
 * Grava o pedido e seus itens.
 *
 * `pedido` já vem validado por `normalizarPedido`. Escreve só as colunas
 * digitadas — Total, Líquido, Estoque, Produto, Unidades e Preço são fórmulas,
 * e sobrescrever qualquer uma delas quebraria a coluna inteira.
 */
function gravarPedido_(pedido, dados) {
  return comTrava(function () {
    const p = aba(ABAS.pedidos)
    const id = proximoId_()
    const codigo = dados.codigo || codigoInedito_()
    const linha = ultimaLinha(p, 1) + 1

    p.getRange(linha, coluna(p, 'ID')).setValue(id)
    p.getRange(linha, coluna(p, 'Código')).setValue(codigo)
    p.getRange(linha, coluna(p, 'Recebido em')).setValue(agora())
    p.getRange(linha, coluna(p, 'Origem')).setValue(dados.origem || 'WhatsApp')
    p.getRange(linha, coluna(p, 'Cliente')).setValue(dados.cliente || '')
    p.getRange(linha, coluna(p, 'Telefone')).setValue(dados.telefone || '')
    p.getRange(linha, coluna(p, 'Status')).setValue(dados.status || STATUS.novo)
    p.getRange(linha, coluna(p, 'Pagamento')).setValue('Pendente')
    p.getRange(linha, coluna(p, 'Obs')).setValue(dados.obs || '')

    const itens = pedido.itens.map(function (it) {
      return [id, it.sku, it.sabores.join(', '), it.pacotes]
    })
    gravarItens_(itens)

    return { id: id, codigo: codigo, linha: linha }
  })
}

/**
 * Escreve as colunas digitadas de Itens.
 *
 * Produto, Unidades, Preço e Subtotal ficam de fora porque são fórmulas que
 * buscam no Catálogo — é o que faz o lançamento manual ser só escolher o SKU e
 * dizer quantos pacotes, e o que garante que o preço registrado é o do
 * cardápio, nunca um número digitado errado.
 */
function gravarItens_(linhas) {
  if (linhas.length === 0) return
  const s = aba(ABAS.itens)
  const inicio = ultimaLinha(s, 1) + 1
  const cols = {
    id: coluna(s, 'ID pedido'),
    sku: coluna(s, 'SKU'),
    sabores: coluna(s, 'Sabores'),
    pacotes: coluna(s, 'Pacotes'),
  }

  for (let i = 0; i < linhas.length; i++) {
    const alvo = inicio + i
    s.getRange(alvo, cols.id).setValue(linhas[i][0])
    s.getRange(alvo, cols.sku).setValue(linhas[i][1])
    s.getRange(alvo, cols.sabores).setValue(linhas[i][2])
    s.getRange(alvo, cols.pacotes).setValue(linhas[i][3])
  }
}

/* ─────────────────────── mudança de status na planilha ───────────────── */

/**
 * Gatilho simples de edição.
 *
 * Só reage à coluna Status da aba Pedidos. Qualquer outra edição sai daqui na
 * primeira linha — este gatilho roda a CADA tecla confirmada em qualquer célula
 * da planilha, e trabalho desnecessário aqui deixa a planilha lenta de usar.
 */
function onEdit(e) {
  if (!e || !e.range) return
  const s = e.range.getSheet()
  if (s.getName() !== ABAS.pedidos) return
  if (e.range.getRow() < 2 || e.range.getNumRows() > 1) return
  if (e.range.getColumn() !== coluna(s, 'Status')) return

  const linha = e.range.getRow()
  const id = s.getRange(linha, coluna(s, 'ID')).getValue()
  if (!id) return

  aplicarStatus_(s, linha, String(id), String(e.value || ''))
}

function aplicarStatus_(s, linha, id, status) {
  if (STATUS_RESERVAM.indexOf(status) !== -1) {
    reservarPedido_(id)
    return
  }

  if (status === STATUS.entregue) {
    const colEntrega = coluna(s, 'Entrega em')
    // Sem data de entrega o pedido não entra em nenhum relatório do mês. Se o
    // dono marcou "Entregue" e não preencheu, o dia é hoje.
    if (!s.getRange(linha, colEntrega).getValue()) {
      s.getRange(linha, colEntrega).setValue(agora())
    }
    venderPedido_(id)
    return
  }

  if (status === STATUS.cancelado || status === STATUS.novo) {
    soltarReserva_(id)
  }
}
