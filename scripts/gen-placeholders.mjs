/* Placeholders blueprint do DS nos paths FINAIS do MANIFEST (§5.B fallback).
   Fundo tint-slate #ECEEF2, grade 1px #E3E6EB, cruz central, rótulo mono steel.
   W5 (gen-image.mjs) substitui os gerados por IA; screenshots/vídeos reais
   ficam com o Miguel (§8). Rodar: node scripts/gen-placeholders.mjs */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ASSETS = [
  // A7 — cards de serviço 4:5
  { out: "public/img/services/agents.webp", w: 1200, h: 1500, label: "[ A7 · AGENTS · 4:5 ]" },
  { out: "public/img/services/products.webp", w: 1200, h: 1500, label: "[ A7 · PRODUCTS · 4:5 ]" },
  { out: "public/img/services/data.webp", w: 1200, h: 1500, label: "[ A7 · DATA · 4:5 ]" },
  // A8 — texturas banner 1:1
  { out: "public/img/texture-1.webp", w: 900, h: 900, label: "[ A8 · T1 · 1:1 ]" },
  { out: "public/img/texture-2.webp", w: 900, h: 900, label: "[ A8 · T2 · 1:1 ]" },
  // A9 — retrato 4:5
  { out: "public/img/founder.webp", w: 1200, h: 1500, label: "[ A9 · 4:5 ]" },
  // Screenshots portfólio 16:10 (REAIS depois — placeholder até lá)
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    out: `public/img/portfolio/shot-${n}.webp`,
    w: 1280, h: 800,
    label: `[ P${n} · 16:10 ]`,
  })),
  // Posters de vídeo (1º frame virá dos prompts A1-A6 no W5)
  { out: "public/media/hero-poster.webp", w: 1920, h: 1080, label: "[ A1 · HERO · 16:9 ]" },
  ...[1, 2, 3, 4].map((n) => ({
    out: `public/media/stats/stat-${n}-poster.webp`,
    w: 640, h: 640,
    label: `[ A${n + 1} · STAT ${n} ]`,
  })),
  { out: "public/media/phone-poster.webp", w: 750, h: 1500, label: "[ A6 · PHONE ]" },
  ...[1, 2, 3].map((n) => ({
    out: `public/media/portfolio-${n}-poster.webp`,
    w: 1280, h: 800,
    label: `[ P${n} · POSTER ]`,
  })),
];

const GRID = 64;

function blueprintSvg(w, h, label) {
  const vLines = Array.from(
    { length: Math.floor(w / GRID) },
    (_, i) => `<line x1="${(i + 1) * GRID}" y1="0" x2="${(i + 1) * GRID}" y2="${h}"/>`,
  ).join("");
  const hLines = Array.from(
    { length: Math.floor(h / GRID) },
    (_, i) => `<line x1="0" y1="${(i + 1) * GRID}" x2="${w}" y2="${(i + 1) * GRID}"/>`,
  ).join("");
  const fontSize = Math.max(14, Math.round(Math.min(w, h) / 42));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="#ECEEF2"/>
  <g stroke="#E3E6EB" stroke-width="1">${vLines}${hLines}</g>
  <g stroke="#6E7480" stroke-width="1.5">
    <line x1="${w / 2 - 24}" y1="${h / 2}" x2="${w / 2 + 24}" y2="${h / 2}"/>
    <line x1="${w / 2}" y1="${h / 2 - 24}" x2="${w / 2}" y2="${h / 2 + 24}"/>
  </g>
  <text x="${w / 2}" y="${h / 2 + 56}" text-anchor="middle" font-family="monospace"
    font-size="${fontSize}" letter-spacing="2" fill="#6E7480">${label}</text>
</svg>`);
}

let total = 0;
for (const a of ASSETS) {
  await mkdir(path.dirname(a.out), { recursive: true });
  const info = await sharp(blueprintSvg(a.w, a.h, a.label))
    .webp({ quality: 72 })
    .toFile(a.out);
  total += info.size;
  console.log(`${a.out} — ${(info.size / 1024).toFixed(1)} KB`);
}
console.log(`TOTAL: ${(total / 1024).toFixed(1)} KB em ${ASSETS.length} assets`);
