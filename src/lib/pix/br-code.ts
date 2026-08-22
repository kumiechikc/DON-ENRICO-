/**
 * Gera o "copia e cola" do Pix, que é o mesmo texto que vira o QR Code.
 *
 * O formato é o BR Code do Banco Central, que segue o padrão EMV® QRCPS-MPM:
 * uma sequência de campos `ID + tamanho + valor`, onde o tamanho tem sempre dois
 * dígitos. Alguns campos são templates e carregam outros campos dentro.
 *
 * Está aqui, escrito à mão e sem dependência, por dois motivos:
 *
 * 1. São ~120 linhas de montagem de string. Trazer uma biblioteca para isso
 *    custaria mais bytes no navegador do que o código inteiro.
 * 2. É verificável de ponta a ponta sem depender de nada externo: o CRC tem um
 *    valor de conferência conhecido, e o resultado pode ser lido de volta campo
 *    a campo. Ver `scripts/check-pix.mjs`.
 *
 * O que NÃO está aqui: a chave, o nome e a cidade. Eles vêm do dono, e enquanto
 * não chegarem não existe Pix nenhum no site.
 */

export interface DadosPix {
  /** A chave: CPF, CNPJ, celular (+55...), e-mail ou aleatória. */
  chave: string
  /** Nome do recebedor. O padrão corta em 25 caracteres. */
  nome: string
  /** Cidade do recebedor. O padrão corta em 15 caracteres. */
  cidade: string
  /**
   * Valor em reais. Omitido, o pagador digita quanto quer.
   *
   * Vale fixar sempre que der: valor digitado à mão é onde entra o erro de
   * centavo, e conferir comprovante com valor errado é trabalho manual do dono.
   */
  valor?: number
  /**
   * Identificador do pagamento, até 25 caracteres. Aqui entra o código curto do
   * pedido, que é o que liga o comprovante à linha da planilha.
   */
  identificador?: string
}

/*
 * IDs do padrão. Nomeados porque `'26'` solto no meio do código não diz nada, e
 * quem for mexer nisso daqui a um ano vai precisar do manual do BCB do lado.
 */
const ID = {
  formato: '00',
  iniciacao: '01',
  contaMerchant: '26',
  categoria: '52',
  moeda: '53',
  valor: '54',
  pais: '58',
  nome: '59',
  cidade: '60',
  adicional: '62',
  crc: '63',
} as const

const GUI_PIX = 'br.gov.bcb.pix'
const MOEDA_REAL = '986'
const CATEGORIA_NAO_INFORMADA = '0000'
const PAIS = 'BR'

/** Monta um campo: id + tamanho em dois dígitos + valor. */
function campo(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, '0') + valor
}

/**
 * Reduz o texto ao que o padrão aceita com segurança.
 *
 * Acento e cedilha passam por leitores diferentes de formas diferentes, e o
 * nome do recebedor é o que o pagador vê antes de confirmar. Um nome quebrado
 * na tela do banco é motivo para a pessoa desistir do pagamento.
 */
function sanear(texto: string, limite: number): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, limite)
}

/**
 * CRC-16/CCITT-FALSE: polinômio 0x1021, valor inicial 0xFFFF, sem espelhamento
 * e sem XOR final. É o que o padrão exige, e é a variante cujo valor de
 * conferência para "123456789" é 0x29B1 — usado no teste.
 */
export function crc16(texto: string): string {
  let crc = 0xffff
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function gerarBrCode(dados: DadosPix): string {
  const chave = dados.chave.trim()
  if (chave === '') throw new Error('Pix sem chave')

  const conta = campo('00', GUI_PIX) + campo('01', chave)

  /*
   * O identificador vai no campo 05 do template de dados adicionais. Quando não
   * há, o padrão manda escrever "***" em vez de deixar vazio.
   */
  const referencia = dados.identificador
    ? sanear(dados.identificador, 25)
    : '***'

  const partes = [
    campo(ID.formato, '01'),
    /*
     * "12" marca o código como de uso único. É o certo quando ele carrega valor
     * e identificador de um pedido específico: reaproveitar um QR de outro
     * pedido faria dois pagamentos caírem com o mesmo identificador, e aí não
     * dá mais para saber qual comprovante é de qual encomenda.
     */
    campo(ID.iniciacao, '12'),
    campo(ID.contaMerchant, conta),
    campo(ID.categoria, CATEGORIA_NAO_INFORMADA),
    campo(ID.moeda, MOEDA_REAL),
  ]

  if (typeof dados.valor === 'number' && dados.valor > 0) {
    // Ponto como separador e sempre dois decimais: é o que o padrão aceita,
    // independente de a máquina estar em português.
    partes.push(campo(ID.valor, dados.valor.toFixed(2)))
  }

  partes.push(
    campo(ID.pais, PAIS),
    campo(ID.nome, sanear(dados.nome, 25)),
    campo(ID.cidade, sanear(dados.cidade, 15)),
    campo(ID.adicional, campo('05', referencia))
  )

  /*
   * O CRC é calculado sobre a mensagem inteira JÁ COM "6304" no fim. É a
   * pegadinha do padrão: o campo entra no cálculo do próprio checksum, com o
   * lugar do valor ainda por preencher.
   */
  const semCrc = partes.join('') + ID.crc + '04'
  return semCrc + crc16(semCrc)
}

/**
 * Lê um BR Code de volta em campos. Serve para verificação e para depurar.
 *
 * Existe porque conferir uma string de 150 caracteres a olho não é conferência.
 * Um código com o tamanho de um campo errado continua parecendo um Pix válido,
 * e o erro só aparece quando um cliente tenta pagar.
 */
export function lerBrCode(codigo: string): Record<string, string> {
  const campos: Record<string, string> = {}
  let i = 0
  while (i < codigo.length) {
    const id = codigo.slice(i, i + 2)
    const tamanho = Number(codigo.slice(i + 2, i + 4))
    if (!Number.isInteger(tamanho) || tamanho < 0) {
      throw new Error(`tamanho inválido no campo ${id}`)
    }
    const valor = codigo.slice(i + 4, i + 4 + tamanho)
    if (valor.length !== tamanho) {
      throw new Error(`campo ${id} promete ${tamanho} caracteres e entrega ${valor.length}`)
    }
    campos[id] = valor
    i += 4 + tamanho
  }
  return campos
}

/** Confere se o CRC no fim do código bate com o conteúdo. */
export function brCodeValido(codigo: string): boolean {
  if (codigo.length < 8) return false
  const corpo = codigo.slice(0, -4)
  const informado = codigo.slice(-4)
  return corpo.endsWith(ID.crc + '04') && crc16(corpo) === informado
}
