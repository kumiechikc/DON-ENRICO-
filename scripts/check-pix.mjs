#!/usr/bin/env node
/**
 * Verificação do BR Code do Pix.
 *
 *   npm run check:pix
 *
 * Um Pix errado é o pior tipo de erro deste projeto: o código continua
 * parecendo um QR Code normal, o cliente aponta o celular, e só o banco dele
 * diz que não deu. Ninguém do nosso lado fica sabendo. Então a conferência aqui
 * não olha "se parece certo", ela desmonta o código de volta campo a campo.
 *
 * Sem golden string copiada de lugar nenhum: o que se verifica é o algoritmo
 * (o CRC tem valor de conferência público) e a estrutura (todo campo declara o
 * próprio tamanho, então o código tem que ser legível de volta sem sobra).
 */
import {
  gerarBrCode,
  lerBrCode,
  brCodeValido,
  crc16,
} from "../src/lib/pix/br-code.ts"

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

/**
 * Lê o código e, se ele estiver malformado, reporta como falha em vez de
 * estourar.
 *
 * A diferença importa: `lerBrCode` levanta exceção quando um campo mente o
 * próprio tamanho, e uma exceção solta aqui derruba a suíte inteira com um
 * stack trace. Quem for ler isso às duas da manhã precisa da linha dizendo o
 * que quebrou, não do rastro de pilha do Node.
 */
function ler(codigo, descricao) {
  try {
    return lerBrCode(codigo)
  } catch (erro) {
    falhas++
    checagens++
    process.stdout.write(`   ✗ ${descricao} não é legível — ${erro.message}\n`)
    return {}
  }
}

/* ────────────────────────────── o checksum ──────────────────────────── */

secao("CRC-16/CCITT-FALSE")

/*
 * "123456789" tem valor de conferência 0x29B1 nesta variante do CRC-16. É o
 * teste que separa CCITT-FALSE das outras meia dúzia de variantes de CRC-16,
 * que só diferem no valor inicial e no espelhamento — e que produziriam um
 * código com aparência perfeita e checksum recusado pelo banco.
 */
ok(crc16("123456789") === "29B1", "valor de conferência do padrão", crc16("123456789"))
ok(crc16("") === "FFFF", "texto vazio devolve o valor inicial", crc16(""))
ok(crc16("A") !== crc16("B"), "entradas diferentes dão CRCs diferentes")

/* ─────────────────────────── estrutura do código ─────────────────────── */

secao("Estrutura do BR Code")

const base = {
  chave: "51999999999",
  nome: "Don Enrico Lanches",
  cidade: "Porto Alegre",
}

const comValor = gerarBrCode({ ...base, valor: 69.9, identificador: "A7K2" })
const campos = ler(comValor, "código com valor")

ok(brCodeValido(comValor), "o CRC do próprio código confere")
ok(campos["00"] === "01", "indicador de formato")
ok(campos["01"] === "12", "marcado como de uso único")
ok(campos["52"] === "0000", "categoria não informada")
ok(campos["53"] === "986", "moeda é o real")
ok(campos["58"] === "BR", "país")
ok(campos["59"] === "DON ENRICO LANCHES", "nome do recebedor", campos["59"])
ok(campos["60"] === "PORTO ALEGRE", "cidade do recebedor", campos["60"])
ok(campos["54"] === "69.90", "valor com ponto e dois decimais", campos["54"])

const conta = ler(campos["26"] ?? "", "template da conta")
ok(conta["00"] === "br.gov.bcb.pix", "identificador do arranjo Pix", conta["00"])
ok(conta["01"] === base.chave, "a chave vai inteira", conta["01"])

const adicional = ler(campos["62"] ?? "", "template de dados adicionais")
ok(adicional["05"] === "A7K2", "o código do pedido vai como identificador", adicional["05"])

/*
 * Ler de volta sem sobra é a prova de que todo tamanho declarado bate com o
 * conteúdo. Um campo com tamanho errado desalinha tudo que vem depois, e é
 * exatamente o erro que passa despercebido numa conferência visual.
 */
const somaDosCampos = Object.values(campos).reduce((total, valor) => total + valor.length + 4, 0)
ok(somaDosCampos === comValor.length, "o código é lido de volta sem sobra nem falta",
  `${somaDosCampos} de ${comValor.length}`)

/* ────────────────────────────── variações ───────────────────────────── */

secao("Variações de uso")

const semValor = gerarBrCode(base)
ok(brCodeValido(semValor), "código sem valor também é válido")
ok(ler(semValor, "código sem valor")["54"] === undefined, "sem valor, o campo 54 não existe")
ok(
  ler(ler(semValor, "código sem valor")["62"] ?? "", "adicionais sem id")["05"] === "***",
  "sem identificador, a referência é ***"
)

// Valor zero é ausência de valor, não "R$ 0,00": um Pix de zero real é recusado.
ok(ler(gerarBrCode({ ...base, valor: 0 }), "código com valor zero")["54"] === undefined, "valor zero é omitido")

const centavos = ler(gerarBrCode({ ...base, valor: 1234.5 }), "código de 1234,50")["54"]
ok(centavos === "1234.50", "valor quebrado sai com dois decimais", centavos)

/*
 * Acento no nome é o caso mais provável de dar errado na vida real: "Vinícius"
 * e "São Paulo" são a norma, não a exceção. Sai sem acento e em caixa alta,
 * porque é o que o pagador precisa conseguir ler na tela do banco antes de
 * confirmar.
 */
const acentuado = ler(
  gerarBrCode({ chave: "x@y.com", nome: "Padaria Açúcar & Cia", cidade: "São Paulo" }),
  "código com nome acentuado"
)
ok(acentuado["59"] === "PADARIA ACUCAR  CIA", "acento e símbolo saem do nome", acentuado["59"])
ok(acentuado["60"] === "SAO PAULO", "acento sai da cidade", acentuado["60"])

const longo = ler(
  gerarBrCode({
    chave: "x@y.com",
    nome: "Nome Absurdamente Longo De Recebedor",
    cidade: "Cidade Com Nome Enorme Demais",
  }),
  "código com nome longo"
)
ok(longo["59"]?.length === 25, "nome cortado em 25", `${longo["59"]?.length}`)
ok(longo["60"]?.length === 15, "cidade cortada em 15", `${longo["60"]?.length}`)

let recusou = false
try {
  gerarBrCode({ ...base, chave: "   " })
} catch {
  recusou = true
}
ok(recusou, "chave vazia é recusada em vez de gerar código quebrado")

/* ───────────────────────── o código adulterado ──────────────────────── */

secao("Código adulterado")

/*
 * Trocar um caractere no meio tem que quebrar o CRC. Se não quebrasse, o
 * checksum não estaria protegendo nada.
 */
const adulterado =
  comValor.slice(0, 40) + (comValor[40] === "9" ? "8" : "9") + comValor.slice(41)
ok(!brCodeValido(adulterado), "um caractere trocado invalida o código")
ok(!brCodeValido(comValor.slice(0, -1)), "código truncado é inválido")
ok(!brCodeValido(""), "texto vazio é inválido")

/* ───────────────────────────── conclusão ────────────────────────────── */

process.stdout.write(`\n${"═".repeat(56)}\n`)
if (falhas === 0) {
  process.stdout.write(`${checagens} verificações, todas passaram.\n`)
} else {
  process.stdout.write(`${falhas} falha(s) em ${checagens} verificações.\n`)
}
process.exit(falhas === 0 ? 0 : 1)
