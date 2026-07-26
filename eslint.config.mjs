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
    // SATTI: referência de design (handoff read-only) e artefatos de orquestração
    "design/**",
    "tasks/**",
    "audits/**",
    // SATTI v2: material de referência — DOM/CSS/bundles do site-modelo, o
    // starter antigo e o runtime gerado do handoff. Não é código nosso e não
    // entra no git (.gitignore). Sem esta linha o lint reprova em arquivos
    // que ninguém deve editar.
    "Site/**",
    "CHATs WEB/**",
  ]),
]);

export default eslintConfig;
