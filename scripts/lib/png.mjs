/**
 * Decodificador de PNG em JavaScript puro.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE ESCREVER ISTO EM VEZ DE INSTALAR UMA BIBLIOTECA
 *
 * A conferência de contraste pintado precisa ler os pixels de uma captura do
 * Playwright. É a única coisa no projeto que precisa disso, e um decodificador
 * de PNG cabe em cem linhas porque o formato é simples: cabeçalho, blocos
 * `IDAT` colados, `inflate`, e desfazer cinco filtros de linha.
 *
 * O `node:zlib` já traz o `inflate`, que é a única parte difícil. Trazer uma
 * dependência de imagem para o resto seria pagar megabytes e uma cadeia de
 * atualizações por causa de um laço de subtração.
 *
 * Mesmo raciocínio do `webp.mjs`, que lê só o cabeçalho porque só precisa das
 * dimensões. Aqui precisamos dos pixels, então a conta é maior — mas continua
 * sendo a conta certa.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Cobre o que o Playwright gera: 8 bits por canal, sem entrelaçamento, em RGB
 * ou RGBA. Qualquer outra coisa levanta erro em vez de devolver lixo silencioso.
 */
import { inflateSync } from "node:zlib"

const ASSINATURA = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** Recupera o byte do pixel anterior na mesma linha, ou 0 antes do começo. */
function anterior(linha, i, canais) {
  return i >= canais ? linha[i - canais] : 0
}

/**
 * Desfaz o filtro de uma linha, no lugar.
 *
 * Cada linha do PNG vem prefixada por um byte que diz qual dos cinco filtros
 * foi aplicado. Todos são subtrações de vizinhos — desfazer é somar de volta, da
 * esquerda para a direita, porque cada byte depende do que já foi reconstruído.
 */
function desfiltrar(tipo, linha, acima, canais) {
  switch (tipo) {
    case 0: // nenhum
      break
    case 1: // Sub — vizinho da esquerda
      for (let i = 0; i < linha.length; i++) {
        linha[i] = (linha[i] + anterior(linha, i, canais)) & 0xff
      }
      break
    case 2: // Up — vizinho de cima
      for (let i = 0; i < linha.length; i++) {
        linha[i] = (linha[i] + acima[i]) & 0xff
      }
      break
    case 3: // Average — média dos dois
      for (let i = 0; i < linha.length; i++) {
        const media = (anterior(linha, i, canais) + acima[i]) >> 1
        linha[i] = (linha[i] + media) & 0xff
      }
      break
    case 4: {
      // Paeth — escolhe entre esquerda, cima e diagonal o mais perto da soma.
      for (let i = 0; i < linha.length; i++) {
        const a = anterior(linha, i, canais)
        const b = acima[i]
        const c = i >= canais ? acima[i - canais] : 0
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        const escolhido = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
        linha[i] = (linha[i] + escolhido) & 0xff
      }
      break
    }
    default:
      throw new Error(`filtro de linha desconhecido: ${tipo}`)
  }
}

/**
 * Lê um PNG e devolve os pixels em RGB, três bytes por pixel.
 *
 * O alfa é descartado de propósito: a captura de uma página é sempre opaca, e
 * carregar um quarto canal só para ignorá-lo depois complica a amostragem.
 */
export function lerPng(buffer) {
  if (!buffer.subarray(0, 8).equals(ASSINATURA)) {
    throw new Error("não é um arquivo PNG")
  }

  let largura = 0
  let altura = 0
  let canais = 0
  const pedacos = []

  let pos = 8
  while (pos < buffer.length) {
    const tamanho = buffer.readUInt32BE(pos)
    const tipo = buffer.toString("ascii", pos + 4, pos + 8)
    const dados = buffer.subarray(pos + 8, pos + 8 + tamanho)

    if (tipo === "IHDR") {
      largura = dados.readUInt32BE(0)
      altura = dados.readUInt32BE(4)
      const profundidade = dados[8]
      const corTipo = dados[9]
      const entrelacado = dados[12]
      if (profundidade !== 8) {
        throw new Error(`só sei ler 8 bits por canal, veio ${profundidade}`)
      }
      if (entrelacado !== 0) {
        throw new Error("PNG entrelaçado não é suportado")
      }
      if (corTipo === 2) canais = 3
      else if (corTipo === 6) canais = 4
      else throw new Error(`tipo de cor ${corTipo} não é suportado`)
    } else if (tipo === "IDAT") {
      // Os IDAT podem vir picados; o fluxo comprimido é a concatenação deles.
      pedacos.push(dados)
    } else if (tipo === "IEND") {
      break
    }

    pos += 12 + tamanho // tamanho + tipo(4) + dados + CRC(4)
  }

  if (!largura || !altura || !canais) throw new Error("PNG sem IHDR válido")

  const cru = inflateSync(Buffer.concat(pedacos))
  const bytesPorLinha = largura * canais
  const esperado = (bytesPorLinha + 1) * altura
  if (cru.length < esperado) {
    throw new Error(`PNG truncado: ${cru.length} bytes, esperava ${esperado}`)
  }

  const pixels = Buffer.alloc(largura * altura * 3)
  let acima = Buffer.alloc(bytesPorLinha)

  for (let y = 0; y < altura; y++) {
    const inicio = y * (bytesPorLinha + 1)
    const tipo = cru[inicio]
    const linha = Buffer.from(cru.subarray(inicio + 1, inicio + 1 + bytesPorLinha))
    desfiltrar(tipo, linha, acima, canais)

    for (let x = 0; x < largura; x++) {
      const de = x * canais
      const para = (y * largura + x) * 3
      pixels[para] = linha[de]
      pixels[para + 1] = linha[de + 1]
      pixels[para + 2] = linha[de + 2]
    }
    acima = linha
  }

  return { largura, altura, pixels }
}

/** Cor de um pixel, como `[r, g, b]`. */
export function pixel({ largura, pixels }, x, y) {
  const i = (y * largura + x) * 3
  return [pixels[i], pixels[i + 1], pixels[i + 2]]
}
