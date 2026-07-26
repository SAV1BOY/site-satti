/* gen-report.mjs — gera as seções DERIVÁVEIS do RELATORIO-FINAL-v2 (§10 do ULTRAGOAL).
 *
 *   node scripts/gen-report.mjs > docs/report-sections.md
 *
 * Por que gerar em vez de escrever à mão: três tabelas do relatório são a projeção de
 * arquivos que mudam a cada wave — a tabela de swap de terceiros sai de
 * lib/third-party-assets.json, a de `[CONFIRMAR]` sai dos dois JSON de conteúdo, e a de
 * vídeos sai do MANIFEST + do que existe em disco. Escritas à mão, dessincronizam na
 * primeira wave seguinte e o relatório passa a mentir. Geradas, não.
 *
 * O que este script NÃO faz: números medidos (Lighthouse, payload, parity). Esses vêm da
 * verificação real e entram à mão no relatório, com a evidência ao lado.
 */

import { readFileSync, existsSync, statSync, globSync } from "node:fs";

const KB = 1024;
const MB = 1024 * KB;
const fmt = (b) => (b >= MB ? `${(b / MB).toFixed(2)} MB` : `${(b / KB).toFixed(1)} KB`);

const decl = JSON.parse(readFileSync("lib/third-party-assets.json", "utf8"));
const pt = JSON.parse(readFileSync("content/home.pt-BR.json", "utf8"));

/* ---------------------------------------------------- 1 · [CONFIRMAR] pendentes */

/** Varre a árvore de copy procurando os campos { value, confirm: true }. */
function collectConfirm(node, path = []) {
  const out = [];
  if (node && typeof node === "object") {
    if (!Array.isArray(node) && node.confirm === true) {
      out.push({ key: path.join("."), value: String(node.value ?? ""), draft: node.draft ?? null });
      return out;
    }
    for (const [k, v] of Object.entries(node)) {
      out.push(...collectConfirm(v, [...path, Array.isArray(node) ? `[${k}]` : k]));
    }
  }
  return out;
}

const confirms = collectConfirm(pt);
/* Agrupa por seção (o 1º segmento da chave) para o Miguel ler por dobra, não por chave. */
const bySection = new Map();
for (const c of confirms) {
  const sec = c.key.split(".")[0];
  if (!bySection.has(sec)) bySection.set(sec, []);
  bySection.get(sec).push(c);
}

console.log("## `[CONFIRMAR]` pendentes — o que destrava o modo `final` completo\n");
console.log(
  "> O modo `final` já funciona: ele **omite** com elegância o que não tem copy oficial\n" +
    "> (DEC-012). Cada item cravado abaixo REAPARECE no site. Total: **" +
    confirms.length +
    " campos** em " +
    bySection.size +
    " seções.\n",
);
console.log("| Seção | Campo | Estado | Rascunho existente |");
console.log("|---|---|---|---|");
for (const [sec, items] of [...bySection].sort()) {
  for (const it of items) {
    const key = it.key.slice(sec.length + 1) || "(raiz)";
    console.log(
      `| \`${sec}\` | \`${key}\` | ${it.value.replace(/\|/g, "\\|")} | ${it.draft ? it.draft.replace(/\n/g, " ").replace(/\|/g, "\\|") : "—"} |`,
    );
  }
}

/* ------------------------------------------------ 2 · tabela de swap de terceiros */

console.log("\n## Assets do modelo estrutural — tabela de swap (V2-D2 / DEC-017)\n");
console.log(
  "> Estes assets entram em **preview** para que a paridade possa ser avaliada, e o modo\n" +
    "> `final` os omite ou substitui — nada aqui chega a `sattiai.com`. O gate\n" +
    "> `npm run thirdparty` falha o build se algum puder vazar. `finalMode` diz o que acontece\n" +
    "> em produção: **omit** = o elemento não renderiza · **placeholder** = renderiza o\n" +
    "> blueprint da SATTI.\n",
);
console.log("| # | Seção | Path | Em disco | `final` | O que o Miguel precisa produzir |");
console.log("|---|---|---|---|---|---|");
let i = 0;
for (const a of decl.assets) {
  i++;
  const files = a.pathGlob ? globSync(a.pathGlob) : a.path && existsSync(a.path) ? [a.path] : [];
  const bytes = files.reduce((n, f) => n + statSync(f).size, 0);
  const disk = files.length
    ? `${files.length}× · ${fmt(bytes)}`
    : "— (diferido)";
  console.log(
    `| ${i} | \`${a.section}\` | \`${(a.path ?? a.pathGlob).replace(/^public/, "")}\` | ${disk} | **${a.finalMode}** | ${a.swapTarget} |`,
  );
}

console.log("\n### Excluídos até em preview (DEC-017)\n");
console.log(
  "> Para estes, \"marcar e trocar depois\" não resolve o problema, porque o problema não é\n" +
    "> direito autoral de composição. Nunca foram importados.\n",
);
console.log("| Grupo | Por quê | O que renderiza no lugar |");
console.log("|---|---|---|");
for (const e of decl.excludedEvenInPreview.items) {
  console.log(`| \`${e.id}\` | ${e.reason} | ${e.renders} |`);
}

/* ------------------------------------------------------- 3 · vídeos a substituir */

const VIDEOS = [
  ["A1 · Hero (fundo do card)", "public/media/hero.mp4", 1.2 * MB, 1280, 720, 10],
  ["A2 · Stat-card 1", "public/media/stats/stat-1.mp4", 200 * KB, 320, 320, 4],
  ["A3 · Stat-card 2", "public/media/stats/stat-2.mp4", 200 * KB, 320, 320, 4],
  ["A4 · Stat-card 3", "public/media/stats/stat-3.mp4", 200 * KB, 320, 320, 4],
  ["A5 · Stat-card 4", "public/media/stats/stat-4.mp4", 200 * KB, 320, 320, 4],
  ["A6 · Vídeo vertical (Automação)", "public/media/phone.mp4", 250 * KB, 368, 796, 6],
  ["P1 · Portfólio 1", "public/media/portfolio-1.mp4", 1 * MB, 720, 720, 8],
  ["P2 · Portfólio 2", "public/media/portfolio-2.mp4", 1 * MB, 720, 720, 8],
  ["P3 · Portfólio 3", "public/media/portfolio-3.mp4", 1 * MB, 720, 720, 8],
  ["SR · Showreel (Hero)", "public/media/showreel.mp4", 1.5 * MB, 1280, 720, 30],
];

console.log("\n## Vídeos — onde soltar cada arquivo e com que comando\n");
console.log(
  "> O markup de cada slot já é FINAL: poster + `data-asset` + path definitivo. Commitar o\n" +
    "> `.mp4` no path faz o vídeo tocar **sem uma linha de código mudar**. Os slots que hoje\n" +
    "> têm bytes do modelo estão na tabela de swap acima.\n",
);
console.log("| Slot | Path | Budget | Em disco hoje |");
console.log("|---|---|---|---|");
for (const [name, path, max] of VIDEOS) {
  const has = existsSync(path);
  console.log(
    `| ${name} | \`${path.replace(/^public/, "")}\` | ≤ ${fmt(max)} | ${has ? fmt(statSync(path).size) : "— (diferido)"} |`,
  );
}

console.log("\n### Comandos prontos (2-pass, sem áudio, faststart)\n");
console.log(
  "Não-negociáveis em todo encode: `-an` (autoplay muted não precisa de faixa de áudio e ela\n" +
    "custa bytes + risco de autoplay no iOS) · `format=yuv420p` (o Safari recusa 4:2:2/4:4:4) ·\n" +
    "`-movflags +faststart` (moov no início, playback começa antes do download acabar) ·\n" +
    "`-g`/`-keyint_min` fixos com `-sc_threshold 0` (seek previsível e ponto de loop limpo).\n",
);
console.log("```bash");
for (const [name, path, max, w, h, secs] of VIDEOS) {
  const kbps = Math.floor(((max * 0.85) / secs / 1000) * 8);
  const crop = w === h ? `crop='min(iw,ih)':'min(iw,ih)',` : "";
  console.log(`# ${name} — alvo ${w}×${h}, ${secs}s, ~${kbps} kbps → ${fmt(max * 0.85)}`);
  console.log(`IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=${path}`);
  console.log(
    `V="${crop}scale=${w}:${h === 720 && w !== h ? "-2" : h}:flags=lanczos,fps=24,format=yuv420p"`,
  );
  console.log(
    `ffmpeg -y -ss $SS -t ${secs} -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \\\n` +
      `  -preset veryslow -b:v ${kbps}k -pass 1 -passlogfile /tmp/p -f null -`,
  );
  console.log(
    `ffmpeg -y -ss $SS -t ${secs} -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \\\n` +
      `  -preset veryslow -b:v ${kbps}k -maxrate ${Math.floor(kbps * 1.3)}k -bufsize ${kbps * 2}k \\\n` +
      `  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"`,
  );
  console.log("");
}
console.log("# Poster de qualquer um deles — SEMPRE do .mp4 já codificado (poster ≡ frame 0)");
console.log("ffmpeg -y -i public/media/hero.mp4 -frames:v 1 -q:v 2 /tmp/f.png");
console.log("node scripts/import-ref-assets.mjs --only poster/hero   # sharp → webp no budget");
console.log("node scripts/check-budgets.mjs                          # o gate");
console.log("```");

console.log("\n---\n");
console.log(
  `_Gerado por \`node scripts/gen-report.mjs\` a partir de \`lib/third-party-assets.json\`,\n` +
    `\`content/home.pt-BR.json\` e do estado real de \`public/\`. ${confirms.length} campos ` +
    `\`[CONFIRMAR]\` · ${decl.assets.length} assets declarados · ` +
    `${VIDEOS.filter(([, p]) => existsSync(p)).length}/${VIDEOS.length} slots de vídeo preenchidos._`,
);
