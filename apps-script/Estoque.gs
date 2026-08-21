/**
 * Estoque como razão de movimentos.
 *
 * Não existe célula "saldo" que alguém digita. O saldo é a soma do que entrou
 * menos o que saiu, e cada linha do razão diz quando, quanto e por quê.
 *
 * A alternativa — uma coluna de saldo editada à mão — é o motivo de a maioria
 * das planilhas de estoque parar de bater depois de dois meses: alguém corrige
 * um número para "ajustar", e a partir dali ninguém consegue mais reconstruir
 * de onde veio a diferença. Aqui um erro de lançamento é uma linha errada, que
 * dá para achar e corrigir.
 */

/* ───────────────────────────── consultas ────────────────────────────── */

function movimentosDoPedido_(id) {
  const s = aba(ABAS.movimentos)
  const ultima = ultimaLinha(s, 1)
  if (ultima < 2) return []
  const colTipo = coluna(s, 'Tipo')
  const colPedido = coluna(s, 'Pedido')
  const dados = s.getRange(2, 1, ultima - 1, s.getLastColumn()).getValues()
  const achados = []
  for (let i = 0; i < dados.length; i++) {
    if (String(dados[i][colPedido - 1]) === id) {
      achados.push({ linha: i + 2, tipo: String(dados[i][colTipo - 1]) })
    }
  }
  return achados
}

/** Itens e unidades que o pedido consome, calculados do que foi lançado. */
function alocacaoDoPedido_(id) {
  const itens = lerTabela(ABAS.itens).filter(function (l) {
    return String(l['ID pedido']) === id
  })

  const catalogoPorSku = indexarCatalogo(CATALOGO)
  const paraAlocar = itens.map(function (l) {
    const produto = catalogoPorSku[String(l['SKU'])]
    const sabores = String(l['Sabores'] || '')
      .split(',')
      .map(function (t) {
        return t.trim()
      })
      .filter(function (t) {
        return t !== ''
      })
    return {
      linha: produto ? produto.linha : String(l['SKU']),
      produto: String(l['Produto'] || l['SKU']),
      unidades: Number(l['Unidades']) || 0,
      sabores: sabores,
    }
  })

  /*
   * A aba Sabores manda, e não o SABORES gerado do cardápio: se o dono
   * reapontou um sabor para outro item do congelador, é essa a verdade dele.
   */
  const mapa = lerTabela(ABAS.sabores).map(function (l) {
    return { linha: String(l['Linha']), sabor: String(l['Sabor']), item: String(l['Item de estoque']) }
  })

  return alocarEstoque(paraAlocar, mapa)
}

/* ──────────────────────────── lançamentos ───────────────────────────── */

function lancarMovimentos_(tipo, unidadesPorItem, idPedido, obs) {
  const chaves = Object.keys(unidadesPorItem)
  if (chaves.length === 0) return 0
  const linhas = chaves.map(function (item) {
    return [agora(), tipo, item, unidadesPorItem[item], idPedido || '', obs || '']
  })
  acrescentar(ABAS.movimentos, linhas)
  return linhas.length
}

/**
 * Reserva o que o pedido vai consumir.
 *
 * O salgado continua no congelador — o saldo físico não muda. O que muda é
 * quanto ainda dá para prometer a outro cliente. Sem isso a planilha diz que há
 * 300 coxinhas livres enquanto 250 já estão prometidas para o sábado, e o dono
 * aceita um pedido que não tem como entregar.
 */
function reservarPedido_(id) {
  return comTrava(function () {
    const existentes = movimentosDoPedido_(id)
    for (let i = 0; i < existentes.length; i++) {
      // Já reservado ou já vendido: sair sem fazer nada. Sem esta guarda, cada
      // passagem por "Em produção" e "Pronto" reservaria o pedido de novo.
      if (existentes[i].tipo === MOVIMENTO.reserva) return 0
      if (existentes[i].tipo === MOVIMENTO.venda) return 0
    }

    const alocacao = alocacaoDoPedido_(id)
    const total = lancarMovimentos_(MOVIMENTO.reserva, alocacao.unidadesPorItem, id, '')
    avisarNaoAlocado_(id, alocacao.semItem)
    return total
  })
}

/**
 * Converte a reserva em venda: o produto saiu de verdade.
 *
 * Reescreve as linhas que já existem em vez de criar novas. Lançar a venda e
 * apagar a reserva noutra passada deixaria uma janela em que o pedido conta
 * duas vezes — e é justamente durante essa janela que alguém olha o saldo.
 */
function venderPedido_(id) {
  return comTrava(function () {
    const s = aba(ABAS.movimentos)
    const colTipo = coluna(s, 'Tipo')
    const existentes = movimentosDoPedido_(id)

    let jaVendido = false
    const reservas = []
    for (let i = 0; i < existentes.length; i++) {
      if (existentes[i].tipo === MOVIMENTO.venda) jaVendido = true
      if (existentes[i].tipo === MOVIMENTO.reserva) reservas.push(existentes[i].linha)
    }
    if (jaVendido) return 0

    if (reservas.length > 0) {
      for (let i = 0; i < reservas.length; i++) {
        s.getRange(reservas[i], colTipo).setValue(MOVIMENTO.venda)
      }
      return reservas.length
    }

    // Pedido que pulou a confirmação (venda de balcão lançada direto como
    // entregue) não tem reserva para converter.
    const alocacao = alocacaoDoPedido_(id)
    const total = lancarMovimentos_(MOVIMENTO.venda, alocacao.unidadesPorItem, id, '')
    avisarNaoAlocado_(id, alocacao.semItem)
    return total
  })
}

/**
 * Desfaz a reserva de um pedido cancelado ou reaberto.
 *
 * Venda não é desfeita aqui. Cancelar um pedido já entregue é devolução, e
 * devolução tem que ser lançada à mão como "Ajuste +" — apagar a saída em
 * silêncio faria o estoque voltar sem ninguém saber que houve uma devolução.
 */
function soltarReserva_(id) {
  return comTrava(function () {
    const s = aba(ABAS.movimentos)
    const alvos = movimentosDoPedido_(id)
      .filter(function (m) {
        return m.tipo === MOVIMENTO.reserva
      })
      .map(function (m) {
        return m.linha
      })
      .sort(function (a, b) {
        return b - a // de baixo para cima: apagar linha não desloca as próximas
      })

    for (let i = 0; i < alvos.length; i++) s.deleteRow(alvos[i])

    const vendas = movimentosDoPedido_(id).filter(function (m) {
      return m.tipo === MOVIMENTO.venda
    })
    if (vendas.length > 0) {
      SpreadsheetApp.getActive().toast(
        'O pedido ' + id + ' já tinha baixa de venda. Se houve devolução, lance "Ajuste +" ' +
          'em Movimentos — não apaguei a saída sozinho.',
        'Don Enrico',
        12
      )
    }
    return alvos.length
  })
}

/**
 * Avisa o que não deu para descontar sozinho.
 *
 * Acontece com o pacote "Sortidos", que é mistura e não um produto do
 * congelador. Aviso na tela é melhor que descontar de um item adivinhado: erro
 * visível se conserta, erro silencioso vira diferença de estoque no fim do mês.
 */
function avisarNaoAlocado_(id, semItem) {
  if (!semItem || semItem.length === 0) return
  const partes = semItem.map(function (x) {
    return x.produto + ' (' + x.unidades + ' un — ' + x.motivo + ')'
  })
  SpreadsheetApp.getActive().toast(
    'No pedido ' + id + ' não deu para baixar sozinho: ' + partes.join('; ') +
      '. Lance à mão em Movimentos.',
    'Don Enrico',
    15
  )
}

/* ───────────────────────── lançamentos pelo menu ─────────────────────── */

function novaProducao() {
  novaLinhaDeMovimento_(MOVIMENTO.producao)
}

function novaPerda() {
  novaLinhaDeMovimento_(MOVIMENTO.perda)
}

/**
 * Abre uma linha pronta no razão e leva o cursor até ela.
 *
 * Sem formulário: o lançamento é escolher o item numa lista e digitar a
 * quantidade. Formulário para dois campos seria mais código para fazer o mesmo
 * mais devagar.
 */
function novaLinhaDeMovimento_(tipo) {
  const s = aba(ABAS.movimentos)
  const linha = ultimaLinha(s, 1) + 1
  s.getRange(linha, coluna(s, 'Data')).setValue(agora())
  s.getRange(linha, coluna(s, 'Tipo')).setValue(tipo)
  planilha().setActiveSheet(s)
  s.setActiveRange(s.getRange(linha, coluna(s, 'Item')))
  SpreadsheetApp.getActive().toast('Escolha o item e digite as unidades.', tipo, 6)
}

/** Refaz a baixa de um pedido a partir do que está lançado em Itens. */
function recalcularEstoqueDoPedido() {
  const p = aba(ABAS.pedidos)
  const linha = p.getActiveRange() ? p.getActiveRange().getRow() : 0
  if (planilha().getActiveSheet().getName() !== ABAS.pedidos || linha < 2) {
    SpreadsheetApp.getUi().alert('Selecione a linha do pedido na aba Pedidos.')
    return
  }

  const id = String(p.getRange(linha, coluna(p, 'ID')).getValue())
  const status = String(p.getRange(linha, coluna(p, 'Status')).getValue())
  if (!id) return

  comTrava(function () {
    const s = aba(ABAS.movimentos)
    const alvos = movimentosDoPedido_(id)
      .map(function (m) {
        return m.linha
      })
      .sort(function (a, b) {
        return b - a
      })
    for (let i = 0; i < alvos.length; i++) s.deleteRow(alvos[i])
  })

  aplicarStatus_(p, linha, id, status)
  SpreadsheetApp.getActive().toast('Estoque do pedido ' + id + ' refeito.', 'Don Enrico', 6)
}
