#!/usr/bin/env node
/**
 * Transforma uma tira de quadros numa sprite sheet com largura exata.
 *
 *   npm run sequencia -- <tira.png> <nome> <quantidade de quadros>
 *
 * Exemplo:
 *   npm run sequencia -- ~/Downloads/coxinha-tira.png corte 5
 *
 * Gera `public/cinema/<nome>.webp` e imprime a entrada pronta do manifesto.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE RECORTAR E REMONTAR EM VEZ DE USAR A TIRA COMO ELA VEIO
 *
 * A animação avança por `background-position`, que dá passos de tamanho fixo.
 * Isso só funciona se todos os quadros tiverem exatamente a mesma largura.
 *
 * A primeira tira que chegou aqui tinha 1376 px para 5 quadros, e
 * 1376 ÷ 5 = 275,2. Sem número inteiro, cada passo desalinha um pouco mais que
 * o anterior, e no último quadro aparece uma fatia do vizinho. O defeito é
 * discreto o suficiente para passar despercebido em revisão e óbvio o
 * suficiente para estragar a peça.
 *
 * Então: cada quadro é recortado na sua posição real (arredondada) com uma
 * largura única, e a tira é remontada. O resultado tem largura garantidamente
 * divisível — não "provavelmente divisível".
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { mkdirSync, existsSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, resolve } from "node:path"
import { acharFfmpeg, rodarFfmpeg, medirImagem } from "./lib/ffmpeg.mjs"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const destino = join(raiz, "public", "cinema")

/** Uma sequência é uma imagem só; o teto é bem mais apertado que o de vídeo. */
const ORCAMENTO_KB = 250

const [entrada, nome, quadrosArg] = process.argv.slice(2)
const quadros = Number(quadrosArg)

if (!entrada || !nome || !Number.isInteger(quadros) || quadros < 2) {
  process.stderr.write(
    "uso: npm run sequencia -- <tira.png> <nome> <quantidade de quadros>\n" +
      "  ex: npm run sequencia -- coxinha.png corte 5\n"
  )
  process.exit(1)
}
if (!existsSync(entrada)) {
  process.stderr.write(`não achei o arquivo: ${entrada}\n`)
  process.exit(1)
}

const ffmpeg = acharFfmpeg()
mkdirSync(destino, { recursive: true })

const origem = medirImagem(ffmpeg, entrada)
const larguraQuadro = Math.floor(origem.largura / quadros)
const sobra = origem.largura - larguraQuadro * quadros

process.stdout.write(`\nPreparando ${resolve(entrada)}\n`)
process.stdout.write(`  origem: ${origem.largura}×${origem.altura}\n`)
process.stdout.write(`  ${quadros} quadros de ${larguraQuadro} px`)
process.stdout.write(
  sobra === 0
    ? " (divide exato)\n\n"
    : ` (sobravam ${sobra} px, recortados)\n\n`
)

if (larguraQuadro < 120) {
  process.stderr.write(
    `  ✗ quadro de ${larguraQuadro} px é estreito demais para virar peça de página.\n` +
      "    Gere a tira maior, ou confira se a quantidade de quadros está certa.\n"
  )
  process.exit(1)
}

/*
 * Um passe só: recorta os N quadros na posição real de cada painel e empilha
 * lado a lado. `Math.round` na posição mantém cada quadro centrado no painel
 * original mesmo quando a divisão não fecha; a largura fixa é o que garante o
 * passo constante depois.
 */
const cortes = []
const rotulos = []
for (let i = 0; i < quadros; i++) {
  const x = Math.round((i * origem.largura) / quadros)
  // Não deixa o último corte passar da borda quando houve arredondamento.
  const xSeguro = Math.min(x, origem.largura - larguraQuadro)
  cortes.push(`[0:v]crop=${larguraQuadro}:${origem.altura}:${xSeguro}:0[q${i}]`)
  rotulos.push(`[q${i}]`)
}

const saida = join(destino, `${nome}.webp`)

rodarFfmpeg(ffmpeg, [
  "-i", entrada,
  "-filter_complex",
  `${cortes.join(";")};${rotulos.join("")}hstack=inputs=${quadros}[saida]`,
  "-map", "[saida]",
  "-c:v", "libwebp",
  "-quality", "80",
  "-compression_level", "6",
  saida,
])

const final = medirImagem(ffmpeg, saida)
const kb = statSync(saida).size / 1024

process.stdout.write(`  ${nome}.webp: ${final.largura}×${final.altura}, ${kb.toFixed(0)} KB\n`)

/*
 * A conferência que justifica a ferramenta inteira. Se isto falhar, o recorte
 * saiu errado e a animação vai derrapar — melhor descobrir agora do que na
 * página.
 */
if (final.largura !== larguraQuadro * quadros) {
  process.stderr.write(
    `\n  ✗ a tira final tem ${final.largura} px, mas ${quadros} quadros de ` +
      `${larguraQuadro} px dariam ${larguraQuadro * quadros}.\n` +
      "    Não use este arquivo: os quadros vão desalinhar.\n"
  )
  process.exit(1)
}
process.stdout.write(`  ✓ ${quadros} × ${larguraQuadro} = ${final.largura}, confere\n`)

if (kb > ORCAMENTO_KB) {
  process.stderr.write(
    `\n  ✗ ${kb.toFixed(0)} KB passou do orçamento de ${ORCAMENTO_KB} KB.\n\n` +
      "  Na ordem, o que tentar:\n" +
      "  1. Baixar a resolução da tira antes de passar por aqui.\n" +
      "  2. Menos quadros: a animação é por scroll, e 4 posições já contam a\n" +
      "     história tão bem quanto 6.\n" +
      "  3. Baixar a qualidade do WebP (-quality 70) — em cena escura a perda\n" +
      "     quase não aparece.\n"
  )
  process.exit(1)
}
process.stdout.write(`  ✓ dentro do orçamento de ${ORCAMENTO_KB} KB\n`)

process.stdout.write(
  `\n  Entrada para src/lib/media/sequencias.ts:\n\n` +
    `    {\n` +
    `      id: "${nome}",\n` +
    `      quadros: ${quadros},\n` +
    `      largura: ${larguraQuadro},\n` +
    `      altura: ${final.altura},\n` +
    `      descricao: "descreva a cena para quem não enxerga",\n` +
    `    },\n\n`
)
