#!/usr/bin/env node
/**
 * Verificação do sistema da planilha.
 *
 *   npm run check:planilha
 *
 * Existe por um motivo prático: testar Apps Script clicando na planilha é lento,
 * não deixa rastro e só encontra o erro depois que ele já aconteceu com um
 * pedido de verdade. Aqui as regras rodam fora do Google, em segundos.
 *
 * São três frentes:
 *
 *  1. Sintaxe — todo arquivo .gs compila. O editor do Apps Script só reclama na
 *     hora de executar, e "só na hora" é tarde.
 *  2. Nomes — cada coluna e cada função citada existe. Nome de coluna é string
 *     solta: nenhum tipo protege contra escrever "Líquido" sem acento.
 *  3. Regras — validação do pedido, rateio de sabores e alocação no estoque,
 *     que é onde mora a lógica que dá para errar de verdade.
 */
import { readFileSync, readdirSync } from "node:fs"
import { createContext, Script } from "node:vm"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const pastaGs = join(raiz, "apps-script")

let falhas = 0
let checagens = 0

function ok(condicao, descricao, detalhe) {
  checagens++
  if (condicao) return
  falhas++
  process.stdout.write(`   ✗ ${descricao}${detalhe ? ` — ${detalhe}` : ""}\n`)
}

function secao(titulo) {
  process.stdout.write(`\n── ${titulo} ${"─".repeat(Math.max(0, 46 - titulo.length))}\n`)
}

/* ─────────────────────────── 1. sintaxe e carga ──────────────────────── */

secao("Sintaxe dos arquivos .gs")

const arquivos = readdirSync(pastaGs)
  .filter((f) => f.endsWith(".gs"))
  .sort()

const fontes = {}
for (const nome of arquivos) {
  const fonte = readFileSync(join(pastaGs, nome), "utf8")
  fontes[nome] = fonte
  try {
    new Script(fonte, { filename: nome })
    checagens++
  } catch (erro) {
    falhas++
    process.stdout.write(`   ✗ ${nome} não compila — ${erro.message}\n`)
  }
}
process.stdout.write(`   ${arquivos.length} arquivos compilam\n`)

/*
 * Carrega só o que não depende do Google. Config, Catalogo e Nucleo são
 * declarações puras; os outros arquivos chamam SpreadsheetApp e não têm como
 * rodar fora da planilha — para eles a verificação é estática, mais abaixo.
 *
 * Os três vão num script só, e não em três execuções: `const` no topo de um
 * script de vm fica no escopo daquele script, então em execuções separadas o
 * Nucleo não enxergaria o LIMITES do Config nem o CATALOGO do arquivo gerado.
 * O rabicho no fim expõe o que os testes precisam, pelo mesmo motivo — `const`
 * não vira propriedade do objeto global.
 */
const contexto = createContext({ console })
const rabicho = `globalThis.__api = {
  CATALOGO, SABORES, ITENS_ESTOQUE, COLUNAS, STATUS, MOVIMENTO, PAGAMENTOS, LIMITES,
  normalizarPedido, alocarEstoque, ratearUnidades, gerarCodigo, moeda,
}`
new Script(
  ["Config.gs", "Catalogo.gs", "Nucleo.gs"].map((n) => fontes[n]).join("\n;\n") + "\n;\n" + rabicho,
  { filename: "apps-script (Config+Catalogo+Nucleo)" }
).runInContext(contexto)

const nucleo = contexto.__api
const { CATALOGO, SABORES, ITENS_ESTOQUE, COLUNAS } = nucleo

/* ──────────────────── 2. nomes de coluna e de função ─────────────────── */

secao("Nomes de coluna e de função")

/**
 * Toda chamada `coluna(x, 'Nome')` precisa citar um cabeçalho que existe.
 *
 * É a falha mais provável do projeto inteiro: renomear uma coluna no Config e
 * esquecer de um uso. Na planilha isso vira exceção só quando aquele caminho
 * for executado — talvez semanas depois, no meio de um pedido.
 */
const todosCabecalhos = new Set(Object.values(COLUNAS).flat())
for (const [nome, fonte] of Object.entries(fontes)) {
  for (const achado of fonte.matchAll(/coluna\((?:[\w.]+),\s*'([^']+)'\)/g)) {
    ok(
      todosCabecalhos.has(achado[1]),
      `${nome}: coluna "${achado[1]}" não existe em COLUNAS`,
      [...todosCabecalhos].join(", ").slice(0, 120) + "…"
    )
  }
}

/** Todo item de menu precisa apontar para uma função declarada em algum .gs. */
const declaradas = new Set()
for (const fonte of Object.values(fontes)) {
  for (const achado of fonte.matchAll(/^function\s+([A-Za-z_$][\w$]*)/gm)) {
    declaradas.add(achado[1])
  }
}
for (const achado of fontes["Menu.gs"].matchAll(/addItem\('[^']+',\s*'([^']+)'\)/g)) {
  ok(declaradas.has(achado[1]), `Menu.gs aponta para "${achado[1]}", que não existe`)
}

/*
 * As fórmulas escritas pelo código citam colunas por LETRA ($K:$K), porque é a
 * única forma que o Sheets aceita numa fórmula de matriz. Isso amarra o código
 * à ordem das colunas — inserir uma coluna no meio do Config passaria a somar a
 * coluna errada, calado. Esta tabela é o alarme.
 */
const letrasEsperadas = {
  Pedidos: { ID: "A", Status: "H", Pagamento: "I", Maquininha: "J", Total: "K", Líquido: "L" },
  Itens: { "ID pedido": "A", SKU: "B", Pacotes: "E", Preço: "G", Subtotal: "H" },
  Movimentos: { Tipo: "B", Item: "C", Unidades: "D", Pedido: "E" },
  Estoque: { Item: "A", Nome: "B", Mínimo: "D", Entradas: "E", Saídas: "F", Saldo: "G", Comprometido: "H", Livre: "I", Alerta: "J" },
  Taxas: { Chave: "A", Maquininha: "B", Forma: "C", "Taxa %": "D" },
}
for (const [tabela, esperado] of Object.entries(letrasEsperadas)) {
  for (const [coluna, letra] of Object.entries(esperado)) {
    const indice = COLUNAS[tabela].indexOf(coluna)
    const real = indice === -1 ? "?" : String.fromCharCode(65 + indice)
    ok(real === letra, `${tabela}."${coluna}" deveria ser a coluna ${letra}, está em ${real}`)
  }
}

/* ───────────────────────────── 3. as regras ──────────────────────────── */

secao("Regras do pedido")

const skuFesta = "classicos-fritos-100"
const skuBox = "box-degustacao-25"
const skuCong = "cong-frito-coxinha-frango"

const achaSku = (sku) => CATALOGO.find((p) => p.sku === sku)
ok(!!achaSku(skuFesta), `catálogo tem ${skuFesta}`)
ok(!!achaSku(skuBox), `catálogo tem ${skuBox}`)
ok(!!achaSku(skuCong), `catálogo tem ${skuCong}`)

// Preço vem do catálogo, nunca do cliente.
const forjado = nucleo.normalizarPedido(
  { itens: [{ sku: skuFesta, pacotes: 2, preco: 0.01, sabores: ["Coxinha de frango"] }] },
  CATALOGO,
  SABORES
)
ok(forjado.total === 139.8, "preço recalculado do catálogo", `veio ${forjado.total}`)

// SKU inventado é recusado sem derrubar o resto do pedido.
const misto = nucleo.normalizarPedido(
  {
    itens: [
      { sku: "nao-existe", pacotes: 1 },
      { sku: skuCong, pacotes: 3 },
    ],
  },
  CATALOGO,
  SABORES
)
ok(misto.itens.length === 1, "item inválido descartado, válido mantido")
ok(misto.total === 75, "total só com o item válido", `veio ${misto.total}`)
ok(misto.erros.length === 1, "o item recusado virou erro anotado")

// Limite de sabores da faixa.
const demais = nucleo.normalizarPedido(
  {
    itens: [
      {
        sku: skuFesta,
        pacotes: 1,
        sabores: ["Coxinha de frango", "Bolinha de queijo", "Mini churros"],
      },
    ],
  },
  CATALOGO,
  SABORES
)
ok(demais.itens.length === 0, "3 sabores numa faixa de 2 é recusado")

// Sabor de outra linha não passa.
const trocado = nucleo.normalizarPedido(
  { itens: [{ sku: skuFesta, pacotes: 1, sabores: ["Croissant de chocolate"] }] },
  CATALOGO,
  SABORES
)
ok(trocado.itens.length === 0, "sabor de outra linha é recusado")

// Sabor repetido colapsa em um só.
const repetido = nucleo.normalizarPedido(
  {
    itens: [
      { sku: skuFesta, pacotes: 1, sabores: ["Coxinha de frango", "Coxinha de frango"] },
    ],
  },
  CATALOGO,
  SABORES
)
ok(repetido.itens.length === 1 && repetido.itens[0].sabores.length === 1, "sabor repetido colapsa")

// Quantidades absurdas ou negativas.
for (const pacotes of [0, -3, 1e9, "muitos", null]) {
  const r = nucleo.normalizarPedido({ itens: [{ sku: skuCong, pacotes }] }, CATALOGO, SABORES)
  ok(r.itens.length === 0, `quantidade "${pacotes}" é recusada`)
}

secao("Rateio e estoque")

ok(JSON.stringify(nucleo.ratearUnidades(100, 2)) === "[50,50]", "100 em 2 sabores = 50/50")
ok(JSON.stringify(nucleo.ratearUnidades(25, 2)) === "[13,12]", "25 em 2 sabores = 13/12")
ok(JSON.stringify(nucleo.ratearUnidades(50, 1)) === "[50]", "50 em 1 sabor = 50")

const somaRateio = nucleo.ratearUnidades(137, 3).reduce((a, b) => a + b, 0)
ok(somaRateio === 137, "o rateio nunca cria nem perde unidade", `somou ${somaRateio}`)

const pedidoFesta = nucleo.normalizarPedido(
  {
    itens: [{ sku: skuFesta, pacotes: 1, sabores: ["Coxinha de frango", "Bolinha de queijo"] }],
  },
  CATALOGO,
  SABORES
)
const aloc = nucleo.alocarEstoque(pedidoFesta.itens, SABORES)
ok(aloc.unidadesPorItem["frito-coxinha-de-frango"] === 50, "50 coxinhas reservadas")
ok(aloc.unidadesPorItem["frito-bolinha-de-queijo"] === 50, "50 bolinhas reservadas")
ok(aloc.semItem.length === 0, "nada ficou sem item")

// Congelado de sabor único desconta sem precisar escolher sabor.
const pedidoCong = nucleo.normalizarPedido(
  { itens: [{ sku: skuCong, pacotes: 2 }] },
  CATALOGO,
  SABORES
)
const alocCong = nucleo.alocarEstoque(pedidoCong.itens, SABORES)
ok(
  alocCong.unidadesPorItem["frito-coxinha-de-frango"] === 100,
  "congelado de sabor único desconta sozinho",
  JSON.stringify(alocCong.unidadesPorItem)
)

/*
 * "Sortidos" é mistura, não produto. Tem que sair avisando, não descontando de
 * um item escolhido no chute — erro visível se conserta, erro silencioso vira
 * diferença de estoque no fim do mês.
 */
const pedidoSortido = nucleo.normalizarPedido(
  { itens: [{ sku: "cong-frito-sortidos", pacotes: 1 }] },
  CATALOGO,
  SABORES
)
const alocSortido = nucleo.alocarEstoque(pedidoSortido.itens, SABORES)
ok(Object.keys(alocSortido.unidadesPorItem).length === 0, "sortidos não desconta de nenhum item")
ok(alocSortido.semItem.length === 1, "sortidos é reportado para lançamento manual")

// O congelado da mini pizza e a Seleção têm que cair no MESMO item, senão o
// congelador é contado duas vezes.
const mapaSabores = {}
for (const s of SABORES) mapaSabores[s.linha + "|" + s.sabor] = s.item
ok(
  mapaSabores["cong-assado-mini-pizza-mussarela|Mini pizza mussarela"] ===
    mapaSabores["selecao-don-enrico|Mini pizza de mussarela"],
  "mini pizza congelada e da Seleção são o mesmo item de estoque"
)

secao("Integridade do catálogo")

const itensValidos = new Set(ITENS_ESTOQUE.map((i) => i.id))
for (const s of SABORES) {
  ok(
    s.item === "" || itensValidos.has(s.item),
    `sabor "${s.sabor}" aponta para item inexistente: ${s.item}`
  )
}

const linhasComSabor = new Set(SABORES.map((s) => s.linha))
for (const p of CATALOGO) {
  ok(linhasComSabor.has(p.linha), `SKU ${p.sku} está numa linha sem nenhum sabor cadastrado`)
  ok(p.preco > 0, `SKU ${p.sku} sem preço`)
  ok(p.unidades > 0, `SKU ${p.sku} sem quantidade`)
}

const skus = CATALOGO.map((p) => p.sku)
ok(new Set(skus).size === skus.length, "não há SKU repetido")

secao("Formato de código e moeda")

let sorteio = 0
const previsivel = () => {
  const valores = [0, 0.5, 0.99, 0.25]
  return valores[sorteio++ % valores.length]
}
const codigo = nucleo.gerarCodigo(previsivel)
ok(codigo.length === 4, "o código tem 4 casas", codigo)
ok(!/[01OIL5S]/.test(codigo), "o código não usa caracteres confundíveis", codigo)

ok(nucleo.moeda(1234.5) === "R$ 1.234,50", "moeda em pt-BR", nucleo.moeda(1234.5))
ok(nucleo.moeda(0) === "R$ 0,00", "moeda de zero")

/* ───────────────────────────── conclusão ────────────────────────────── */

process.stdout.write(`\n${"═".repeat(56)}\n`)
if (falhas === 0) {
  process.stdout.write(`${checagens} verificações, todas passaram.\n`)
} else {
  process.stdout.write(`${falhas} falha(s) em ${checagens} verificações.\n`)
}
process.exit(falhas === 0 ? 0 : 1)
