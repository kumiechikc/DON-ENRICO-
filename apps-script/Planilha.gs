/**
 * Acesso à planilha. Todo mundo que lê ou escreve célula passa por aqui.
 */

function planilha() {
  return SpreadsheetApp.getActive()
}

function aba(nome) {
  const s = planilha().getSheetByName(nome)
  if (!s) {
    throw new Error(
      'a aba "' + nome + '" não existe. Rode Don Enrico > Instalar / atualizar planilha.'
    )
  }
  return s
}

/**
 * Índice (base 1) da coluna pelo nome do cabeçalho.
 *
 * Procurar pelo nome, e não por uma letra fixa, é o que permite inserir uma
 * coluna nova no meio sem que todo o código passe a escrever no lugar errado —
 * silenciosamente, que é como esse tipo de erro costuma aparecer.
 */
function coluna(s, nome) {
  const cabecalho = s.getRange(1, 1, 1, s.getLastColumn()).getDisplayValues()[0]
  const i = cabecalho.indexOf(nome)
  if (i === -1) {
    throw new Error('coluna "' + nome + '" não encontrada na aba "' + s.getName() + '"')
  }
  return i + 1
}

/**
 * Última linha preenchida olhando UMA coluna.
 *
 * `getLastRow()` não serve aqui: as colunas calculadas (Total, Líquido) são
 * fórmulas de coluna inteira, e para o Sheets a coluna inteira está ocupada.
 * Usando `getLastRow()` o próximo pedido seria gravado na linha mil e tanto,
 * com um vão gigante no meio da planilha.
 */
function ultimaLinha(s, colunaChave) {
  const max = s.getMaxRows()
  if (max < 2) return 1
  const valores = s.getRange(2, colunaChave, max - 1, 1).getValues()
  for (let i = valores.length - 1; i >= 0; i--) {
    if (valores[i][0] !== '' && valores[i][0] !== null) return i + 2
  }
  return 1
}

/** Lê a aba inteira como lista de objetos com chave = nome do cabeçalho. */
function lerTabela(nome) {
  const s = aba(nome)
  const ultima = ultimaLinha(s, 1)
  if (ultima < 2) return []
  const largura = s.getLastColumn()
  const dados = s.getRange(1, 1, ultima, largura).getValues()
  const cabecalho = dados[0]
  const saida = []
  for (let i = 1; i < dados.length; i++) {
    const linha = { _linha: i + 1 }
    for (let j = 0; j < cabecalho.length; j++) linha[cabecalho[j]] = dados[i][j]
    saida.push(linha)
  }
  return saida
}

/** Acrescenta linhas ao fim, escrevendo tudo de uma vez. */
function acrescentar(nome, linhas) {
  if (linhas.length === 0) return
  const s = aba(nome)
  const inicio = ultimaLinha(s, 1) + 1
  s.getRange(inicio, 1, linhas.length, linhas[0].length).setValues(linhas)
}

/**
 * Trava a execução para que dois pedidos que cheguem juntos não escrevam na
 * mesma linha. Improvável no volume atual, mas o custo é uma linha de código e
 * o prejuízo seria um pedido apagando o outro sem deixar rastro.
 */
function comTrava(fn) {
  const trava = LockService.getScriptLock()
  trava.waitLock(20000)
  try {
    return fn()
  } finally {
    trava.releaseLock()
  }
}

function agora() {
  return new Date()
}

function fusoHorario() {
  return planilha().getSpreadsheetTimeZone() || 'America/Sao_Paulo'
}

function dataCurta(valor) {
  if (!valor) return ''
  return Utilities.formatDate(new Date(valor), fusoHorario(), 'dd/MM/yyyy')
}
