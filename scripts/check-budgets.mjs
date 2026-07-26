/* check-budgets.mjs — valida os budgets de mídia do MANIFEST (L4).
   PR/gate falha (exit 1) se qualquer asset EXISTENTE estourar a tabela.
   Arquivo ausente = deferido (§8), não falha — aparece como "—".
   Rodar: node scripts/check-budgets.mjs */

import { globSync, statSync } from "node:fs";

const KB = 1024;
const MB = 1024 * KB;

/** Tabela do MANIFEST.md v2 (§8 + ULTRAGOAL v2). pattern → budget em bytes. */
const BUDGETS = [
  // --- Vídeo ---
  { pattern: "public/media/hero.mp4", max: 1.2 * MB },
  { pattern: "public/media/stats/stat-*.mp4", max: 200 * KB },
  { pattern: "public/media/phone.mp4", max: 250 * KB },
  { pattern: "public/media/portfolio-*.mp4", max: 1 * MB },
  { pattern: "public/media/showreel.mp4", max: 1.5 * MB },
  // --- Posters: entram no load inicial — teto conservador. ---
  { pattern: "public/media/hero-poster.webp", max: 120 * KB },
  { pattern: "public/media/stats/stat-*-poster.webp", max: 24 * KB },
  { pattern: "public/media/phone-poster.webp", max: 40 * KB },
  { pattern: "public/media/showreel-poster.webp", max: 120 * KB },
  /* Os posters de P1-P3 NÃO têm linha própria: o slot visual é o mesmo de
     shot-{1..3} e foi unificado (v2) — 3 assets e 3 budgets a menos. */
  // --- Imagens por seção ---
  { pattern: "public/img/services/*.webp", max: 180 * KB },
  { pattern: "public/img/automation/phone-*.webp", max: 250 * KB },
  { pattern: "public/img/automation/hand.webp", max: 400 * KB },
  { pattern: "public/img/automation/screen-*.webp", max: 120 * KB },
  { pattern: "public/img/portfolio/shot-*.webp", max: 250 * KB },
  { pattern: "public/img/texture-*.webp", max: 40 * KB },
  { pattern: "public/img/cases/thumb-*.webp", max: 120 * KB },
  { pattern: "public/img/reviews/avatar-*.webp", max: 20 * KB },
  /* founder.webp REMOVIDO no v2: nenhuma das duas comps S5 tem o slot A9 e o
     arquivo não era referenciado por componente nenhum (asset órfão). */
  // --- Marca e UI (o selo click-to-play e as setas são SVG inline, não arquivo) ---
  { pattern: "public/icon-*.png", max: 24 * KB },
  { pattern: "app/apple-icon.png", max: 20 * KB },
  { pattern: "app/icon.svg", max: 8 * KB },
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
