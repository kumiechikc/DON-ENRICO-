/**
 * Menu da planilha. É por aqui que o dono usa o sistema.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Don Enrico')
    .addItem('Novo pedido', 'novoPedido')
    .addSeparator()
    .addItem('Lançar produção', 'novaProducao')
    .addItem('Lançar perda', 'novaPerda')
    .addItem('Refazer estoque do pedido selecionado', 'recalcularEstoqueDoPedido')
    .addSeparator()
    .addItem('Pedidos dos próximos 7 dias', 'mostrarAgenda')
    .addSeparator()
    .addItem('Instalar / atualizar planilha', 'instalar')
    .addItem('Token do site', 'mostrarTokenDoSite')
    .addToUi()
}

/**
 * Abre um pedido em branco já numerado e leva o cursor para o nome do cliente.
 *
 * Numerar por código evita o vício mais comum de planilha compartilhada: duas
 * pessoas começam a digitar na mesma linha vazia e uma sobrescreve a outra.
 */
function novoPedido() {
  const dados = comTrava(function () {
    const p = aba(ABAS.pedidos)
    const id = proximoId_()
    const codigo = codigoInedito_()
    const linha = ultimaLinha(p, 1) + 1

    p.getRange(linha, coluna(p, 'ID')).setValue(id)
    p.getRange(linha, coluna(p, 'Código')).setValue(codigo)
    p.getRange(linha, coluna(p, 'Recebido em')).setValue(agora())
    p.getRange(linha, coluna(p, 'Origem')).setValue('WhatsApp')
    p.getRange(linha, coluna(p, 'Status')).setValue(STATUS.novo)
    p.getRange(linha, coluna(p, 'Pagamento')).setValue('Pendente')

    return { id: id, linha: linha, coluna: coluna(p, 'Cliente') }
  })

  const p = aba(ABAS.pedidos)
  planilha().setActiveSheet(p)
  p.setActiveRange(p.getRange(dados.linha, dados.coluna))
  SpreadsheetApp.getActive().toast(
    'Pedido ' + dados.id + ' aberto. Lance os itens na aba Itens usando este ID.',
    'Don Enrico',
    8
  )
}

/**
 * O que tem para entregar na semana, com os itens de cada pedido.
 *
 * Existe porque a pergunta que o caderno respondia bem era "o que eu preciso
 * fritar até sábado". Se a planilha não responder isso mais rápido que o
 * caderno, o caderno volta.
 */
function mostrarAgenda() {
  const pedidos = lerTabela(ABAS.pedidos)
  const itens = lerTabela(ABAS.itens)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)

  const itensPorPedido = {}
  for (let i = 0; i < itens.length; i++) {
    const id = String(itens[i]['ID pedido'])
    if (!itensPorPedido[id]) itensPorPedido[id] = []
    const sabores = String(itens[i]['Sabores'] || '')
    itensPorPedido[id].push(
      '   ' + itens[i]['Pacotes'] + 'x ' + itens[i]['Produto'] + (sabores ? ' (' + sabores + ')' : '')
    )
  }

  const naSemana = pedidos
    .filter(function (p) {
      const status = String(p['Status'])
      if (status === STATUS.entregue || status === STATUS.cancelado) return false
      const entrega = p['Entrega em']
      if (!entrega) return false
      const d = new Date(entrega)
      return d >= hoje && d <= limite
    })
    .sort(function (a, b) {
      return new Date(a['Entrega em']) - new Date(b['Entrega em'])
    })

  if (naSemana.length === 0) {
    SpreadsheetApp.getUi().alert('Nada com entrega marcada para os próximos 7 dias.')
    return
  }

  const texto = naSemana
    .map(function (p) {
      const cabecalho =
        dataCurta(p['Entrega em']) +
        ' — ' +
        (p['Cliente'] || '(sem nome)') +
        ' — ' +
        p['Status'] +
        ' — ' +
        moeda(p['Total'])
      const linhas = itensPorPedido[String(p['ID'])] || ['   (nenhum item lançado)']
      return cabecalho + '\n' + linhas.join('\n')
    })
    .join('\n\n')

  SpreadsheetApp.getUi().alert('Próximos 7 dias', texto, SpreadsheetApp.getUi().ButtonSet.OK)
}
