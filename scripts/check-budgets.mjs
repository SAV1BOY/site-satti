/* check-budgets.mjs — valida os budgets de mídia do MANIFEST (L4).
   PR/gate falha (exit 1) se qualquer asset EXISTENTE estourar a tabela.
   Arquivo ausente = deferido (§8), não falha — aparece como "—".
   Rodar: node scripts/check-budgets.mjs */

import { globSync, statSync } from "node:fs";

const KB = 1024;
const MB = 1024 * KB;

/** Tabela do MANIFEST.md (§8 + W5). pattern → budget em bytes. */
const BUDGETS = [
  { pattern: "public/media/hero.mp4", max: 1.2 * MB },
  { pattern: "public/media/stats/stat-*.mp4", max: 200 * KB },
  { pattern: "public/media/phone.mp4", max: 250 * KB },
  { pattern: "public/media/portfolio-*.mp4", max: 1 * MB },
  { pattern: "public/img/services/*.webp", max: 180 * KB },
  { pattern: "public/img/texture-*.webp", max: 120 * KB },
  { pattern: "public/img/founder.webp", max: 200 * KB },
  { pattern: "public/img/portfolio/shot-*.webp", max: 250 * KB },
  // Posters (§8): entram no load inicial — teto conservador.
  { pattern: "public/media/hero-poster.webp", max: 200 * KB },
  { pattern: "public/media/stats/stat-*-poster.webp", max: 100 * KB },
  { pattern: "public/media/phone-poster.webp", max: 100 * KB },
  { pattern: "public/media/portfolio-*-poster.webp", max: 150 * KB },
];

const fmt = (bytes) =>
  bytes >= MB ? `${(bytes / MB).toFixed(2)} MB` : `${(bytes / KB).toFixed(1)} KB`;

let failures = 0;
let checked = 0;
let totalBytes = 0;

for (const { pattern, max } of BUDGETS) {
  const files = globSync(pattern);
  if (files.length === 0) {
    console.log(`  — ${pattern} (deferido)`);
    continue;
  }
  for (const file of files) {
    const size = statSync(file).size;
    checked++;
    totalBytes += size;
    const ok = size <= max;
    if (!ok) failures++;
    console.log(
      `${ok ? "  OK" : "FAIL"} ${file} — ${fmt(size)} / máx ${fmt(max)}`,
    );
  }
}

console.log(
  `\n${checked} assets verificados · ${fmt(totalBytes)} somados · ${failures} violações`,
);

if (failures > 0) {
  console.error("\nBUDGET ESTOURADO (L4) — corrija antes do merge.");
  process.exit(1);
}
