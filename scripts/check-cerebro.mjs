/**
 * Confere a estrutura do cérebro em cerebro/.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE UMA CONFERÊNCIA PARA ARQUIVOS DE TEXTO
 *
 * Um cérebro desatualizado é pior que nenhum: ele mente com cara de autoridade.
 * E o jeito mais comum de ele apodrecer não é ficar velho, é ficar frouxo — um
 * fato entra sem fonte, uma decisão entra sem data, uma pergunta entra sem dizer
 * o que ela destrava. Cada um desses parece inofensivo sozinho e some dentro do
 * arquivo.
 *
 * Isto não julga o conteúdo, nem tenta. Só cobra a forma que faz o conteúdo ser
 * confiável:
 *
 *   1. o índice não aponta para arquivo que não existe;
 *   2. todo fato do NEGOCIO.md tem fonte — é a regra de "nunca inventar dado de
 *      negócio" virando máquina em vez de boa intenção;
 *   3. toda decisão e todo beco têm data, senão não dá para saber o que é atual;
 *   4. todo item travado diz o que destrava, senão vira lista de desejos.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const RAIZ = join(import.meta.dirname, "..")
const DIR = join(RAIZ, "cerebro")

const falhas = []
const notas = []

function ler(nome) {
  const caminho = join(DIR, nome)
  if (!existsSync(caminho)) {
    falhas.push(`falta o arquivo cerebro/${nome}`)
    return null
  }
  return readFileSync(caminho, "utf8")
}

/* 1. O índice aponta para arquivos que existem. */
const indice = ler("LEIA-PRIMEIRO.md")
if (indice) {
  const alvos = [...indice.matchAll(/\]\(([A-Z\-]+\.md)\)/g)].map((m) => m[1])
  const unicos = [...new Set(alvos)]
  for (const alvo of unicos) {
    if (!existsSync(join(DIR, alvo))) {
      falhas.push(`LEIA-PRIMEIRO.md aponta para cerebro/${alvo}, que não existe`)
    }
  }
  notas.push(`índice aponta para ${unicos.length} arquivo(s), todos presentes`)
}

/*
 * 2. Todo fato tem fonte.
 *
 * Só as tabelas que TÊM coluna "Fonte" são cobradas: o arquivo também usa tabela
 * para outras coisas (onde cada foto está, por exemplo), e exigir fonte ali seria
 * ruído. A coluna precisa existir, estar preenchida, e não ser um marcador de
 * pendência disfarçado.
 */
const VAZIO = /^(|-|--|—|\?+|a confirmar|tbd|todo)$/i
const negocio = ler("NEGOCIO.md")
if (negocio) {
  let coluna = -1
  let fatos = 0
  for (const [n, linha] of negocio.split("\n").entries()) {
    const crua = linha.trim()
    if (!crua.startsWith("|")) {
      coluna = -1
      continue
    }
    const celulas = crua.split("|").slice(1, -1).map((c) => c.trim())
    if (celulas.every((c) => /^:?-{3,}:?$/.test(c))) continue

    if (coluna === -1) {
      coluna = celulas.findIndex((c) => c.toLowerCase() === "fonte")
      continue // a linha de cabeçalho não é um fato
    }
    if (coluna === -1) continue

    fatos++
    const fonte = celulas[coluna] ?? ""
    if (VAZIO.test(fonte)) {
      falhas.push(
        `NEGOCIO.md linha ${n + 1}: o fato "${celulas[0]}" está sem fonte. ` +
          `Fato sem fonte não é fato — o lugar dele é o TRAVADO.md`
      )
    }
  }
  if (fatos === 0) falhas.push("NEGOCIO.md não tem nenhum fato com coluna Fonte")
  else notas.push(`${fatos} fato(s) do negócio, todos com fonte`)

  if (/\{\{/.test(negocio)) {
    falhas.push("NEGOCIO.md tem marcador {{...}}: é pendência posando de fato")
  }
}

/* 3. Decisão e beco precisam de data, senão não dá para saber o que é atual. */
const DATA = /\d{4}-\d{2}-\d{2}/

const decisoes = ler("DECISOES.md")
if (decisoes) {
  const entradas = [...decisoes.matchAll(/^## (.+)$/gm)].map((m) => m[1])
  for (const e of entradas) {
    if (!DATA.test(e)) falhas.push(`DECISOES.md: a entrada "${e}" está sem data`)
  }
  if (entradas.length === 0) falhas.push("DECISOES.md não tem nenhuma entrada")
  else notas.push(`${entradas.length} decisão(ões) registrada(s), todas com data`)
}

const becos = ler("BECOS.md")
if (becos) {
  const itens = [...becos.matchAll(/^\*\*(.+?)\.?\*\*$/gm)].map((m) => m[1])
  const semData = itens.filter((i) => !DATA.test(i))
  for (const i of semData) falhas.push(`BECOS.md: o item "${i}" está sem data`)
  if (itens.length === 0) falhas.push("BECOS.md não tem nenhum item")
  else notas.push(`${itens.length} beco(s) registrado(s), todos com data`)
}

/*
 * 4. Todo item travado diz o que destrava.
 *
 * Sem isso a lista vira desejo, e lista de desejo longa ninguém responde. Dizer a
 * consequência é o que faz o dono escolher qual responder primeiro.
 */
const travado = ler("TRAVADO.md")
if (travado) {
  const blocos = travado.split(/^## /m).slice(1)
  for (const bloco of blocos) {
    const titulo = bloco.split("\n")[0].trim()
    if (!/\*\*Destrava:\*\*/.test(bloco)) {
      falhas.push(
        `TRAVADO.md: o item "${titulo}" não diz o que destrava. ` +
          `Pergunta sem consequência é questionário, e questionário ninguém responde`
      )
    }
  }
  if (blocos.length === 0) falhas.push("TRAVADO.md não tem nenhum item")
  else notas.push(`${blocos.length} item(ns) travado(s), todos com consequência`)
}

console.log("\n── Cérebro ───────────────────────────────────────")
for (const n of notas) console.log(`   ${n}`)
if (falhas.length) {
  console.log("")
  for (const f of falhas) console.log(`   ✗ ${f}`)
  console.log(`\n${falhas.length} problema(s) no cérebro.\n`)
  process.exit(1)
}
console.log("\nCérebro sem problemas.\n")
