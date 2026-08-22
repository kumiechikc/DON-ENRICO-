#!/usr/bin/env node
/**
 * Confere se o site exportado aponta para arquivos que existem.
 *
 *   GITHUB_PAGES=true npm run build && npm run check:export
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DEFEITO QUE ISTO EXISTE PARA PEGAR
 *
 * No GitHub Pages o site mora em `/DON-ENRICO-/`, não na raiz do domínio. O Next
 * prefixa sozinho o que ele gera e o que passa pelo `next/image`, mas NÃO
 * prefixa caminho escrito à mão para arquivo de `public/`.
 *
 * Um `/cinema/corte.webm` sai do build exatamente assim, o navegador procura na
 * raiz do domínio, e o arquivo responde 404. O build passa. O lint passa. O
 * `npm run check` passa, porque em desenvolvimento não há prefixo nenhum e o
 * caminho está certo. Só quebra no ar, onde ninguém está olhando.
 *
 * Foi exatamente o que aconteceu com o pôster do primeiro clipe, e só apareceu
 * porque fui olhar o HTML exportado com o olho. Isto é esse olhar, mecânico.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const saida = join(raiz, "out")

/*
 * Só caminhos com extensão de arquivo. Link de página (`/DON-ENRICO-/`) e
 * âncora (`#festa`) não são arquivo, e tratá-los como tal daria falso positivo
 * a cada rodada — o tipo de ruído que faz uma conferência ser ignorada.
 */
const EXTENSOES = /\.(webp|jpe?g|png|gif|svg|ico|mp4|webm|woff2?|css|js|xml|txt|json|pdf)$/i

function paginas(dir) {
  const achadas = []
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) achadas.push(...paginas(caminho))
    else if (nome.endsWith(".html")) achadas.push(caminho)
  }
  return achadas
}

export function checkExport() {
  const failures = []
  const notes = []

  if (!existsSync(saida)) {
    failures.push(
      "não achei out/ — rode `GITHUB_PAGES=true npm run build` antes desta conferência"
    )
    return { failures, notes }
  }

  const html = paginas(saida)
  const referencias = new Map() // caminho -> páginas que o citam

  for (const pagina of html) {
    const texto = readFileSync(pagina, "utf8")
    for (const achado of texto.matchAll(/(?:src|href|content)="(\/[^"]*)"/g)) {
      // O `?v=` que o Next põe em alguns arquivos não faz parte do nome.
      const caminho = achado[1].split("?")[0]
      if (!EXTENSOES.test(caminho)) continue
      if (!referencias.has(caminho)) referencias.set(caminho, new Set())
      referencias.get(caminho).add(pagina.slice(saida.length + 1))
    }
  }

  /*
   * O prefixo sai do próprio HTML, não de uma constante: é o que o Next
   * realmente escreveu para os arquivos que ele controla. Assim a conferência
   * continua valendo se o nome do repositório mudar.
   */
  const comPrefixo = [...referencias.keys()].find((c) => c.includes("/_next/"))
  const prefixo = comPrefixo ? comPrefixo.slice(0, comPrefixo.indexOf("/_next/")) : ""

  notes.push(
    `${html.length} página(s), ${referencias.size} arquivo(s) referenciado(s)` +
      (prefixo ? `, prefixo "${prefixo}"` : ", sem prefixo (build de raiz)")
  )

  for (const [caminho, citacoes] of referencias) {
    const paginasQueCitam = [...citacoes].join(", ")
    /*
     * O caminho no HTML já vem com o prefixo; tirá-lo dá o lugar do arquivo
     * dentro de out/. Quem NÃO tem o prefixo aponta para fora do site, e é
     * justamente esse o defeito.
     */
    if (prefixo && !caminho.startsWith(prefixo + "/")) {
      failures.push(
        `"${caminho}" não tem o prefixo "${prefixo}" — no ar isso vai para a raiz ` +
          `do domínio e responde 404 (citado em ${paginasQueCitam})`
      )
      continue
    }
    const relativo = prefixo ? caminho.slice(prefixo.length) : caminho
    if (!existsSync(join(saida, relativo))) {
      failures.push(
        `"${caminho}" não existe no export (citado em ${paginasQueCitam})`
      )
    }
  }

  if (failures.length === 0) {
    notes.push("todo arquivo referenciado tem o prefixo certo e existe no export")
  }
  return { failures, notes }
}

const { failures, notes } = checkExport()
process.stdout.write("\n── Site exportado ─────────────────────────────────\n")
notes.forEach((n) => process.stdout.write(`   ${n}\n`))
failures.forEach((f) => process.stdout.write(`   ✗ ${f}\n`))
process.stdout.write(`\n${"═".repeat(56)}\n`)
process.stdout.write(
  failures.length === 0 ? "Export sem problemas.\n" : `${failures.length} problema(s).\n`
)
process.exit(failures.length === 0 ? 0 : 1)
