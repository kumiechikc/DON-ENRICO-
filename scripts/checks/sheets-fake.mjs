/**
 * Google Sheets de mentira, o suficiente para rodar o código da planilha aqui.
 *
 * Por que existe: metade do sistema em `apps-script/` só roda dentro do Google,
 * e é justamente a metade que mexe no estoque do sócio. Um erro em
 * `venderPedido_` não dá tela vermelha — dá saldo errado, que ninguém percebe
 * até a hora de fritar. Testar isso clicando na planilha significa testar com
 * dado de verdade, e o único jeito de saber que quebrou é o prejuízo.
 *
 * O que a imitação faz: guarda células, lê e escreve intervalos, apaga linha.
 * O que ela NÃO faz: calcular fórmula. A única exceção é o cabeçalho de uma
 * fórmula de matriz — o `IF(ROW=1,"Título",...)` é resolvido, porque o código
 * acha coluna pelo nome do cabeçalho e sem isso nada roda. Onde um teste
 * depende de valor calculado (Unidades, Total), ele semeia o valor que o Sheets
 * teria produzido, e isso está dito no teste.
 */

function vazio() {
  return ""
}

class FakeRange {
  constructor(sheet, linha, coluna, nLinhas, nColunas) {
    this.sheet = sheet
    this.linha = linha
    this.coluna = coluna
    this.nLinhas = nLinhas
    this.nColunas = nColunas
  }

  getRow() {
    return this.linha
  }

  getColumn() {
    return this.coluna
  }

  getNumRows() {
    return this.nLinhas
  }

  getSheet() {
    return this.sheet
  }

  getValues() {
    const saida = []
    for (let i = 0; i < this.nLinhas; i++) {
      const linha = []
      for (let j = 0; j < this.nColunas; j++) {
        linha.push(this.sheet._ler(this.linha + i, this.coluna + j))
      }
      saida.push(linha)
    }
    return saida
  }

  getDisplayValues() {
    return this.getValues().map((linha) => linha.map((v) => (v === null ? "" : String(v))))
  }

  getValue() {
    return this.sheet._ler(this.linha, this.coluna)
  }

  setValues(matriz) {
    for (let i = 0; i < matriz.length; i++) {
      for (let j = 0; j < matriz[i].length; j++) {
        this.sheet._escrever(this.linha + i, this.coluna + j, matriz[i][j])
      }
    }
    return this
  }

  setValue(valor) {
    this.sheet._escrever(this.linha, this.coluna, valor)
    return this
  }

  /**
   * Guarda a fórmula e resolve só o cabeçalho.
   *
   * As colunas calculadas do sistema são uma fórmula de matriz na linha 1 que
   * escreve o próprio título. É esse título que `coluna()` procura; sem
   * resolvê-lo, toda função que escreve na planilha morreria aqui.
   */
  setFormula(formula) {
    const titulo = String(formula).match(/IF\(ROW\(\$A:\$A\)=1,"([^"]+)"/)
    this.sheet._escrever(this.linha, this.coluna, titulo ? titulo[1] : formula)
    this.sheet._formulas.set(`${this.linha}:${this.coluna}`, formula)
    return this
  }

  clearContent() {
    for (let i = 0; i < this.nLinhas; i++) {
      for (let j = 0; j < this.nColunas; j++) {
        this.sheet._escrever(this.linha + i, this.coluna + j, vazio())
      }
    }
    return this
  }

  /* Aparência não muda comportamento: tudo abaixo é encadeável e não faz nada. */
  setFontWeight() {
    return this
  }
  setBackground() {
    return this
  }
  setFontColor() {
    return this
  }
  setFontSize() {
    return this
  }
  setNumberFormat() {
    return this
  }
  setDataValidation() {
    return this
  }
  setWrap() {
    return this
  }
  insertCheckboxes() {
    return this
  }
}

class FakeSheet {
  constructor(nome) {
    this.nome = nome
    this._celulas = new Map()
    this._formulas = new Map()
    this._maxLinhas = 1000
    this._maxColunas = 26
    this._ativo = null
  }

  _chave(linha, coluna) {
    return `${linha}:${coluna}`
  }

  _ler(linha, coluna) {
    const v = this._celulas.get(this._chave(linha, coluna))
    return v === undefined ? vazio() : v
  }

  _escrever(linha, coluna, valor) {
    this._celulas.set(this._chave(linha, coluna), valor === undefined ? vazio() : valor)
  }

  getName() {
    return this.nome
  }
  getMaxRows() {
    return this._maxLinhas
  }
  getMaxColumns() {
    return this._maxColunas
  }

  getLastRow() {
    let maior = 0
    for (const chave of this._celulas.keys()) {
      const [linha] = chave.split(":").map(Number)
      if (this._celulas.get(chave) !== "" && linha > maior) maior = linha
    }
    return maior
  }

  getLastColumn() {
    let maior = 0
    for (const chave of this._celulas.keys()) {
      const [, coluna] = chave.split(":").map(Number)
      if (this._celulas.get(chave) !== "" && coluna > maior) maior = coluna
    }
    return maior
  }

  getRange(linha, coluna, nLinhas, nColunas) {
    return new FakeRange(this, linha, coluna, nLinhas || 1, nColunas || 1)
  }

  /**
   * Apagar linha desloca tudo que está abaixo para cima.
   *
   * É o comportamento que faz apagar de cima para baixo corromper dado — e é
   * exatamente por isso que ele está imitado aqui em vez de virar um no-op.
   */
  deleteRow(alvo) {
    const novas = new Map()
    for (const [chave, valor] of this._celulas) {
      const [linha, coluna] = chave.split(":").map(Number)
      if (linha === alvo) continue
      const destino = linha > alvo ? linha - 1 : linha
      novas.set(`${destino}:${coluna}`, valor)
    }
    this._celulas = novas
  }

  insertColumnsAfter(_depois, quantas) {
    this._maxColunas += quantas
    return this
  }

  setFrozenRows() {
    return this
  }
  autoResizeColumns() {
    return this
  }
  setColumnWidth() {
    return this
  }
  setConditionalFormatRules() {
    return this
  }
  clear() {
    this._celulas.clear()
    this._formulas.clear()
    return this
  }
  setActiveRange(range) {
    this._ativo = range
    return range
  }
  getActiveRange() {
    return this._ativo
  }
}

class FakeSpreadsheet {
  constructor() {
    this.abas = []
    this.ativa = null
    this.avisos = []
  }

  getSheetByName(nome) {
    return this.abas.find((s) => s.getName() === nome) || null
  }

  insertSheet(nome) {
    const s = new FakeSheet(nome)
    this.abas.push(s)
    return s
  }

  getSheets() {
    return this.abas.slice()
  }

  deleteSheet(alvo) {
    this.abas = this.abas.filter((s) => s !== alvo)
  }

  setActiveSheet(s) {
    this.ativa = s
    return s
  }

  getActiveSheet() {
    return this.ativa || this.abas[0]
  }

  moveActiveSheet(posicao) {
    const s = this.ativa
    if (!s) return
    this.abas = this.abas.filter((x) => x !== s)
    this.abas.splice(posicao - 1, 0, s)
  }

  getSpreadsheetTimeZone() {
    return "America/Sao_Paulo"
  }

  /* Os avisos ficam guardados: vários deles são a forma de o sistema dizer que
     algo não pôde ser baixado sozinho, e isso é comportamento a verificar. */
  toast(mensagem, titulo) {
    this.avisos.push({ titulo, mensagem })
  }
}

const encadeavel = () => {
  const alvo = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "build") return () => ({})
        return () => alvo
      },
    }
  )
  return alvo
}

/** Monta o ambiente global que os arquivos .gs esperam encontrar. */
export function ambienteFake() {
  const ss = new FakeSpreadsheet()
  const propriedades = new Map()
  const alertas = []

  return {
    planilha: ss,
    alertas,
    globais: {
      console,
      SpreadsheetApp: {
        getActive: () => ss,
        getActiveSpreadsheet: () => ss,
        getUi: () => ({
          createMenu: () => encadeavel(),
          alert: (a, b) => alertas.push(b === undefined ? a : `${a}: ${b}`),
          ButtonSet: { OK: "OK" },
        }),
        newDataValidation: () => encadeavel(),
        newConditionalFormatRule: () => encadeavel(),
      },
      LockService: {
        getScriptLock: () => ({ waitLock() {}, releaseLock() {} }),
      },
      Utilities: {
        formatDate: (data) => new Date(data).toISOString().slice(0, 10),
        getUuid: () => "00000000-0000-0000-0000-000000000000",
      },
      PropertiesService: {
        getScriptProperties: () => ({
          getProperty: (k) => (propriedades.has(k) ? propriedades.get(k) : null),
          setProperty: (k, v) => propriedades.set(k, v),
        }),
      },
      ContentService: {
        MimeType: { JSON: "application/json" },
        createTextOutput: (texto) => ({
          setMimeType: () => ({ getContent: () => texto }),
          getContent: () => texto,
        }),
      },
    },
  }
}
