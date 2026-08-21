import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ferramentas vendorizadas do stack de design (skills do Claude Code) e
    // scripts Node de apoio: não são código da aplicação e seguem outro estilo,
    // então poluíam o lint com erros que ninguém ia corrigir.
    ".claude/**",
    "src/ui-ux-pro-max/**",
  ]),
]);

export default eslintConfig;
