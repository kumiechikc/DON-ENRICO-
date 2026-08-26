/**
 * Junta o contexto inteiro do projeto num arquivo só, para levar embora.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE GERAR EM VEZ DE ESCREVER
 *
 * O dono pediu "todo o contexto desta conversa" para levar a outro repositório.
 * O caminho óbvio seria sentar e escrever um documento novo com tudo dentro.
 *
 * Seria o erro que este projeto passou meses evitando: duas cópias da mesma
 * verdade. No dia em que o prazo mudasse, ou uma decisão fosse revista, o
 * arquivo grande continuaria dizendo o que era verdade em agosto — e ele tem
 * cara de autoridade justamente por ser completo. Contexto errado com cara de
 * completo é pior que contexto nenhum.
 *
 * Então isto não escreve nada. Costura o que já existe, na ordem em que faz
 * sentido ler, e o `npm run contexto` regera. Mesma disciplina do
 * `apps-script/Catalogo.gs`, que sai do `menu.ts`: uma fonte, um gerador, e o
 * CI reprovando se alguém editar a saída à mão.
 *
 * A SAÍDA É FUNÇÃO PURA DAS FONTES, E ISSO CUSTOU UM CI VERMELHO
 *
 * A primeira versão carimbava `git rev-parse --short HEAD` dentro do documento,
 * para dar para saber de quando aquele retrato era. Parecia gentileza e era um
 * defeito: no CI o HEAD é o commit de MERGE do pull request, não o commit de
 * onde alguém gerou. O arquivo saía diferente lá e o `git diff --exit-code`
 * reprovava sempre — a conferência que existe para provar que o arquivo está em
 * dia tinha virado impossível de passar.
 *
 * Localmente ela passava, porque ali o HEAD e a origem da geração são o mesmo
 * commit. Foi o CI que expôs, e por isso a regra fica escrita aqui: nada que
 * dependa de ONDE o gerador roda entra na saída. Só as seis fontes. De quando é
 * o retrato, o histórico do arquivo responde.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const RAIZ = join(import.meta.dirname, "..")
const SAIDA = join(RAIZ, "CONTEXTO-COMPLETO.md")

/*
 * A ordem é de leitura, não de importância: quem chega precisa saber o que é o
 * negócio antes de entender por que uma decisão foi tomada, e precisa das
 * decisões antes de entender por que um beco é beco.
 */
const PARTES = [
  {
    ancora: "marca",
    titulo: "A marca, o produto e o retrato do negócio",
    arquivo: "CONTEXTO.md",
    nota: "Quem é a Don Enrico, o que ela vende e como atende.",
  },
  {
    ancora: "negocio",
    titulo: "Os fatos, com a fonte de cada um",
    arquivo: "cerebro/NEGOCIO.md",
    nota: "Só entra aqui o que tem fonte. Palpite mora na parte 5.",
  },
  {
    ancora: "decisoes",
    titulo: "As decisões, e o que foi descartado junto",
    arquivo: "cerebro/DECISOES.md",
    nota: "A metade descartada é a que impede refazer a escolha errada.",
  },
  {
    ancora: "becos",
    titulo: "Os becos sem saída, com o número que provou",
    arquivo: "cerebro/BECOS.md",
    nota: "O que nenhuma outra fonte tem: o que já foi tentado e falhou.",
  },
  {
    ancora: "travado",
    titulo: "O que espera resposta, em ordem de valor",
    arquivo: "cerebro/TRAVADO.md",
    nota: "Cada item diz o que a resposta destrava.",
  },
  {
    ancora: "trabalho",
    titulo: "Como o trabalho é feito neste repositório",
    arquivo: "CLAUDE.md",
    nota: "O loop de design, as conferências e a regra de entrega.",
  },
]

/**
 * Rebaixa os títulos em um nível, sem tocar no que está dentro de bloco de
 * código.
 *
 * O detalhe do bloco de código não é preciosismo: os arquivos têm exemplos de
 * shell com comentário `# assim`, e rebaixar um comentário de shell para `##`
 * mudaria o comando que alguém vai copiar e colar.
 */
function rebaixar(texto) {
  let dentroDeCodigo = false
  return texto
    .split("\n")
    .map((linha) => {
      if (/^\s*```/.test(linha)) {
        dentroDeCodigo = !dentroDeCodigo
        return linha
      }
      if (dentroDeCodigo) return linha
      return /^#{1,5} /.test(linha) ? `#${linha}` : linha
    })
    .join("\n")
}

/**
 * Liga os apontamentos entre arquivos às âncoras deste documento.
 *
 * Sem isto, "ver `TRAVADO.md`" vira um link quebrado no arquivo costurado, e
 * quem levou o contexto embora não tem o TRAVADO.md do lado para abrir.
 */
function religar(texto) {
  let saida = texto
  for (const { ancora, arquivo } of PARTES) {
    const nome = arquivo.split("/").pop()
    // Cobre "NEGOCIO.md", "cerebro/NEGOCIO.md" e "../CONTEXTO.md".
    const alvo = new RegExp(`\\]\\((?:\\.\\./)?(?:cerebro/)?${nome}\\)`, "g")
    saida = saida.replace(alvo, `](#${ancora})`)
  }
  return saida
}

const indice = PARTES.map(
  (p, i) => `${i + 1}. [${p.titulo}](#${p.ancora}) — ${p.nota}`
).join("\n")

/**
 * Lê uma parte, e falha dizendo o nome dela.
 *
 * Sem isto, uma parte renomeada ou apagada derruba o script com um ENOENT cru,
 * e quem estiver lendo a saída do CI vê um caminho de arquivo sem saber que ele
 * era uma das seis costuras deste documento.
 */
function lerParte(p) {
  try {
    return readFileSync(join(RAIZ, p.arquivo), "utf8").trimEnd()
  } catch {
    console.error(
      `\nNão achei \`${p.arquivo}\`, que é a fonte da parte "${p.titulo}".\n` +
        `Se o arquivo mudou de lugar, atualize PARTES em scripts/exportar-contexto.mjs.\n`
    )
    process.exit(1)
  }
}

const corpo = PARTES.map((p) => {
  const bruto = lerParte(p)
  return [
    `<a id="${p.ancora}"></a>`,
    "",
    `## Parte ${PARTES.indexOf(p) + 1} — ${p.titulo}`,
    "",
    `> Fonte: \`${p.arquivo}\`. Para mudar qualquer coisa desta parte, mude lá.`,
    "",
    religar(rebaixar(bruto)),
  ].join("\n")
}).join("\n\n---\n\n")

const documento = `# Don Enrico Lanches — contexto completo

> **Este arquivo é gerado. Não edite à mão.**
>
> Ele é a costura de seis arquivos do repositório \`kumiechikc/DON-ENRICO-\`, cada
> um deles a fonte da sua parte. Editar aqui é escrever numa cópia: a mudança
> some na próxima vez que alguém rodar \`npm run contexto\`, e até lá as duas
> versões discordam em silêncio.
>
> Para saber de quando é este retrato, veja o histórico do arquivo no repositório.
> Ele não carimba data nem commit aqui dentro, e isso é de propósito: a saída
> precisa ser uma função pura das seis fontes, senão a conferência que garante que
> ela está em dia não teria como passar.

## Para que serve

Levar o projeto inteiro na cabeça para outro lugar: outro repositório, outra
ferramenta, uma sessão de IA que começa do zero, ou uma pessoa que nunca ouviu
falar da Don Enrico.

Sessão de IA perde memória — o contexto antigo é resumido para caber, e o resumo
joga fora justamente o que era barato de anotar e caro de redescobrir, que é o
motivo. Este arquivo é a defesa contra isso.

**Nada aqui foi inventado.** Onde falta informação, está escrito que falta, e a
parte 5 lista tudo que ainda espera resposta do dono. Contexto com buraco honesto
é utilizável; contexto com buraco tapado por palpite contamina tudo que for
construído em cima dele.

## O que tem dentro

${indice}

---

${corpo}
`

writeFileSync(SAIDA, documento)

const linhas = documento.split("\n").length
console.log(`\nCONTEXTO-COMPLETO.md: ${PARTES.length} partes, ${linhas} linhas.\n`)
