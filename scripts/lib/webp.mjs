/**
 * Mede um WebP lendo o cabeçalho do arquivo, sem ffmpeg.
 *
 * A conferência das sequências precisa da largura REAL da tira: é ela que diz
 * se `quadros × largura` fecha, e é justamente esse número que o manifesto pode
 * mentir. Ler pelo manifesto seria conferir a anotação contra ela mesma.
 *
 * Por que não usar o ffmpeg aqui, se o `preparar-sequencia.mjs` já usa: porque
 * `npm run check:midia` roda em CI e no commit, e o ffmpeg não é dependência do
 * projeto (são ~70 MB para quem só quer conferir um número). O cabeçalho do
 * WebP tem 30 bytes e três formatos possíveis; ler os três é mais barato que
 * arrastar o codec inteiro.
 *
 * Formato: RIFF….WEBP seguido de um chunk que diz qual das três variantes é.
 * https://developers.google.com/speed/webp/docs/riff_container
 */
import { openSync, readSync, closeSync } from "node:fs"

function cabecalho(caminho, bytes = 32) {
  const buf = Buffer.alloc(bytes)
  const fd = openSync(caminho, "r")
  try {
    readSync(fd, buf, 0, bytes, 0)
  } finally {
    closeSync(fd)
  }
  return buf
}

export function medirWebp(caminho) {
  const b = cabecalho(caminho)

  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`${caminho} não é um arquivo WebP`)
  }

  const tipo = b.toString("ascii", 12, 16)

  // Estendido (com alfa, animação ou metadados): a medida é o tamanho da tela.
  if (tipo === "VP8X") {
    return {
      largura: (b.readUIntLE(24, 3) & 0xffffff) + 1,
      altura: (b.readUIntLE(27, 3) & 0xffffff) + 1,
    }
  }

  // Com perda: código de início 9d 01 2a e então dois inteiros de 14 bits.
  if (tipo === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) {
      throw new Error(`${caminho}: quadro VP8 com código de início inesperado`)
    }
    return {
      largura: b.readUInt16LE(26) & 0x3fff,
      altura: b.readUInt16LE(28) & 0x3fff,
    }
  }

  // Sem perda: assinatura 0x2f e quatro bytes com 14 + 14 bits empacotados.
  if (tipo === "VP8L") {
    if (b[20] !== 0x2f) {
      throw new Error(`${caminho}: quadro VP8L com assinatura inesperada`)
    }
    const bits = b.readUInt32LE(21)
    return {
      largura: (bits & 0x3fff) + 1,
      altura: ((bits >> 14) & 0x3fff) + 1,
    }
  }

  throw new Error(`${caminho}: chunk "${tipo}" não reconhecido`)
}
