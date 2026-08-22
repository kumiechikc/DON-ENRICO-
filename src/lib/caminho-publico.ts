/**
 * Monta o caminho de um arquivo de `public/` respeitando o prefixo do site.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE ISTO PRECISA EXISTIR
 *
 * No GitHub Pages o site não mora na raiz do domínio: ele mora em
 * `.../DON-ENRICO-/`. O Next resolve isso sozinho para o que ele mesmo gera
 * (`_next/`, via `assetPrefix`) e para o que passa pelo `next/image`.
 *
 * O que ele NÃO resolve é caminho escrito à mão. Um `/cinema/corte.webm` sai do
 * build exatamente assim, o navegador lê como raiz do domínio, e o arquivo
 * responde 404 — enquanto o build passa sem uma palavra. Foi o que aconteceu
 * com o pôster do primeiro clipe que entrou no ar.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `NEXT_PUBLIC_BASE_PATH` vem do `next.config.ts` e é vazio em desenvolvimento,
 * então em `npm run dev` nada muda — e é por isso que o defeito é invisível
 * localmente e só existe no ar.
 *
 * Os manifestos (`clipes.ts`, `sequencias.ts`) guardam o caminho CRU e não
 * chamam isto: eles são lidos direto pelo Node em `npm run check:midia`, e um
 * import de módulo do app derrubaria a leitura. Quem chama é quem renderiza.
 *
 * Errar isso não depende de disciplina: `npm run check:export` lê o HTML
 * exportado e reprova qualquer caminho sem o prefixo, ou que aponte para
 * arquivo que não existe.
 */
const PREFIXO = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function arquivoPublico(caminho: string): string {
  if (!caminho.startsWith("/")) {
    throw new Error(
      `arquivoPublico espera caminho começando em "/", recebeu "${caminho}"`
    )
  }
  return `${PREFIXO}${caminho}`
}
