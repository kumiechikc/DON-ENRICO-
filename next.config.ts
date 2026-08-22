import type { NextConfig } from "next";

// GitHub Pages serves static files with no Node server, so the Pages build exports
// static HTML and prefixes every asset/link with the repo name (project pages are
// served from a /<repo> subpath, not the domain root).
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const repoName = "DON-ENRICO-";
const basePath = isGithubPagesBuild ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  /*
   * O prefixo precisa chegar ao código, e não só à configuração.
   *
   * O `assetPrefix` do Next cobre o que ele mesmo gera (`_next/`), e o
   * `next/image` cobre o que passa por ele. O que NÃO é coberto é caminho
   * escrito à mão para arquivo de `public/`: um `/cinema/corte.webm` continua
   * `/cinema/corte.webm` no HTML exportado, e no GitHub Pages isso aponta para
   * fora do site — 404 no ar, com o build passando sem reclamar.
   *
   * Daí esta variável: quem monta caminho de `public/` usa `arquivoPublico()`,
   * de `src/lib/caminho-publico.ts`, que lê daqui.
   */
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  ...(isGithubPagesBuild
    ? {
        output: "export",
        basePath,
        assetPrefix: `${basePath}/`,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
