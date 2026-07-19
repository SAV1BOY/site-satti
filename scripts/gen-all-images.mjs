/* gen-all-images.mjs — orquestra o pipeline W5 completo (§5.B).
   Para cada asset do escopo v1, chama gen-image.mjs com prompt/size/
   budget/path do MANIFEST. Sem OPENAI_API_KEY cada chamada cai no
   placeholder blueprint (nunca bloqueia). Ao final roda check-budgets.
   Rodar: node scripts/gen-all-images.mjs
   FORA do escopo (nunca gerados): A9 founder (foto real do Miguel),
   posters/vídeos P1-P3 e screenshots do portfólio (REAIS — L6). */

import { execFileSync } from "node:child_process";

const ASSETS = [
  // A7 — cards de serviço 4:5 (≤180 KB)
  { prompt: "prompts/A7-agents.txt", size: "1200x1500", out: "public/img/services/agents.webp", budget: 180, label: "[ A7 · AGENTS · 4:5 ]" },
  { prompt: "prompts/A7-products.txt", size: "1200x1500", out: "public/img/services/products.webp", budget: 180, label: "[ A7 · PRODUCTS · 4:5 ]" },
  { prompt: "prompts/A7-data.txt", size: "1200x1500", out: "public/img/services/data.webp", budget: 180, label: "[ A7 · DATA · 4:5 ]" },
  // A8 — texturas do banner 1:1 (≤120 KB)
  { prompt: "prompts/A8-texture-1.txt", size: "900x900", out: "public/img/texture-1.webp", budget: 120, label: "[ A8 · T1 · 1:1 ]" },
  { prompt: "prompts/A8-texture-2.txt", size: "900x900", out: "public/img/texture-2.webp", budget: 120, label: "[ A8 · T2 · 1:1 ]" },
  // Posters A1-A6 — 1º frame dos vídeos futuros (§8)
  { prompt: "prompts/A1-hero-poster.txt", size: "1920x1080", out: "public/media/hero-poster.webp", budget: 200, label: "[ A1 · HERO · 16:9 ]" },
  { prompt: "prompts/A2-stat-1.txt", size: "640x640", out: "public/media/stats/stat-1-poster.webp", budget: 100, label: "[ A2 · STAT 1 ]" },
  { prompt: "prompts/A3-stat-2.txt", size: "640x640", out: "public/media/stats/stat-2-poster.webp", budget: 100, label: "[ A3 · STAT 2 ]" },
  { prompt: "prompts/A4-stat-3.txt", size: "640x640", out: "public/media/stats/stat-3-poster.webp", budget: 100, label: "[ A4 · STAT 3 ]" },
  { prompt: "prompts/A5-stat-4.txt", size: "640x640", out: "public/media/stats/stat-4-poster.webp", budget: 100, label: "[ A5 · STAT 4 ]" },
  { prompt: "prompts/A6-phone-poster.txt", size: "750x1500", out: "public/media/phone-poster.webp", budget: 100, label: "[ A6 · PHONE ]" },
];

const hasKey = Boolean(process.env.OPENAI_API_KEY);
console.log(
  hasKey
    ? "OPENAI_API_KEY presente — gerando via API.\n"
    : "OPENAI_API_KEY AUSENTE — todos os assets sairão como placeholder blueprint (Apêndice B).\n",
);

let failures = 0;
for (const a of ASSETS) {
  try {
    execFileSync(
      process.execPath,
      [
        "scripts/gen-image.mjs",
        "--prompt-file", a.prompt,
        "--size", a.size,
        "--out", a.out,
        "--budget", String(a.budget),
        "--label", a.label,
      ],
      { stdio: "inherit" },
    );
  } catch {
    failures++;
    console.error(`FALHOU: ${a.out}`);
  }
}

console.log("\n=== check-budgets ===");
execFileSync(process.execPath, ["scripts/check-budgets.mjs"], {
  stdio: "inherit",
});

if (failures > 0) process.exit(1);
