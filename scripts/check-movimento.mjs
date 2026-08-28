#!/usr/bin/env node
/**
 * Confere a camada de tokens de movimento.
 *
 *   npm run check:movimento
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DEFEITO QUE ISTO EXISTE PARA PEGAR
 *
 * A migração de 2026-08-27 tirou 14 durações e 8 curvas de dentro dos
 * componentes e as trouxe para dois arquivos com nome. A promessa feita ali foi
 * forte e fácil de quebrar: NENHUM MILISSEGUNDO MUDA. Só o lugar onde o número
 * mora, e quem decidiu a curva.
 *
 * Uma promessa dessas não se confere com o olho. Um `0.42` que vira `0.4` numa
 * limpeza bem-intencionada não aparece em revisão, não quebra teste, não quebra
 * build — só deixa o anel do c‍ursor 20ms mais rápido, e ninguém liga o efeito à
 * causa três semanas depois.
 *
 * Então a tabela abaixo é o levantamento CONGELADO: os valores medidos no site
 * antes da migração, transcritos um a um. A conferência compara `tokens.ts`
 * contra ela. Se alguém mudar um token, isto reprova — e reprovar é o ponto.
 * Quem realmente quiser mudar um tempo muda os dois lugares, e nesse gesto a
 * mudança deixa de ser acidente e vira decisão registrada no diff.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AS QUATRO CONFERÊNCIAS
 *
 *   1. tokens.ts bate com o levantamento congelado    (nada mudou de tempo)
 *   2. globals.css e tokens.ts concordam onde se tocam (as duas fontes não brigam)
 *   3. nenhum literal de tempo sobrou no código-fonte  (a migração foi completa)
 *   4. toda transição CSS declara duração E curva      (nada volta a herdar)
 *
 * A terceira e a quarta são as que impedem a camada de apodrecer: sem elas, o
 * próximo componente entra com `duration-300` na mão e ninguém percebe.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, relative } from "node:path"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const arquivoTokens = join(raiz, "src", "lib", "motion", "tokens.ts")
const arquivoCss = join(raiz, "src", "app", "globals.css")
const fonte = join(raiz, "src")

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * O LEVANTAMENTO CONGELADO
 *
 * Transcrito de `docs/BRIEF-MOVIMENTO.md` §1.3, que por sua vez saiu de ler os
 * componentes um a um antes de tocar em qualquer coisa. Cada linha aqui era um
 * literal solto em algum arquivo.
 *
 * Isto NÃO é a fonte de verdade do site — `tokens.ts` é. Isto é a memória de
 * como o site se movia antes, guardada separada de propósito: duas cópias que
 * precisam concordar pegam a divergência que uma cópia só esconderia.
 */
const CONGELADO = {
  DURACAO: {
    reacao: 0.3,
    saida: 0.25,
    revelacaoCascata: 0.7,
    revelacao: 0.8,
    carimbo: 1.0,
  },
  EASE: {
    entrada: "power3.out",
    acompanhamento: "power3.out",
    retorno: "elastic.out(1, 0.35)",
    // Os quatro tweens que caíam aqui por omissão agora declaram. Mesmo valor.
    estado: "power1.out",
    carimbo: "expo.out",
    continuo: "none",
  },
  CASCATA: {
    irmaos: 0.06,
    irmaosTeto: 0.48,
    caracteres: 0.022,
  },
  DESLOCAMENTO: {
    revelacao: 24,
    revelacaoCascata: 28,
  },
  LENIS: {
    duracao: 1.1,
  },
  CURSOR: {
    duracaoSeguir: 0.42,
    escalaSobreAlvo: 1.9,
  },
  MAGNETICO: {
    duracaoSeguir: 0.5,
    duracaoRetorno: 0.7,
    forcaPadrao: 10,
  },
  CORTINA: {
    duracaoMarcaEntra: 0.35,
    duracaoMarcaSai: 0.25,
    duracaoSubida: 0.62,
    easeMarcaEntra: "power2.out",
    easeMarcaSai: "power2.in",
    easeSubida: "expo.inOut",
  },
  HERO: {
    atrasoTitulo: 0.35,
    atrasoApoio: 0.9,
    duracaoApoio: 0.9,
    deslocamentoApoio: 26,
    esperaShaderMs: 450,
  },
  ESTEIRA: {
    duracaoInversao: 0.4,
  },
}

/*
 * Onde as duas fontes se TOCAM DE VERDADE.
 *
 * GSAP fala segundos, CSS fala milissegundos, e a maior parte dos dois lados não
 * tem nada a ver com o outro. A tentação aqui é parear por número: o card de
 * pacote leva 500ms e o botão magnético volta em 0,5s, então parece que são o
 * mesmo tempo. Não são — é coincidência de dígito entre um véu recompondo e um
 * botão voltando ao repouso. Amarrar os dois faria esta conferência reprovar por
 * uma mudança legítima no botão, e conferência que reprova errado é conferência
 * que as pessoas aprendem a ignorar.
 *
 * Sobra uma ponte só, e ela é real: hover de superfície no CSS e troca de estado
 * no GSAP são a MESMA intenção declarada em duas linguagens. Se uma andar sem a
 * outra, o site passa a ter duas noções de "rápido" para a mesma coisa.
 */
const PONTES = [{ css: "--duration-superficie", ts: ["DURACAO", "reacao"] }]

// ─── Leitura de tokens.ts ────────────────────────────────────────────────────
//
// Um analisador pequeno em vez de importar o módulo: `tokens.ts` é TypeScript, e
// o Node não o executa sem um passo de compilação que esta conferência não deve
// exigir. O arquivo é nosso e o formato é estável, então ler o texto basta.

function corpoDoObjeto(texto, declaracao) {
  const inicio = texto.indexOf(declaracao)
  if (inicio === -1) return null
  const abre = texto.indexOf("{", inicio)
  if (abre === -1) return null
  let profundidade = 0
  for (let i = abre; i < texto.length; i++) {
    if (texto[i] === "{") profundidade++
    else if (texto[i] === "}") {
      profundidade--
      if (profundidade === 0) return texto.slice(abre + 1, i)
    }
  }
  return null
}

/*
 * Pares `chave: valor` no primeiro nível. Ignora o que está aninhado (nada hoje)
 * e o que não é literal simples — `LENIS.easing` é uma função, e conferir o
 * comportamento de uma curva exponencial por comparação de texto seria fingir
 * uma garantia que não existe. Ela fica de fora, dito em voz alta.
 */
function pares(corpo) {
  const achados = new Map()
  const semComentarios = corpo
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
  for (const linha of semComentarios.split("\n")) {
    const m = linha.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+?),?\s*$/)
    if (m) achados.set(m[1], m[2].trim().replace(/,$/, ""))
  }
  return achados
}

function lerTokens(texto) {
  const primitivos = pares(corpoDoObjeto(texto, "const SEGUNDOS") ?? "")
  const curvas = pares(corpoDoObjeto(texto, "const CURVA") ?? "")

  const resolver = (bruto) => {
    let v = bruto
    const ref = v.match(/^(SEGUNDOS|CURVA)\.([A-Za-z0-9_]+)$/)
    if (ref) {
      const tabela = ref[1] === "SEGUNDOS" ? primitivos : curvas
      const achado = tabela.get(ref[2])
      if (achado === undefined) return { erro: `${bruto} não existe` }
      v = achado
    }
    const texto2 = v.match(/^"(.*)"$/)
    if (texto2) return { valor: texto2[1] }
    if (/^-?\d+(\.\d+)?$/.test(v)) return { valor: Number(v) }
    return { pular: true, bruto }
  }

  const grupos = {}
  for (const nome of Object.keys(CONGELADO)) {
    // C‍URSOR no congelado, CURSOR no arquivo: o nome exportado tem acento zero.
    const corpo = corpoDoObjeto(texto, `export const ${nome} `)
    if (corpo === null) {
      grupos[nome] = null
      continue
    }
    const resolvidos = new Map()
    for (const [chave, bruto] of pares(corpo)) {
      resolvidos.set(chave, resolver(bruto))
    }
    grupos[nome] = resolvidos
  }
  return grupos
}

// ─── Leitura de globals.css ──────────────────────────────────────────────────

function lerCss(texto) {
  const vars = new Map()
  for (const m of texto.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    // A primeira declaração vence: é a de `:root`, e as de dentro de media query
    // são sobrescritas conscientes (o bloco de movimento reduzido).
    if (!vars.has(m[1])) vars.set(m[1], m[2].trim())
  }
  const resolver = (nome, saltos = 0) => {
    const bruto = vars.get(nome)
    if (bruto === undefined || saltos > 8) return null
    const ref = bruto.match(/^var\((--[a-z0-9-]+)\)$/i)
    return ref ? resolver(ref[1], saltos + 1) : bruto
  }
  return { vars, resolver }
}

/*
 * Remove blocos inteiros do CSS contando chaves, e não por expressão regular.
 *
 * A primeira versão recortava com `/@media[\s\S]*?\n\}\n\}/`, que depende do
 * fechamento estar na coluna zero. O bloco de movimento reduzido fecha com dois
 * níveis de indentação, o recorte não pegou, e a conferência acusou o
 * `0.01ms !important` como se fosse tempo escrito na mão — justamente a única
 * linha do arquivo que TEM de ser literal, porque ela não anima nada: desliga.
 */
function semBloco(texto, marcador) {
  const inicio = texto.indexOf(marcador)
  if (inicio === -1) return texto
  const abre = texto.indexOf("{", inicio)
  if (abre === -1) return texto
  let profundidade = 0
  for (let i = abre; i < texto.length; i++) {
    if (texto[i] === "{") profundidade++
    else if (texto[i] === "}") {
      profundidade--
      if (profundidade === 0) {
        return semBloco(texto.slice(0, inicio) + texto.slice(i + 1), marcador)
      }
    }
  }
  return texto
}

function paraSegundos(valorCss) {
  const m = String(valorCss).match(/^(-?\d+(?:\.\d+)?)(ms|s)$/)
  if (!m) return null
  return m[2] === "ms" ? Number(m[1]) / 1000 : Number(m[1])
}

// ─── Varredura do código-fonte ───────────────────────────────────────────────

function arquivos(dir) {
  const achados = []
  for (const nome of readdirSync(dir)) {
    // `ui-ux-pro-max/` é material de referência (CSVs de outro projeto), não é
    // código do site. Varrê-lo só produziria ruído.
    if (nome === "ui-ux-pro-max" || nome === "node_modules") continue
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) achados.push(...arquivos(caminho))
    else if (/\.(tsx?|css)$/.test(nome)) achados.push(caminho)
  }
  return achados
}

/*
 * Literais de string do arquivo, incluindo template literals de várias linhas.
 * É por eles que a quarta conferência anda: uma classe do Tailwind sempre mora
 * dentro de um literal, então basta olhar um a um e cobrar que quem diz
 * `transition-` também diga quanto tempo e com que curva.
 */
function literais(texto) {
  const achados = []
  for (const m of texto.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)) achados.push(m[1])
  for (const m of texto.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)) achados.push(m[1])
  for (const m of texto.matchAll(/`([^`\\]*(?:\\.[^`\\]*)*)`/gs)) achados.push(m[1])
  return achados
}

export function checkMovimento() {
  const failures = []
  const notes = []

  const textoTokens = readFileSync(arquivoTokens, "utf8")
  const textoCss = readFileSync(arquivoCss, "utf8")
  const tokens = lerTokens(textoTokens)
  const css = lerCss(textoCss)

  // ── 1. tokens.ts contra o levantamento congelado ──────────────────────────
  let conferidos = 0
  let pulados = 0
  for (const [grupo, esperados] of Object.entries(CONGELADO)) {
    const lidos = tokens[grupo]
    if (!lidos) {
      failures.push(`tokens.ts não exporta ${grupo} — o levantamento espera ele`)
      continue
    }
    for (const [chave, esperado] of Object.entries(esperados)) {
      const lido = lidos.get(chave)
      if (lido === undefined) {
        failures.push(`${grupo}.${chave} sumiu de tokens.ts (levantamento: ${esperado})`)
        continue
      }
      if (lido.erro) {
        failures.push(`${grupo}.${chave}: ${lido.erro}`)
        continue
      }
      if (lido.pular) {
        pulados++
        continue
      }
      if (lido.valor !== esperado) {
        failures.push(
          `${grupo}.${chave} mudou de tempo: o site fazia ${JSON.stringify(esperado)}, ` +
            `tokens.ts diz ${JSON.stringify(lido.valor)} — se a mudança é ` +
            `intencional, atualize também o levantamento em scripts/check-movimento.mjs`
        )
        continue
      }
      conferidos++
    }
  }
  notes.push(
    `${conferidos} token(s) batem com o levantamento de antes da migração` +
      (pulados ? `, ${pulados} não comparável(is) (função)` : "")
  )

  // ── 2. as duas fontes onde se tocam ───────────────────────────────────────
  for (const ponte of PONTES) {
    const bruto = css.resolver(ponte.css)
    if (bruto === null) {
      failures.push(`globals.css não declara ${ponte.css}`)
      continue
    }
    const emSegundos = paraSegundos(bruto)
    const [grupo, chave] = ponte.ts
    const doTs = tokens[grupo]?.get(chave)?.valor
    if (emSegundos === null) {
      failures.push(`${ponte.css} vale "${bruto}", que não é uma duração`)
    } else if (doTs !== emSegundos) {
      failures.push(
        `${ponte.css} (${bruto}) e ${grupo}.${chave} (${doTs}s) divergem — ` +
          `são o mesmo tempo em duas linguagens e precisam concordar`
      )
    }
  }
  notes.push(`${PONTES.length} tempo(s) conferido(s) entre CSS e GSAP`)

  // ── 3. nenhum literal de tempo solto ──────────────────────────────────────
  //
  // O `0.01ms !important` do bloco de movimento reduzido fica de fora, e é a
  // única exceção: ele não é um tempo de animação, é o desligamento delas.
  const literalGsap = /\b(?:duration|delay|stagger):\s*(?:0?\.\d+|\d+(?:\.\d+)?)\s*[,}\n]/
  const literalEase = /\bease:\s*"(?!\s*")/
  const classeCrua = /\b(?:duration|ease)-(?:\[[\d.]+m?s\]|\d+|linear\b|in\b|out\b|in-out\b)/
  const soltos = []

  for (const caminho of arquivos(fonte)) {
    if (caminho === arquivoTokens) continue // é o dicionário; é onde os números moram
    const texto = readFileSync(caminho, "utf8")
    const curto = relative(raiz, caminho).replace(/\\/g, "/")

    if (caminho === arquivoCss) {
      /*
       * No CSS o que se cobra é diferente: fora do `:root` de tokens e do bloco
       * de movimento reduzido, nenhuma regra deve escrever um tempo na mão.
       */
      const semTokens = semBloco(
        semBloco(texto, "@media (prefers-reduced-motion"),
        ":root"
      )
      for (const m of semTokens.matchAll(/transition[^;]*?\b\d+(?:\.\d+)?m?s\b/g)) {
        soltos.push(`${curto}: transição com tempo na mão — "${m[0].trim()}"`)
      }
      continue
    }

    for (const [indice, linha] of texto.split("\n").entries()) {
      const n = indice + 1
      if (literalGsap.test(linha)) {
        soltos.push(`${curto}:${n}: tempo de GSAP na mão — "${linha.trim()}"`)
      }
      if (literalEase.test(linha)) {
        soltos.push(`${curto}:${n}: curva de GSAP na mão — "${linha.trim()}"`)
      }
      if (classeCrua.test(linha)) {
        soltos.push(`${curto}:${n}: classe de tempo crua — "${linha.trim()}"`)
      }
    }
  }
  failures.push(...soltos)
  if (soltos.length === 0) {
    notes.push("nenhum tempo ou curva escrito na mão fora de tokens.ts")
  }

  // ── 4. toda transição declara duração e curva ─────────────────────────────
  //
  // Esta é a que impede o site de voltar a herdar. Antes da migração as 26
  // transições diziam quanto tempo e NENHUMA dizia com que curva; todas caíam no
  // default do Tailwind. Sem esta linha, a 27ª faria o mesmo.
  let transicoes = 0
  const mudas = []
  for (const caminho of arquivos(fonte)) {
    if (caminho === arquivoCss) continue
    const texto = readFileSync(caminho, "utf8")
    const curto = relative(raiz, caminho).replace(/\\/g, "/")
    for (const literal of literais(texto)) {
      if (!/\btransition-(?:all|colors|opacity|transform|shadow|\[)/.test(literal)) continue
      transicoes++
      const temDuracao = /\bduration-\[var\(--[a-z0-9-]+\)\]/.test(literal)
      const temCurva = /\bease-\[var\(--ease-[a-z0-9-]+\)\]/.test(literal)
      if (!temDuracao || !temCurva) {
        const falta = [!temDuracao && "duração", !temCurva && "curva"]
          .filter(Boolean)
          .join(" e ")
        mudas.push(`${curto}: transição sem ${falta} — "${literal.trim().slice(0, 90)}"`)
      }
    }
  }
  failures.push(...mudas)
  notes.push(`${transicoes} transição(ões) CSS, ${transicoes - mudas.length} completa(s)`)

  // ── 5. o desligamento continua de pé ──────────────────────────────────────
  //
  // A camada de tokens não pode ter enfraquecido o contrato que já existia: quem
  // pede movimento reduzido recebe a página parada, e quem está sem JavaScript
  // recebe a página legível. As duas coisas vivem no CSS e custam uma linha
  // conferir.
  if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(textoCss)) {
    failures.push("globals.css perdeu o bloco de prefers-reduced-motion")
  }
  if (!/\[data-reveal\]/.test(textoCss)) {
    failures.push("globals.css perdeu o estado inicial de [data-reveal]")
  }

  return { failures, notes }
}

const { failures, notes } = checkMovimento()
process.stdout.write("\n── Tokens de movimento ────────────────────────────\n")
notes.forEach((n) => process.stdout.write(`   ${n}\n`))
failures.forEach((f) => process.stdout.write(`   ✗ ${f}\n`))
process.stdout.write(`\n${"═".repeat(56)}\n`)
process.stdout.write(
  failures.length === 0
    ? "Movimento sem problemas: nenhum tempo mudou.\n"
    : `${failures.length} problema(s).\n`
)
process.exit(failures.length === 0 ? 0 : 1)
