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
 *  4. Ciclo do estoque — reserva, venda e cancelamento rodando contra um Google
 *     Sheets imitado. É a parte que só existiria dentro do Google, e é a que
 *     erra em silêncio: baixa errada não dá tela vermelha, dá saldo errado.
 */
import { readFileSync, readdirSync } from "node:fs"
import { createContext, Script } from "node:vm"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { ambienteFake } from "./checks/sheets-fake.mjs"

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
  Pedidos: { ID: "A", "Entrega em": "G", Status: "H", Pagamento: "I", Total: "J" },
  Itens: { "ID pedido": "A", SKU: "B", Pacotes: "E", Preço: "G", Subtotal: "H" },
  Movimentos: { Tipo: "B", Item: "C", Unidades: "D", Pedido: "E" },
  Estoque: { Item: "A", Nome: "B", Mínimo: "D", Entradas: "E", Saídas: "F", Saldo: "G", Comprometido: "H", Livre: "I", Alerta: "J" },
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

/* ────────────────────── 4. o ciclo do estoque ────────────────────────── */

secao("Instalação da planilha")

/**
 * Sobe o sistema inteiro dentro do Sheets imitado.
 *
 * Diferente da carga acima, aqui entram TODOS os arquivos: é o único jeito de
 * executar o que só roda dentro do Google.
 */
function novoAmbiente() {
  const fake = ambienteFake()
  const ctx = createContext(fake.globais)
  const exportar = `globalThis.__gs = {
    instalar, lerTabela, aba, coluna, ultimaLinha, acrescentar,
    reservarPedido_, venderPedido_, soltarReserva_, alocacaoDoPedido_,
    movimentosDoPedido_, gravarPedido_, proximoId_, pedidoPorCodigo_,
    ABAS, STATUS, MOVIMENTO,
  }`
  new Script(arquivos.map((n) => fontes[n]).join("\n;\n") + "\n;\n" + exportar, {
    filename: "apps-script (tudo)",
  }).runInContext(ctx)
  return { fake: fake, gs: ctx.__gs }
}

let ambiente
try {
  ambiente = novoAmbiente()
  ambiente.gs.instalar()
  checagens++
} catch (erro) {
  falhas++
  process.stdout.write(`   ✗ instalar() falhou — ${erro.message}\n`)
}

if (ambiente) {
  const gs = ambiente.gs
  const linhasCatalogo = gs.lerTabela(gs.ABAS.catalogo)
  const linhasSabores = gs.lerTabela(gs.ABAS.sabores)
  const linhasEstoque = gs.lerTabela(gs.ABAS.estoque)

  ok(linhasCatalogo.length === CATALOGO.length, `Catálogo com ${CATALOGO.length} SKUs`, `veio ${linhasCatalogo.length}`)
  ok(linhasSabores.length === SABORES.length, `Sabores com ${SABORES.length} linhas`, `veio ${linhasSabores.length}`)
  ok(linhasEstoque.length === ITENS_ESTOQUE.length, `Estoque com ${ITENS_ESTOQUE.length} itens`, `veio ${linhasEstoque.length}`)

  /*
   * Reinstalar acontece toda vez que o cardápio muda. Se isso apagasse o
   * estoque mínimo ou a correção de sabor que o dono fez à mão, ele perderia o
   * ajuste sem aviso e a planilha passaria a mandar repor a hora errada.
   */
  const e = gs.aba(gs.ABAS.estoque)
  e.getRange(2, gs.coluna(e, "Mínimo")).setValue(150)
  const sab = gs.aba(gs.ABAS.sabores)
  sab.getRange(2, gs.coluna(sab, "Item de estoque")).setValue("item-corrigido-a-mao")

  gs.instalar()

  ok(
    gs.aba(gs.ABAS.estoque).getRange(2, gs.coluna(e, "Mínimo")).getValue() === 150,
    "reinstalar preserva o estoque mínimo digitado"
  )
  ok(
    gs.aba(gs.ABAS.sabores).getRange(2, gs.coluna(sab, "Item de estoque")).getValue() ===
      "item-corrigido-a-mao",
    "reinstalar preserva a correção de sabor feita à mão"
  )
}

secao("Ciclo do estoque")

/**
 * Semeia um pedido já lançado.
 *
 * `Unidades` é escrito à mão porque na planilha real ele é fórmula (busca o SKU
 * no Catálogo e multiplica pelos pacotes), e a imitação não calcula fórmula. O
 * valor semeado é o que o Sheets produziria.
 */
function semearPedido(gs, id, itens) {
  const p = gs.aba(gs.ABAS.pedidos)
  const linha = gs.ultimaLinha(p, 1) + 1
  p.getRange(linha, gs.coluna(p, "ID")).setValue(id)
  p.getRange(linha, gs.coluna(p, "Status")).setValue(gs.STATUS.novo)

  const i = gs.aba(gs.ABAS.itens)
  for (const item of itens) {
    const alvo = gs.ultimaLinha(i, 1) + 1
    i.getRange(alvo, gs.coluna(i, "ID pedido")).setValue(id)
    i.getRange(alvo, gs.coluna(i, "SKU")).setValue(item.sku)
    i.getRange(alvo, gs.coluna(i, "Sabores")).setValue((item.sabores || []).join(", "))
    i.getRange(alvo, gs.coluna(i, "Pacotes")).setValue(item.pacotes)
    i.getRange(alvo, gs.coluna(i, "Unidades")).setValue(item.unidades)
  }
  return linha
}

function movimentos(gs) {
  return gs.lerTabela(gs.ABAS.movimentos)
}

if (ambiente) {
  const ciclo = novoAmbiente()
  const gs = ciclo.gs
  gs.instalar()

  semearPedido(gs, "P-0001", [
    {
      sku: "classicos-fritos-100",
      pacotes: 1,
      unidades: 100,
      sabores: ["Coxinha de frango", "Bolinha de queijo"],
    },
  ])

  gs.reservarPedido_("P-0001")
  let movs = movimentos(gs)
  const reservas = movs.filter((m) => m["Tipo"] === gs.MOVIMENTO.reserva)
  ok(reservas.length === 2, "confirmar reserva gera um movimento por sabor", `veio ${reservas.length}`)
  ok(
    reservas.every((m) => m["Unidades"] === 50),
    "as 100 unidades são divididas 50/50 entre os dois sabores"
  )
  ok(
    movs.every((m) => m["Pedido"] === "P-0001"),
    "todo movimento fica amarrado ao pedido que o gerou"
  )

  /*
   * O pedido passa por "Em produção" e "Pronto" antes de sair. Cada passagem
   * chama a reserva de novo — se ela não fosse idempotente, um pedido comum
   * comprometeria o triplo do que vai realmente usar.
   */
  gs.reservarPedido_("P-0001")
  gs.reservarPedido_("P-0001")
  ok(movimentos(gs).length === 2, "reservar de novo não duplica", `veio ${movimentos(gs).length}`)

  gs.venderPedido_("P-0001")
  movs = movimentos(gs)
  ok(movs.length === 2, "entregar converte a reserva em vez de criar linha nova")
  ok(
    movs.every((m) => m["Tipo"] === gs.MOVIMENTO.venda),
    "as reservas viraram venda"
  )

  gs.venderPedido_("P-0001")
  ok(movimentos(gs).length === 2, "entregar duas vezes não baixa o dobro")

  /*
   * Cancelar pedido já entregue é devolução, e devolução tem que aparecer. Se a
   * saída sumisse em silêncio, o estoque voltaria sem ninguém saber por quê.
   */
  gs.soltarReserva_("P-0001")
  ok(movimentos(gs).length === 2, "cancelar pedido já entregue não apaga a venda")
  ok(
    ciclo.fake.planilha.avisos.some((a) => /Ajuste \+/.test(a.mensagem)),
    "e avisa que a devolução precisa ser lançada à mão"
  )

  /*
   * O caso que justifica apagar linha de baixo para cima.
   *
   * Precisa de DUAS coisas juntas: o pedido cancelado tem mais de uma linha, e
   * há outro pedido logo abaixo. Apagando de cima para baixo, a primeira
   * exclusão sobe todo o resto — e a segunda, mirando o índice antigo, leva a
   * linha do pedido vizinho. Com uma linha só o teste passa de qualquer jeito, e
   * foi assim que escrevi da primeira vez: verde sem estar verificando nada.
   */
  semearPedido(gs, "P-0002", [
    {
      sku: "classicos-fritos-50",
      pacotes: 1,
      unidades: 50,
      sabores: ["Coxinha de frango", "Mini churros"],
    },
  ])
  semearPedido(gs, "P-0003", [
    {
      sku: "assados-especiais-50",
      pacotes: 1,
      unidades: 50,
      sabores: ["Esfiha de frango", "Empadinha de frango"],
    },
  ])
  gs.reservarPedido_("P-0002")
  gs.reservarPedido_("P-0003")

  const antes = movimentos(gs).length
  ok(antes === 6, "dois pedidos novos somam quatro movimentos", `veio ${antes}`)

  gs.soltarReserva_("P-0002")
  movs = movimentos(gs)
  ok(movs.length === 4, "cancelar apaga só os movimentos do pedido cancelado", `sobraram ${movs.length}`)
  ok(
    movs.filter((m) => m["Pedido"] === "P-0003").length === 2,
    "o pedido vizinho fica intacto — é o que exige apagar de baixo para cima"
  )
  ok(
    movs.filter((m) => m["Pedido"] === "P-0002").length === 0,
    "e nada do cancelado sobra"
  )

  /* Congelado de sabor único desconta sem escolha de sabor. */
  const doCongelado = movs.filter((m) => m["Pedido"] === "P-0003")
  ok(
    doCongelado.every((m) => m["Unidades"] === 25),
    "50 unidades em dois sabores viram 25 e 25"
  )

  /* Venda de balcão: entregue sem passar por confirmado. */
  semearPedido(gs, "P-0004", [
    { sku: "cong-assado-esfiha-frango", pacotes: 1, unidades: 50, sabores: [] },
  ])
  gs.venderPedido_("P-0004")
  const balcao = movimentos(gs).filter((m) => m["Pedido"] === "P-0004")
  ok(balcao.length === 1, "pedido entregue sem confirmação prévia também baixa")
  ok(balcao[0] && balcao[0]["Tipo"] === gs.MOVIMENTO.venda, "e baixa como venda")
  ok(balcao[0] && balcao[0]["Unidades"] === 50, "com as unidades certas")

  /*
   * "Sortidos" é mistura, não produto do congelador: tem que avisar em vez de
   * descontar de um item escolhido no chute.
   */
  const avisosAntes = ciclo.fake.planilha.avisos.length
  semearPedido(gs, "P-0005", [
    { sku: "cong-frito-sortidos", pacotes: 1, unidades: 50, sabores: [] },
  ])
  gs.reservarPedido_("P-0005")
  ok(
    movimentos(gs).filter((m) => m["Pedido"] === "P-0005").length === 0,
    "sortidos não desconta de nenhum item"
  )
  ok(
    ciclo.fake.planilha.avisos.length > avisosAntes,
    "e o dono é avisado para lançar à mão"
  )
}

/* ───────────────────────────── conclusão ────────────────────────────── */

process.stdout.write(`\n${"═".repeat(56)}\n`)
if (falhas === 0) {
  process.stdout.write(`${checagens} verificações, todas passaram.\n`)
} else {
  process.stdout.write(`${falhas} falha(s) em ${checagens} verificações.\n`)
}
process.exit(falhas === 0 ? 0 : 1)
