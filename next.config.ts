import type { NextConfig } from "next";

// GitHub Pages serves static files with no Node server, so the Pages build exports
// static HTML and prefixes every asset/link with the repo name (project pages are
// served from a /<repo> subpath, not the domain root).
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const repoName = "DON-ENRICO-";

const nextConfig: NextConfig = {
  ...(isGithubPagesBuild
    ? {
        output: "export",
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
