/**
 * Descoberta do ffmpeg, compartilhada pelas ferramentas de mídia.
 *
 * O `ffmpeg-static` não é dependência do projeto de propósito: são ~70 MB que só
 * quem for preparar mídia precisa ter, e isso acontece poucas vezes por ano.
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export function acharFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" })
    return "ffmpeg"
  } catch {
    // segue para o estático
  }
  const estatico = join(raiz, "node_modules", "ffmpeg-static", "ffmpeg")
  if (existsSync(estatico)) return estatico

  throw new Error(
    "ffmpeg não encontrado.\n" +
      "  Instale no sistema (apt install ffmpeg / brew install ffmpeg)\n" +
      "  ou rode: npm i -D ffmpeg-static"
  )
}

/** Roda o ffmpeg em silêncio, deixando passar só o que for erro de verdade. */
export function rodarFfmpeg(ffmpeg, argumentos) {
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...argumentos], {
    stdio: ["ignore", "inherit", "inherit"],
  })
}

/**
 * Mede a imagem ou o vídeo.
 *
 * O `ffmpeg-static` não traz o `ffprobe`, então a medida sai do relatório que o
 * próprio ffmpeg imprime no stderr ao abrir o arquivo. Feio, mas é a informação
 * mais confiável disponível — e sem ela não dá para recortar quadro nenhum.
 */
export function medirImagem(ffmpeg, caminho) {
  let saida = ""
  try {
    execFileSync(ffmpeg, ["-hide_banner", "-i", caminho], { stdio: "pipe" })
  } catch (erro) {
    // O ffmpeg sai com erro quando não há saída definida; o relatório vem junto.
    saida = String(erro.stderr || "")
  }
  const achado = saida.match(/Stream #\d+:\d+.*?,\s(\d+)x(\d+)/)
  if (!achado) throw new Error(`não consegui medir ${caminho}`)
  return { largura: Number(achado[1]), altura: Number(achado[2]) }
}

/**
 * Duração do arquivo, em segundos.
 *
 * Sai do mesmo relatório de stderr que a medida de tamanho, pela mesma razão:
 * o `ffmpeg-static` não traz o `ffprobe`.
 */
export function medirDuracao(ffmpeg, caminho) {
  let saida = ""
  try {
    execFileSync(ffmpeg, ["-hide_banner", "-i", caminho], { stdio: "pipe" })
  } catch (erro) {
    saida = String(erro.stderr || "")
  }
  const achado = saida.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/)
  if (!achado) throw new Error(`não consegui medir a duração de ${caminho}`)
  return Number(achado[1]) * 3600 + Number(achado[2]) * 60 + Number(achado[3])
}
