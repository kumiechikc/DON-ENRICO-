/**
 * Cria e atualiza a estrutura da planilha.
 *
 * Roda quantas vezes for preciso. As abas de dado (Pedidos, Itens, Movimentos,
 * Taxas) só têm cabeçalho, fórmula e validação reescritos — nenhuma linha é
 * tocada. As abas de referência (Catálogo, Sabores, Estoque) são regeneradas a
 * partir do Catalogo.gs, preservando o que é do dono: o estoque mínimo de cada
 * item e o apontamento de sabor que ele tenha corrigido à mão.
 *
 * É assim porque mudança de cardápio vai acontecer, e ter que remontar a
 * planilha na mão a cada mudança é o caminho mais curto para o dono voltar
 * para o caderno.
 */

function instalar() {
  const ss = planilha()

  criarAbas_(ss)
  escreverCabecalhos_(ss)
  sincronizarCatalogo_()
  sincronizarSabores_()
  sincronizarEstoque_()
  escreverFormulas_()
  aplicarValidacoes_()
  aplicarFormatos_()
  montarResumo_()
  ordenarAbas_(ss)

  SpreadsheetApp.getActive().toast('Planilha atualizada.', 'Don Enrico', 5)
}

/* ─────────────────────────────── estrutura ──────────────────────────── */

function criarAbas_(ss) {
  const nomes = [
    ABAS.resumo,
    ABAS.pedidos,
    ABAS.itens,
    ABAS.estoque,
    ABAS.movimentos,
    ABAS.catalogo,
    ABAS.sabores,
    ABAS.taxas,
  ]
  for (let i = 0; i < nomes.length; i++) {
    if (!ss.getSheetByName(nomes[i])) ss.insertSheet(nomes[i])
  }
  /*
   * A planilha nova vem com uma "Página1" vazia. Deixá-la é a diferença entre
   * abrir o arquivo e ver o resumo ou abrir e ver uma folha em branco.
   */
  const sobra = ss.getSheetByName('Página1') || ss.getSheetByName('Sheet1')
  if (sobra && ss.getSheets().length > 1 && sobra.getLastRow() === 0) ss.deleteSheet(sobra)
}

function ordenarAbas_(ss) {
  const ordem = [
    ABAS.resumo,
    ABAS.pedidos,
    ABAS.itens,
    ABAS.estoque,
    ABAS.movimentos,
    ABAS.catalogo,
    ABAS.sabores,
    ABAS.taxas,
  ]
  for (let i = 0; i < ordem.length; i++) {
    const s = ss.getSheetByName(ordem[i])
    if (s) {
      ss.setActiveSheet(s)
      ss.moveActiveSheet(i + 1)
    }
  }
  ss.setActiveSheet(ss.getSheetByName(ABAS.resumo))
}

function escreverCabecalhos_(ss) {
  const nomes = Object.keys(COLUNAS)
  for (let i = 0; i < nomes.length; i++) {
    const s = ss.getSheetByName(nomes[i])
    const cols = COLUNAS[nomes[i]]
    if (s.getMaxColumns() < cols.length) {
      s.insertColumnsAfter(s.getMaxColumns(), cols.length - s.getMaxColumns())
    }
    s.getRange(1, 1, 1, cols.length)
      .setValues([cols])
      .setFontWeight('bold')
      .setBackground('#2A1A12')
      .setFontColor('#F8EFE3')
    s.setFrozenRows(1)
  }
}

/* ──────────────────────── abas geradas do cardápio ───────────────────── */

function sincronizarCatalogo_() {
  const s = aba(ABAS.catalogo)
  const anterior = {}
  const atual = lerTabela(ABAS.catalogo)
  for (let i = 0; i < atual.length; i++) anterior[atual[i]['SKU']] = atual[i]['Ativo']

  const linhas = CATALOGO.map(function (p) {
    /*
     * "Ativo" é do dono: ele pode tirar do ar um sabor que acabou sem esperar
     * um deploy do site. Regenerar a aba não pode desfazer essa decisão.
     */
    const ativo = Object.prototype.hasOwnProperty.call(anterior, p.sku) ? anterior[p.sku] : true
    return [p.sku, p.linha, p.produto, p.unidades, p.preco, p.maxSabores, ativo]
  })

  limparDados_(s, COLUNAS['Catálogo'].length)
  s.getRange(2, 1, linhas.length, linhas[0].length).setValues(linhas)
}

function sincronizarSabores_() {
  const s = aba(ABAS.sabores)
  const anterior = {}
  const atual = lerTabela(ABAS.sabores)
  for (let i = 0; i < atual.length; i++) {
    anterior[atual[i]['Linha'] + '|' + atual[i]['Sabor']] = atual[i]['Item de estoque']
  }

  const linhas = SABORES.map(function (s2) {
    /*
     * O apontamento sabor -> item de estoque é palpite gerado do cardápio. Se o
     * dono corrigiu (dizendo que a mini pizza congelada é a mesma da Seleção,
     * por exemplo), a correção dele manda. Ela vale mais do que a minha regra:
     * ele é quem abre o congelador.
     */
    const chave = s2.linha + '|' + s2.sabor
    const item = Object.prototype.hasOwnProperty.call(anterior, chave) ? anterior[chave] : s2.item
    return [s2.linha, s2.sabor, item]
  })

  limparDados_(s, COLUNAS.Sabores.length)
  s.getRange(2, 1, linhas.length, linhas[0].length).setValues(linhas)
}

function sincronizarEstoque_() {
  const s = aba(ABAS.estoque)
  const minimos = {}
  const atual = lerTabela(ABAS.estoque)
  for (let i = 0; i < atual.length; i++) minimos[atual[i]['Item']] = atual[i]['Mínimo']

  const linhas = ITENS_ESTOQUE.map(function (it) {
    const minimo = minimos[it.id] === '' || minimos[it.id] === undefined ? 0 : minimos[it.id]
    return [it.id, it.nome, it.tipo, minimo]
  })

  limparDados_(s, 4)
  s.getRange(2, 1, linhas.length, 4).setValues(linhas)
}

/**
 * Apaga os dados mantendo o cabeçalho.
 *
 * `largura` limita a limpeza às colunas digitadas. As calculadas ficam de fora
 * porque são o resultado derramado de uma fórmula de matriz na linha 1 — mexer
 * nessas células quebra o derrame inteiro com um #REF!.
 */
function limparDados_(s, largura) {
  const ultima = s.getMaxRows()
  if (ultima > 1) s.getRange(2, 1, ultima - 1, largura).clearContent()
}

/* ─────────────────────────────── fórmulas ───────────────────────────── */

/*
 * Toda coluna calculada é UMA fórmula de matriz na célula do cabeçalho, e não
 * uma fórmula repetida linha a linha.
 *
 * A diferença aparece no uso: fórmula por linha some quando alguém acrescenta
 * um pedido digitando na primeira linha vazia, e o erro fica invisível — a
 * célula só fica em branco. A fórmula de matriz cobre a coluna inteira, então
 * linha nova já nasce calculada.
 */
function escreverFormulas_() {
  const p = aba(ABAS.pedidos)
  const i = aba(ABAS.itens)
  const e = aba(ABAS.estoque)
  const t = aba(ABAS.taxas)

  // Total do pedido = soma dos itens. Não existe total digitado à mão: sem item
  // lançado não há como dar baixa no estoque, e um total solto esconderia isso.
  p.getRange(1, coluna(p, 'Total')).setFormula(
    matriz_('Total', 'IF($A:$A="","",SUMIF(' + ABAS.itens + "!$A:$A,$A:$A," + ABAS.itens + '!$H:$H))')
  )

  p.getRange(1, coluna(p, 'Líquido')).setFormula(
    matriz_(
      'Líquido',
      'IF($A:$A="","",$K:$K*(1-IFERROR(VLOOKUP($J:$J&"|"&$I:$I,' +
        ABAS.taxas +
        '!$A:$D,4,FALSE),0)))'
    )
  )

  /*
   * Situação do estoque lida do razão, nunca de uma marcação própria.
   *
   * A alternativa seria uma coluna "baixa dada" escrita pelo script. Ela
   * mentiria no primeiro desfazer: o dono apaga o movimento, e a marcação
   * continua dizendo que a baixa foi dada.
   */
  p.getRange(1, coluna(p, 'Estoque')).setFormula(
    matriz_(
      'Estoque',
      'IF($A:$A="","",IF(COUNTIFS(' +
        ABAS.movimentos +
        '!$E:$E,$A:$A,' +
        ABAS.movimentos +
        '!$B:$B,"' +
        MOVIMENTO.venda +
        '")>0,"baixado",IF(COUNTIFS(' +
        ABAS.movimentos +
        '!$E:$E,$A:$A,' +
        ABAS.movimentos +
        '!$B:$B,"' +
        MOVIMENTO.reserva +
        '")>0,"reservado","-")))'
    )
  )

  /*
   * Produto, Unidades e Preço saem do Catálogo pelo SKU.
   *
   * É o que torna o lançamento manual viável: o dono escolhe o SKU numa lista e
   * digita quantos pacotes — o resto se preenche. E resolve de raiz o erro mais
   * caro de planilha de pedido, que é preço digitado errado passar despercebido
   * até o fim do mês.
   */
  const cat = ABAS.catalogo
  i.getRange(1, coluna(i, 'Produto')).setFormula(
    matriz_('Produto', 'IF($B:$B="","",IFERROR(VLOOKUP($B:$B,' + cat + '!$A:$C,3,FALSE),"SKU desconhecido"))')
  )
  i.getRange(1, coluna(i, 'Unidades')).setFormula(
    matriz_('Unidades', 'IF($B:$B="","",IFERROR(VLOOKUP($B:$B,' + cat + '!$A:$D,4,FALSE)*$E:$E,0))')
  )
  i.getRange(1, coluna(i, 'Preço')).setFormula(
    matriz_('Preço', 'IF($B:$B="","",IFERROR(VLOOKUP($B:$B,' + cat + '!$A:$E,5,FALSE),0))')
  )
  i.getRange(1, coluna(i, 'Subtotal')).setFormula(
    matriz_('Subtotal', 'IF($A:$A="","",$E:$E*$G:$G)')
  )

  t.getRange(1, coluna(t, 'Chave')).setFormula(
    matriz_('Chave', 'IF($B:$B="","",$B:$B&"|"&$C:$C)')
  )

  const mov = ABAS.movimentos
  const soma = function (tipo) {
    return (
      'SUMIFS(' + mov + '!$D:$D,' + mov + '!$C:$C,$A:$A,' + mov + '!$B:$B,"' + tipo + '")'
    )
  }

  e.getRange(1, coluna(e, 'Entradas')).setFormula(
    matriz_('Entradas', 'IF($A:$A="","",' + soma(MOVIMENTO.producao) + '+' + soma(MOVIMENTO.ajusteMais) + ')')
  )
  e.getRange(1, coluna(e, 'Saídas')).setFormula(
    matriz_(
      'Saídas',
      'IF($A:$A="","",' +
        soma(MOVIMENTO.venda) +
        '+' +
        soma(MOVIMENTO.perda) +
        '+' +
        soma(MOVIMENTO.ajusteMenos) +
        ')'
    )
  )
  e.getRange(1, coluna(e, 'Saldo')).setFormula(matriz_('Saldo', 'IF($A:$A="","",$E:$E-$F:$F)'))
  e.getRange(1, coluna(e, 'Comprometido')).setFormula(
    matriz_('Comprometido', 'IF($A:$A="","",' + soma(MOVIMENTO.reserva) + ')')
  )
  e.getRange(1, coluna(e, 'Livre')).setFormula(matriz_('Livre', 'IF($A:$A="","",$G:$G-$H:$H)'))
  e.getRange(1, coluna(e, 'Alerta')).setFormula(
    matriz_('Alerta', 'IF($A:$A="","",IF($I:$I<$D:$D,"repor",""))')
  )
}

/**
 * Fórmula de matriz que também escreve o próprio cabeçalho.
 *
 * O `IF(ROW=1, título, ...)` existe porque a fórmula ocupa a coluna inteira,
 * inclusive a linha 1 — sem isso o cabeçalho seria sobrescrito por um cálculo.
 */
function matriz_(titulo, expressao) {
  return '=ARRAYFORMULA(IF(ROW($A:$A)=1,"' + titulo + '",' + expressao + '))'
}

/* ────────────────────────────── validações ──────────────────────────── */

function aplicarValidacoes_() {
  const p = aba(ABAS.pedidos)
  const m = aba(ABAS.movimentos)
  const e = aba(ABAS.estoque)
  const t = aba(ABAS.taxas)

  lista_(p, coluna(p, 'Status'), STATUS_LISTA)
  lista_(p, coluna(p, 'Origem'), ORIGENS)
  lista_(p, coluna(p, 'Pagamento'), PAGAMENTOS)
  intervalo_(p, coluna(p, 'Maquininha'), t.getRange(2, coluna(t, 'Maquininha'), 200, 1))

  lista_(m, coluna(m, 'Tipo'), MOVIMENTO_LISTA)
  intervalo_(m, coluna(m, 'Item'), e.getRange(2, 1, 300, 1))

  lista_(t, coluna(t, 'Forma'), PAGAMENTOS.slice(1))

  const i = aba(ABAS.itens)
  const c0 = aba(ABAS.catalogo)
  intervalo_(i, coluna(i, 'SKU'), c0.getRange(2, 1, 200, 1))
  intervalo_(i, coluna(i, 'ID pedido'), p.getRange(2, coluna(p, 'ID'), 2000, 1))

  p.setColumnWidth(coluna(p, 'Obs'), 260)

  // "Ativo" é sim/não: caixa de seleção evita alguém digitar "s" e a fórmula
  // do site não reconhecer.
  const c = aba(ABAS.catalogo)
  c.getRange(2, coluna(c, 'Ativo'), c.getMaxRows() - 1, 1).insertCheckboxes()
}

function lista_(s, col, valores) {
  const regra = SpreadsheetApp.newDataValidation()
    .requireValueInList(valores, true)
    .setAllowInvalid(false)
    .build()
  s.getRange(2, col, s.getMaxRows() - 1, 1).setDataValidation(regra)
}

function intervalo_(s, col, origem) {
  const regra = SpreadsheetApp.newDataValidation()
    .requireValueInRange(origem, true)
    /*
     * Aqui `true` de propósito: a lista de maquininhas e a de itens mudam, e
     * bloquear valor fora da lista travaria o dono no meio de um lançamento
     * urgente por causa de um cadastro que ele ainda não fez.
     */
    .setAllowInvalid(true)
    .build()
  s.getRange(2, col, s.getMaxRows() - 1, 1).setDataValidation(regra)
}

/* ─────────────────────────────── formato ────────────────────────────── */

function aplicarFormatos_() {
  const p = aba(ABAS.pedidos)
  const i = aba(ABAS.itens)
  const e = aba(ABAS.estoque)
  const m = aba(ABAS.movimentos)
  const c = aba(ABAS.catalogo)
  const t = aba(ABAS.taxas)

  moedaCol_(p, ['Total', 'Líquido'])
  moedaCol_(i, ['Preço', 'Subtotal'])
  moedaCol_(c, ['Preço'])

  p.getRange(2, coluna(p, 'Recebido em'), p.getMaxRows() - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm')
  p.getRange(2, coluna(p, 'Entrega em'), p.getMaxRows() - 1, 1).setNumberFormat('dd/MM/yyyy')
  m.getRange(2, coluna(m, 'Data'), m.getMaxRows() - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm')
  t.getRange(2, coluna(t, 'Taxa %'), t.getMaxRows() - 1, 1).setNumberFormat('0.00%')

  const alerta = e.getRange(2, 1, e.getMaxRows() - 1, COLUNAS.Estoque.length)
  const letraAlerta = colunaLetra_(coluna(e, 'Alerta'))
  e.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letraAlerta + '2="repor"')
      .setBackground('#FBE3E4')
      .setRanges([alerta])
      .build(),
  ])

  const faixaStatus = p.getRange(2, 1, p.getMaxRows() - 1, COLUNAS.Pedidos.length)
  const letraStatus = colunaLetra_(coluna(p, 'Status'))
  const regra = function (valor, cor) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letraStatus + '2="' + valor + '"')
      .setBackground(cor)
      .setRanges([faixaStatus])
      .build()
  }
  p.setConditionalFormatRules([
    regra(STATUS.novo, '#FFF3D6'),
    regra(STATUS.entregue, '#E7F3E9'),
    regra(STATUS.cancelado, '#EDEDED'),
  ])

  const abas = [p, i, e, m, c, t]
  for (let k = 0; k < abas.length; k++) abas[k].autoResizeColumns(1, 4)
}

function moedaCol_(s, nomes) {
  for (let i = 0; i < nomes.length; i++) {
    s.getRange(2, coluna(s, nomes[i]), s.getMaxRows() - 1, 1).setNumberFormat('R$ #,##0.00')
  }
}

function colunaLetra_(indice) {
  let n = indice
  let letra = ''
  while (n > 0) {
    const resto = (n - 1) % 26
    letra = String.fromCharCode(65 + resto) + letra
    n = Math.floor((n - resto) / 26)
  }
  return letra
}

/* ──────────────────────────────── resumo ────────────────────────────── */

function montarResumo_() {
  const s = aba(ABAS.resumo)
  s.clear()

  const p = ABAS.pedidos
  const e = ABAS.estoque
  const mesInicio = '=EOMONTH(TODAY(),-1)+1'

  const linhas = [
    ['Don Enrico — operação', ''],
    ['', ''],
    ['Mês', '=TEXT(TODAY(),"MMMM \\"de\\" yyyy")'],
    [
      'Faturamento entregue no mês',
      '=SUMIFS(' + p + '!K:K,' + p + '!H:H,"' + STATUS.entregue + '",' + p + '!G:G,">="&' +
        mesInicio.slice(1) + ',' + p + '!G:G,"<="&EOMONTH(TODAY(),0))',
    ],
    [
      'Recebido líquido (depois da maquininha)',
      '=SUMIFS(' + p + '!L:L,' + p + '!H:H,"' + STATUS.entregue + '",' + p + '!G:G,">="&' +
        mesInicio.slice(1) + ',' + p + '!G:G,"<="&EOMONTH(TODAY(),0))',
    ],
    ['Custo de maquininha no mês', '=B4-B5'],
    [
      'Pedidos entregues no mês',
      '=COUNTIFS(' + p + '!H:H,"' + STATUS.entregue + '",' + p + '!G:G,">="&' +
        mesInicio.slice(1) + ',' + p + '!G:G,"<="&EOMONTH(TODAY(),0))',
    ],
    ['Ticket médio', '=IFERROR(B4/B7,0)'],
    ['', ''],
    ['A fazer', ''],
    ['Novos, ainda sem confirmar', '=COUNTIF(' + p + '!H:H,"' + STATUS.novo + '")'],
    [
      'Confirmados para os próximos 7 dias',
      '=COUNTIFS(' + p + '!H:H,"' + STATUS.confirmado + '",' + p + '!G:G,">="&TODAY(),' + p +
        '!G:G,"<="&TODAY()+7)',
    ],
    ['Prontos para entregar', '=COUNTIF(' + p + '!H:H,"' + STATUS.pronto + '")'],
    ['Itens abaixo do estoque mínimo', '=COUNTIF(' + e + '!J:J,"repor")'],
    ['', ''],
    ['Repor no congelador', ''],
    [
      '',
      '=IFERROR(TEXTJOIN(CHAR(10),TRUE,FILTER(' + e + '!B:B&" — livre "&' + e + '!I:I&" de " &' +
        e + '!D:D,' + e + '!J:J="repor")),"tudo em dia")',
    ],
  ]

  s.getRange(1, 1, linhas.length, 2).setValues(linhas)
  s.getRange(1, 1).setFontSize(16).setFontWeight('bold')
  s.getRange(10, 1).setFontWeight('bold')
  s.getRange(16, 1).setFontWeight('bold')
  s.getRange(4, 2, 3, 1).setNumberFormat('R$ #,##0.00')
  s.getRange(8, 2).setNumberFormat('R$ #,##0.00')
  s.getRange(17, 2).setWrap(true)
  s.setColumnWidth(1, 300)
  s.setColumnWidth(2, 380)
  s.setFrozenRows(0)
}
