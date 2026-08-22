#!/usr/bin/env node
/**
 * Gera `apps-script/Catalogo.gs` a partir de `src/lib/data/menu.ts`.
 *
 *   node scripts/gerar-catalogo.mjs
 *
 * Existe para o cardápio ter UM dono. O site lê `menu.ts`; a planilha lê o
 * arquivo gerado aqui. Se a planilha tivesse a própria cópia digitada à mão, na
 * primeira mudança de preço as duas divergiriam em silêncio — e o pedido do
 * site chegaria com um preço, a planilha registraria outro.
 *
 * O Node 22 remove os tipos sozinho, então o import do .ts funciona direto.
 */
import { writeFileSync } from "node:fs"
import {
  boxDegustacao,
  festaCategories,
  congeladosFritar,
  congeladosAssados,
  assortedSku,
} from "../src/lib/data/menu.ts"

/*
 * A que linha de produção cada categoria pertence.
 *
 * Importa porque o estoque é contado por PRODUTO FÍSICO, não por sabor: uma
 * empadinha de frango assada e uma empadinha de frango folhada são coisas
 * diferentes no congelador, mesmo tendo o mesmo nome no encarte.
 */
const TIPO_POR_CATEGORIA = {
  "box-degustacao": "frito",
  "classicos-fritos": "frito",
  "assados-especiais": "assado",
  "folhados-premium": "folhado",
  "selecao-don-enrico": "selecao",
}

/*
 * Nomes que aparecem escritos de formas diferentes no encarte e são o mesmo
 * produto. Sem isto o "Enroladinho de salsicha" do Box e o "Enrolado de
 * salsicha" dos Clássicos viram duas linhas de estoque para a mesma bandeja.
 *
 * Só entra aqui o que é seguro afirmar. Casos duvidosos (mini pizza da Seleção
 * x mini pizza dos Congelados Assados) ficam separados de propósito e estão
 * anotados em docs/PERGUNTAS-CLIENTE.md — na planilha dá para uni-los editando
 * uma célula da aba Sabores, sem mexer em código.
 */
const SINONIMOS = {
  "enroladinho de salsicha": "enrolado de salsicha",
  "calabresinha c/ cheddar": "calabresa c/ cheddar",
  "mini pizza de calabresa": "mini pizza calabresa",
  "mini pizza de frango": "mini pizza frango",
  "mini pizza de mussarela": "mini pizza mussarela",
  "pastel presunto e queijo": "pastelzinho presunto e queijo",
  "risoles presunto e queijo": "risoles presunto e queijo",
}

/*
 * Congelados que são o MESMO produto de uma linha de festa, mas cairiam num
 * item separado só porque o encarte os lista noutra tabela.
 *
 * Mini pizza e empadinha de brócolis só aparecem na Seleção Don Enrico entre as
 * linhas de festa; o pacote congelado é a mesma bandeja saindo do mesmo forno.
 * Sem esta tabela o congelador teria duas contagens do mesmo salgado e nenhuma
 * das duas estaria certa.
 *
 * CONFIRMAR: se forem receitas diferentes, apague a linha aqui — ou, sem mexer
 * em código, aponte outro item na aba Sabores da planilha.
 */
const ITEM_FORCADO = {
  "mini-pizza-mussarela": "selecao-mini-pizza-mussarela",
  "mini-pizza-frango": "selecao-mini-pizza-frango",
  "mini-pizza-calabresa": "selecao-mini-pizza-calabresa",
  "empadinha-brocolis": "selecao-empadinha-de-brocolis",
}

function normalizar(nome) {
  const chave = nome.trim().toLowerCase()
  return SINONIMOS[chave] ?? chave
}

function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
}

/** Identidade de um produto no congelador: linha de produção + sabor. */
function itemDeEstoque(tipo, sabor) {
  return `${tipo}-${slug(normalizar(sabor))}`
}

const catalogo = []
const sabores = []
const estoque = new Map()

function registrarEstoque(tipo, sabor) {
  const id = itemDeEstoque(tipo, sabor)
  if (!estoque.has(id)) {
    estoque.set(id, { id, nome: normalizar(sabor), tipo })
  }
  return id
}

for (const cat of [boxDegustacao, ...festaCategories]) {
  const tipo = TIPO_POR_CATEGORIA[cat.id]
  if (!tipo) throw new Error(`categoria sem linha de produção definida: ${cat.id}`)

  for (const tier of cat.tiers) {
    catalogo.push({
      sku: assortedSku(cat.id, tier.quantity),
      linha: cat.id,
      produto: `${cat.name} — ${tier.quantity} un`,
      unidades: tier.quantity,
      preco: tier.price,
      maxSabores: tier.maxFlavors,
    })
  }

  for (const sabor of cat.flavors) {
    sabores.push({ linha: cat.id, sabor, item: registrarEstoque(tipo, sabor) })
  }
}

/*
 * Congelados: cada sabor é um SKU próprio de sabor único, então a linha do
 * catálogo e a linha de sabores apontam para o mesmo produto.
 *
 * "Sortidos" é a exceção — é uma mistura, não um produto. Fica sem item de
 * estoque; a baixa desse pacote precisa ser lançada à mão, e a planilha avisa.
 */
for (const [lista, tipo] of [
  [congeladosFritar, "frito"],
  [congeladosAssados, "assado"],
]) {
  for (const pack of lista) {
    // O SKU vem do próprio cardápio, não montado aqui: é o mesmo código que o
    // carrinho do site envia, então não existe como os dois divergirem.
    const linha = pack.sku
    const misto = pack.id === "sortidos"
    catalogo.push({
      sku: linha,
      linha,
      produto: `${pack.name} (congelado ${tipo === "frito" ? "para fritar" : "assado"}) — ${pack.packSize} un`,
      unidades: pack.packSize,
      preco: pack.price,
      maxSabores: 1,
    })
    let item = ""
    if (!misto) {
      item = ITEM_FORCADO[pack.id] ?? registrarEstoque(tipo, pack.name)
    }
    sabores.push({ linha, sabor: pack.name, item })
  }
}

const itens = [...estoque.values()].sort((a, b) =>
  a.tipo === b.tipo ? a.nome.localeCompare(b.nome, "pt-BR") : a.tipo.localeCompare(b.tipo)
)

const cabecalho = `/**
 * ARQUIVO GERADO — não edite à mão.
 *
 * Origem: src/lib/data/menu.ts
 * Comando: node scripts/gerar-catalogo.mjs
 *
 * Mudou preço, sabor ou faixa? Mude no menu.ts, rode o comando e cole este
 * arquivo de volta no projeto do Apps Script. Depois rode "Don Enrico >
 * Instalar / atualizar planilha" para as abas Catálogo, Sabores e Estoque
 * absorverem a mudança sem perder pedido nem movimento já lançado.
 */
`

const corpo =
  cabecalho +
  `\nconst CATALOGO = ${JSON.stringify(catalogo, null, 2)}\n` +
  `\nconst SABORES = ${JSON.stringify(sabores, null, 2)}\n` +
  `\nconst ITENS_ESTOQUE = ${JSON.stringify(itens, null, 2)}\n`

writeFileSync(new URL("../apps-script/Catalogo.gs", import.meta.url), corpo)

process.stdout.write(
  `apps-script/Catalogo.gs gerado: ${catalogo.length} SKUs, ` +
    `${sabores.length} pares linha/sabor, ${itens.length} itens de estoque.\n`
)
