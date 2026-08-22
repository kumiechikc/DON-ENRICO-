#!/usr/bin/env node
/**
 * Transforma o arquivo que sai do Flow/Veo nos três arquivos que o site usa.
 *
 *   node scripts/comprimir-clipe.mjs <entrada.mp4> <nome> [opções]
 *
 * Opções:
 *   --secao        usa o orçamento de clipe de seção (350 KB) e não o do hero
 *   --de <s>       corta a entrada: começa neste segundo
 *   --ate <s>      corta a saída: termina neste segundo
 *   --crf <n>      qualidade do VP9 (padrão 40); o H.264 acompanha 10 abaixo
 *
 * Exemplo:
 *   node scripts/comprimir-clipe.mjs ~/Downloads/veo-lampada.mp4 lampada
 *   node scripts/comprimir-clipe.mjs ~/Downloads/veo-corte.mp4 corte --secao \
 *     --de 2.5 --ate 6.5 --crf 42
 *
 * Gera em public/cinema/:
 *   <nome>.webm         VP9, o arquivo que quase todo mundo vai baixar
 *   <nome>.mp4          H.264, para quem não tem VP9
 *   <nome>-poster.webp  o primeiro quadro, que é o LCP da seção
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A descoberta que define as receitas abaixo: GRÃO DE FILME É O INIMIGO.
 *
 * Medido aqui, mesma cena de 6s a 1280x720, só mudando o grão:
 *
 *              com grão      sem grão
 *   VP9/WebM    5.096 KB        64 KB
 *   H.264/MP4     176 KB       152 KB
 *
 * Oitenta vezes. Grão é ruído aleatório que muda a cada quadro por definição,
 * então o codec não tem o que reaproveitar entre um quadro e outro — some com a
 * compressão temporal inteira, que é de onde vem toda a economia de vídeo.
 *
 * Por isso o prompt pede imagem limpa, e o grão entra depois pela camada
 * `.grain` do globals.css, que já cobre a página inteira e custa zero byte.
 *
 * Este script não detecta grão — ele mede o resultado. Quando o arquivo estoura
 * o orçamento, o aviso aponta o grão primeiro porque é a causa quase sempre.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { existsSync, mkdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, resolve } from "node:path"
import { acharFfmpeg, rodarFfmpeg } from "./lib/ffmpeg.mjs"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const destino = join(raiz, "public", "cinema")

/*
 * Orçamento por arquivo.
 *
 * O hero ganha mais porque é o único que quase todo visitante vai baixar; os
 * loops de seção só carregam quando a seção entra na tela, e são vários.
 */
const ORCAMENTO_KB = { hero: 600, secao: 350 }

const args = process.argv.slice(2)
const entrada = args[0]
const nome = args[1]
const ehSecao = args.includes("--secao")

/** Lê `--chave valor` e devolve número, ou `undefined` se a chave não veio. */
function opcaoNumero(chave) {
  const i = args.indexOf(chave)
  if (i === -1) return undefined
  const valor = Number(args[i + 1])
  if (!Number.isFinite(valor)) {
    process.stderr.write(`${chave} precisa de um número: ${chave} 2.5\n`)
    process.exit(1)
  }
  return valor
}

const de = opcaoNumero("--de")
const ate = opcaoNumero("--ate")
/*
 * Um botão só de qualidade. O H.264 fica dez pontos abaixo porque é a distância
 * que dá peso parecido nos dois codecs — a relação dos padrões (40 e 30), agora
 * mantida quando o número muda.
 */
const crfVp9 = opcaoNumero("--crf") ?? 40
const crfH264 = crfVp9 - 10

if (!entrada || !nome) {
  process.stderr.write(
    "uso: node scripts/comprimir-clipe.mjs <entrada.mp4> <nome> " +
      "[--secao] [--de <s>] [--ate <s>] [--crf <n>]\n"
  )
  process.exit(1)
}
if (de !== undefined && ate !== undefined && ate <= de) {
  process.stderr.write(`--ate (${ate}) precisa ser maior que --de (${de})\n`)
  process.exit(1)
}
if (!existsSync(entrada)) {
  process.stderr.write(`não achei o arquivo: ${entrada}\n`)
  process.exit(1)
}

const ffmpeg = acharFfmpeg()
mkdirSync(destino, { recursive: true })

const rodar = (argumentos) => rodarFfmpeg(ffmpeg, argumentos)

const kb = (caminho) => statSync(caminho).size / 1024

const saidaWebm = join(destino, `${nome}.webm`)
const saidaMp4 = join(destino, `${nome}.mp4`)
const saidaPoster = join(destino, `${nome}-poster.webp`)

/*
 * `-an` tira o áudio: o navegador bloqueia autoplay com som, então a trilha
 * seria peso morto que nunca toca.
 *
 * `fps=24` corta um terço do peso. Num loop de fundo ninguém enxerga a
 * diferença para 30, e o codec agradece.
 *
 * `scale=1280:-2` entrega em 1280 de largura. O `-2` mantém a proporção e
 * garante altura par, que o H.264 exige.
 */
const filtro = "scale=1280:-2,fps=24"

/*
 * O recorte vai ANTES do `-i`. Assim o ffmpeg pula direto para o ponto pedido
 * em vez de decodificar o trecho descartado — e os três arquivos saem do mesmo
 * pedaço, inclusive o pôster, que é o primeiro quadro DO CLIPE e não do
 * arquivo original.
 */
const recorte = []
if (de !== undefined) recorte.push("-ss", String(de))
if (ate !== undefined) recorte.push("-t", String(ate - (de ?? 0)))

const trecho =
  de === undefined && ate === undefined
    ? "inteiro"
    : `${de ?? 0}s a ${ate ?? "fim"}${ate === undefined ? "" : "s"}`

process.stdout.write(`\nComprimindo ${resolve(entrada)}\n`)
process.stdout.write(`  origem: ${kb(entrada).toFixed(0)} KB\n`)
process.stdout.write(`  trecho: ${trecho}, CRF ${crfVp9}/${crfH264}\n\n`)

process.stdout.write("  VP9/WebM ... ")
let t = Date.now()
rodar([
  ...recorte,
  "-i", entrada,
  "-an",
  "-c:v", "libvpx-vp9",
  "-crf", String(crfVp9),
  "-b:v", "0",
  "-row-mt", "1",
  "-deadline", "good",
  "-cpu-used", "3",
  "-vf", filtro,
  saidaWebm,
])
process.stdout.write(`${kb(saidaWebm).toFixed(0)} KB (${((Date.now() - t) / 1000).toFixed(0)}s)\n`)

process.stdout.write("  H.264/MP4 .. ")
t = Date.now()
rodar([
  ...recorte,
  "-i", entrada,
  "-an",
  "-c:v", "libx264",
  "-crf", String(crfH264),
  "-preset", "slow",
  "-vf", filtro,
  // Sem faststart o navegador precisa baixar o arquivo inteiro antes do
  // primeiro quadro, porque o índice fica no fim.
  "-movflags", "+faststart",
  saidaMp4,
])
process.stdout.write(`${kb(saidaMp4).toFixed(0)} KB (${((Date.now() - t) / 1000).toFixed(0)}s)\n`)

process.stdout.write("  poster ..... ")
rodar([
  ...recorte,
  "-i", entrada,
  "-vf", "select=eq(n\\,0),scale=1280:-2",
  "-vframes", "1",
  "-c:v", "libwebp",
  "-quality", "82",
  saidaPoster,
])
process.stdout.write(`${kb(saidaPoster).toFixed(0)} KB\n`)

/* ─────────────────────────────── veredicto ──────────────────────────── */

const limite = ehSecao ? ORCAMENTO_KB.secao : ORCAMENTO_KB.hero
const maior = Math.max(kb(saidaWebm), kb(saidaMp4))

process.stdout.write(`\n  orçamento: ${limite} KB (${ehSecao ? "seção" : "hero"})\n`)

if (maior > limite) {
  process.stdout.write(
    `\n  ✗ ${maior.toFixed(0)} KB passou do orçamento.\n\n` +
      "  Na ordem, o que tentar:\n" +
      "  1. O clipe veio com grão? É a causa em 9 de 10 casos. Gere de novo\n" +
      "     pedindo 'clean digital image, no film grain, no noise'.\n" +
      "  2. Corte a duração: --de 2.5 --ate 6.5. Quase sempre é a metade\n" +
      "     que não tem ação nenhuma que está pagando a conta.\n" +
      "  3. Suba o CRF: --crf 44. Antes de baixar a resolução — numa cena\n" +
      "     escura a perda quase não aparece.\n"
  )
  process.exit(1)
}

process.stdout.write(`  ✓ dentro do orçamento\n\n`)
process.stdout.write(
  `  Agora registre o clipe em src/lib/media/clipes.ts para ele entrar no site.\n\n`
)
