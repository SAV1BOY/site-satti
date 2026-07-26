/* make-brand-assets.mjs — emite TODOS os assets de marca a partir de UMA fonte
   de verdade e valida cada saída contra o budget do MANIFEST (L4).

   Rodar: node scripts/make-brand-assets.mjs
          node scripts/make-brand-assets.mjs --check   (não escreve, só audita)

   ── Fonte da marca ─────────────────────────────────────────────────────────
   `Site/BRANDING/logo-factory/out/F1_TE/F1_TEv17.svg` (1.030 B, viewBox
   0 0 1024 1024). Escolhido entre os 20 variantes F1_TE porque (a) é o único
   com render de 32 px validado (`_qa/F1_TEv17_32px.png`) e legibilidade em
   favicon é o critério que decide; (b) margens 222/222/222/222 = 21,7 % de
   padding em todos os lados, satisfazendo a safe zone maskable do Android sem
   re-arte; (c) cobertura de blaze 0,0521, a mais próxima da faixa da
   blaze-law (v18/v19 = 0,0000; v06 = 0,1146). Ver `F1_TE_v2_REPORT.md`.

   `Site/` está fora do git (DEC-016). Se a referência não existir (clone
   limpo), o script cai para `app/icon.svg`, que é cópia literal dela — os
   rasters continuam reprodutíveis sem o material de referência.

   ── O que cada saída é ─────────────────────────────────────────────────────
   · app/icon.svg ................ cópia literal do F1_TEv17 (tile iron incluso)
   · app/icon.png ................ 32×32, o tamanho que o QA validou
   · app/apple-icon.png .......... 180×180
   · public/icon-{192,512}.png ... PWA (512 declarado maskable no manifest.ts)
   · public/img/brand/satti-symbol.svg ... símbolo SEM o tile, S em iron
   · public/img/brand/satti-wordmark.svg . logotipo "SATTI" + nó blaze

   ── Por que o corte do hexágono deixa de ser stroke e passa a ser VÃO ──────
   No F1_TEv17 o corte é um `<line>` iron de 24,11 px: ele funciona porque o
   tile atrás é iron, então o traço "revela" o fundo. Sem o tile (símbolo e
   `SattiMark.tsx`) um traço colorido teria que adivinhar a cor de fundo —
   iron no header claro, graphite no rodapé, blaze na faixa. Aqui o hexágono
   é RECORTADO em dois polígonos separados pela banda de 24,11 px: o vão é
   geometria, não cor, e a marca passa a funcionar sobre qualquer fundo com
   zero variantes de arquivo. O recorte é exato (Sutherland–Hodgman contra
   dois semiplanos; o hexágono é convexo e a banda cruza-o de ponta a ponta).

   ── Wordmark: por que os contornos vêm do Archivo e não do F2 gold ─────────
   `out/F2_wordmarks_gold/` só tem PNG (12 arquivos 18–39 KB, `size:
   1536x1024`) — não existe vetor para converter, e vetorizar um raster de
   1536 px entregaria curvas aproximadas e estouraria o budget de 10 KB em
   ruído de nó. O próprio prompt do F2 pede "geometric grotesque in the
   spirit of the Archivo typeface": desenhar com o Archivo REAL entrega as
   letras que o spec pediu, com o kerning do próprio font, e o logotipo não
   pode divergir dos H1 do site porque é a mesma família que o
   `next/font/google` já carrega no layout.

   Variante escolhida: **F2_W1_C4_SP**. W4 tem a travessa do A invertida
   (defeito de geração); W6 (C5) traz a tagline "AI & AUTOMATION STUDIO", que
   é copy não confirmada e não pode entrar num arquivo de marca (L1); W1 é a
   composição limpa — SATTI + um único nó blaze, que é exatamente a regra do
   DS. As proporções abaixo foram MEDIDAS no pixel do W1 gold.
*/

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const CHECK_ONLY = process.argv.includes("--check");
const KB = 1024;

const REF_SVG = join(
  ROOT,
  "Site/BRANDING/logo-factory/out/F1_TE/F1_TEv17.svg",
);
const ICON_SVG = join(ROOT, "app/icon.svg");

/* Budgets (MANIFEST §2 "Marca e UI" + tabela da W10-C). path → bytes. */
const BUDGETS = {
  "app/icon.svg": 8 * KB,
  "app/icon.png": 2 * KB,
  "app/apple-icon.png": 20 * KB,
  "public/icon-192.png": 8 * KB,
  "public/icon-512.png": 24 * KB,
  "public/img/brand/satti-symbol.svg": 6 * KB,
  "public/img/brand/satti-wordmark.svg": 10 * KB,
};

/* Tokens do DS — hex literal é permitido aqui porque um arquivo .svg é ARTE,
   não componente (a lei "nenhum hex em componente" vale para o TSX/CSS; o
   SattiMark.tsx usa currentColor + var(--c-blaze)). */
const IRON = "#15171B";
const PAPER = "#F7F8FA";
const BLAZE = "#FF4D00";

const written = [];
const fmt = (b) => `${(b / KB).toFixed(2)} KB`;
const r2 = (n) => Math.round(n * 100) / 100;

function emit(relPath, contents) {
  const abs = join(ROOT, relPath);
  if (!CHECK_ONLY) {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, contents);
  }
  written.push(relPath);
}

// ───────────────────────────── 1 · parse da fonte ───────────────────────────

const source = existsSync(REF_SVG) ? REF_SVG : ICON_SVG;
if (!existsSync(source)) {
  console.error(
    `FALHA: nem ${REF_SVG} nem ${ICON_SVG} existem — sem fonte de marca.`,
  );
  process.exit(1);
}
const svgText = readFileSync(source, "utf8");
console.log(`fonte: ${source === REF_SVG ? "Site/… (referência)" : "app/icon.svg"}`);

/** Polígonos do SVG, na ordem do documento, com fill e pontos numéricos. */
const polygons = [...svgText.matchAll(/<polygon\s+points="([^"]+)"\s+fill="([^"]+)"/g)].map(
  ([, points, fill]) => ({
    fill: fill.toUpperCase(),
    pts: points
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(",").map(Number))
      .map(([x, y]) => ({ x, y })),
  }),
);

/** O corte: `<line>` iron com stroke-width. */
const lineMatch = svgText.match(
  /<line\s+x1="([\d.]+)"\s+y1="([\d.]+)"\s+x2="([\d.]+)"\s+y2="([\d.]+)"\s+stroke="[^"]+"\s+stroke-width="([\d.]+)"/,
);
if (polygons.length !== 5 || !lineMatch) {
  console.error(
    `FALHA: esperava 5 polígonos + 1 line no SVG de marca, achei ${polygons.length} polígonos e line=${Boolean(lineMatch)}.`,
  );
  process.exit(1);
}

const CUT = {
  a: { x: Number(lineMatch[1]), y: Number(lineMatch[2]) },
  b: { x: Number(lineMatch[3]), y: Number(lineMatch[4]) },
  width: Number(lineMatch[5]),
};

const paperPolys = polygons.filter((p) => p.fill === PAPER);
const blazePolys = polygons.filter((p) => p.fill === BLAZE);
if (paperPolys.length !== 2 || blazePolys.length !== 3) {
  console.error(
    `FALHA: esperava 2 polígonos paper + 3 blaze, achei ${paperPolys.length}/${blazePolys.length}.`,
  );
  process.exit(1);
}

/** Ponto dentro do polígono (ray casting). */
function contains(pts, p) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/* Qual polígono o corte atravessa? NÃO é "o blaze de 6 vértices" — o gancho
   superior direito também tem 6. O teste que vale é semântico: o nó cortado é
   o polígono que CONTÉM o meio do traço (512,512). E os dois extremos do traço
   têm que estar FORA dele — é isso que garante que recortar por uma banda
   infinita dá o mesmo resultado que o traço finito de verdade. */
const cutMid = { x: (CUT.a.x + CUT.b.x) / 2, y: (CUT.a.y + CUT.b.y) / 2 };
const hex = blazePolys.find((p) => contains(p.pts, cutMid));
const hooks = blazePolys.filter((p) => p !== hex);
if (!hex) {
  console.error(`FALHA: nenhum polígono blaze contém o meio do corte (${cutMid.x},${cutMid.y}).`);
  process.exit(1);
}
if (contains(hex.pts, CUT.a) || contains(hex.pts, CUT.b)) {
  console.error(
    "FALHA: um extremo do corte cai DENTRO do nó — o traço não o atravessa de ponta a ponta e a banda infinita recortaria demais.",
  );
  process.exit(1);
}

// ────────────────── 2 · recorte do hexágono pela banda do corte ──────────────

/** Normal unitária da linha do corte (a banda é |(p−a)·n| ≤ width/2). */
function cutNormal() {
  const dx = CUT.b.x - CUT.a.x;
  const dy = CUT.b.y - CUT.a.y;
  const len = Math.hypot(dx, dy);
  return { x: -dy / len, y: dx / len };
}

/** Sutherland–Hodgman contra o semiplano dist(p) ≤ limit (polígono convexo). */
function clipHalfPlane(pts, dist, limit) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % pts.length];
    const dc = dist(cur) - limit;
    const dn = dist(next) - limit;
    if (dc <= 0) out.push(cur);
    if ((dc < 0 && dn > 0) || (dc > 0 && dn < 0)) {
      const t = dc / (dc - dn);
      out.push({ x: cur.x + t * (next.x - cur.x), y: cur.y + t * (next.y - cur.y) });
    }
  }
  return out;
}

const n = cutNormal();
const signed = (p) => (p.x - CUT.a.x) * n.x + (p.y - CUT.a.y) * n.y;
const half = CUT.width / 2;

/* Peça 1 = lado negativo da banda; peça 2 = lado positivo (espelhada pelo
   sinal, daí o dist invertido). */
const hexPieceA = clipHalfPlane(hex.pts, signed, -half);
const hexPieceB = clipHalfPlane(hex.pts, (p) => -signed(p), -half);
if (hexPieceA.length < 3 || hexPieceB.length < 3) {
  console.error("FALHA: o recorte do hexágono degenerou — a banda não o cruza.");
  process.exit(1);
}

const ptsAttr = (pts) => pts.map((p) => `${r2(p.x)},${r2(p.y)}`).join(" ");

/** Geometria final do símbolo sem tile, na ordem de pintura. */
const SYMBOL_PARTS = [
  ...paperPolys.map((p) => ({ role: "paper", points: ptsAttr(p.pts) })),
  ...hooks.map((p) => ({ role: "blaze", points: ptsAttr(p.pts) })),
  { role: "blaze", points: ptsAttr(hexPieceA) },
  { role: "blaze", points: ptsAttr(hexPieceB) },
];

/* A marca é centrada em 512,512 no tile (222,54 + 801,46 = 1024 nos dois
   eixos). viewBox quadrado justo à tinta: sem padding, quem consome decide o
   espaçamento — e width == height nunca distorce. */
const INK_MIN = Math.min(...SYMBOL_PARTS.flatMap((p) =>
  p.points.split(" ").flatMap((pair) => pair.split(",").map(Number)),
));
const VB = { min: r2(INK_MIN), size: r2(1024 - 2 * INK_MIN) };

// ───────────────────────────── 3 · escrita dos SVG ──────────────────────────

emit("app/icon.svg", svgText);

const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB.min} ${VB.min} ${VB.size} ${VB.size}" width="${VB.size}" height="${VB.size}" shape-rendering="geometricPrecision"><title>SATTI</title>${SYMBOL_PARTS.map(
  (p) => `<polygon points="${p.points}" fill="${p.role === "paper" ? IRON : BLAZE}"/>`,
).join("")}</svg>\n`;
emit("public/img/brand/satti-symbol.svg", symbolSvg);

// ──────────────────────────── 4 · wordmark vetorial ─────────────────────────

/* Contornos reais do Archivo instanciado em wght=600 / wdth=100 — "semibold",
   que é o peso que o spec do F2 pede E o default deste variable font (eixo
   wght 100→900, default 600). Unidades do font: upem 1000, y para CIMA,
   origem no baseline, capHeight 686. Avanços já com o kerning GPOS do próprio
   Archivo aplicado por HarfBuzz (o par "AT" kerna −85: avanço natural do A é
   709, o shaped é 624). Derivado com fontTools 4.63 + uharfbuzz 0.55 a partir
   de `Site/BRANDING/logo-factory/assets/fonts/Archivo-Variable.ttf`. */
const GLYPHS = {
  S: "M332 -12Q275 -12 223 0Q171 13 131 40Q91 66 68 106Q45 145 45 199Q45 205 46 211Q46 217 46 220H177Q177 218 176 212Q176 207 176 203Q176 170 195 146Q214 123 250 110Q286 98 335 98Q368 98 394 102Q419 106 438 114Q456 121 468 132Q480 142 486 155Q491 168 491 183Q491 212 473 231Q455 250 424 263Q394 276 356 286Q317 297 276 308Q236 319 198 334Q159 350 128 372Q98 394 80 428Q62 461 62 508Q62 556 82 592Q103 628 140 652Q178 675 228 686Q278 698 337 698Q392 698 440 686Q489 675 526 650Q563 626 584 588Q605 551 605 499V487H476V497Q476 526 458 546Q441 566 410 577Q378 588 336 588Q291 588 259 580Q227 571 210 554Q193 538 193 514Q193 489 211 472Q229 455 260 443Q290 431 328 421Q367 411 408 400Q448 388 486 373Q525 358 556 336Q586 313 604 280Q622 247 622 201Q622 124 584 77Q547 30 482 9Q416 -12 332 -12Z",
  A: "M5 0 272 686H436L704 0H563L508 146H194L139 0ZM235 256H466L397 442Q393 452 388 468Q382 483 376 502Q370 520 364 539Q358 558 353 573H348Q342 553 334 527Q325 501 317 478Q309 455 304 442Z",
  T: "M244 0V574H25V686H594V574H374V0Z",
  I: "M76 0V686H206V0Z",
};
/** "SATTI" com os avanços shaped (kern incluso). */
const WORD = [
  { g: "S", adv: 667 },
  { g: "A", adv: 624 },
  { g: "T", adv: 619 },
  { g: "T", adv: 619 },
  { g: "I", adv: 282 },
];
/** bbox da tinta das 5 letras sem tracking (S tem overshoot: y −12..698). */
const NAT = { x0: 45, x1: 2735, y0: -12, y1: 698 };

/* Proporções MEDIDAS em F2_W1_C4_SP_GOLD_b.png (1536×1024), por bbox de
   pixel: tinta 691×172 px; nó blaze Ø37 px com centro 45 px acima da base da
   tinta; vão de 30 px entre a última letra e o nó. */
const GOLD = { inkW: 691, inkH: 172, nodeD: 37, nodeUp: 45, nodeGap: 30 };

const natH = NAT.y1 - NAT.y0; // 710
const unitsPerPx = natH / GOLD.inkH; // escala raster → unidades do font
/* O gold é ~6 % mais largo que o Archivo natural com o MESMO peso de haste
   (haste do I medida: 0,1744 da altura da tinta; wght 600 dá 0,1831, wght 500
   dá 0,1571 — a haste crava o peso em ~600, então a largura extra é
   TRACKING, não peso maior). Distribuído nos 4 vãos entre as 5 letras. */
const TRACKING = ((GOLD.inkW / GOLD.inkH) * natH - (NAT.x1 - NAT.x0)) / (WORD.length - 1);

let cursor = 0;
const letters = WORD.map(({ g, adv }, i) => {
  const x = cursor;
  cursor += adv + (i < WORD.length - 1 ? TRACKING : 0);
  return { d: GLYPHS[g], x: r2(x) };
});

const inkRight = NAT.x1 + TRACKING * (WORD.length - 1);
const NODE = {
  r: r2((GOLD.nodeD / 2) * unitsPerPx),
  cx: r2(inkRight + GOLD.nodeGap * unitsPerPx + (GOLD.nodeD / 2) * unitsPerPx),
  cy: r2(NAT.y0 + GOLD.nodeUp * unitsPerPx),
};
const wmW = r2(NODE.cx + NODE.r - NAT.x0);
const wmH = r2(natH);

/* Um único <g> converte unidades do font (y para cima) em coordenadas SVG
   (y para baixo) e encosta a tinta em 0,0 — nenhum número é reescrito. */
const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wmW} ${wmH}" width="${wmW}" height="${wmH}" shape-rendering="geometricPrecision"><title>SATTI</title><g transform="matrix(1 0 0 -1 ${-NAT.x0} ${NAT.y1})">${letters
  .map(
    ({ d, x }) =>
      `<path fill="${IRON}"${x ? ` transform="translate(${x} 0)"` : ""} d="${d}"/>`,
  )
  .join("")}<circle fill="${BLAZE}" cx="${NODE.cx}" cy="${NODE.cy}" r="${NODE.r}"/></g></svg>\n`;
emit("public/img/brand/satti-wordmark.svg", wordmarkSvg);

console.log(
  `wordmark: tracking ${r2(TRACKING)}/1000em · nó r=${NODE.r} em (${NODE.cx}, ${NODE.cy}) · ` +
    `viewBox ${wmW}×${wmH} (razão ${r2(wmW / wmH)}; gold mediu ${r2(757 / 172)})`,
);

// ───────────────────────── 5 · rasters a partir do SVG ──────────────────────

/* O SVG declara width/height 1024, então o sharp o rasteriza a 1024² e o
   resize é sempre DOWNSCALE com lanczos3 — nunca upscale. palette:true com
   dither 0: a arte tem 3 cores planas + antialiasing, quantizar para paleta é
   visualmente idêntico e é o que faz o 32×32 caber em 2 KB. */
const RASTERS = [
  { path: "app/icon.png", size: 32 },
  { path: "app/apple-icon.png", size: 180 },
  { path: "public/icon-192.png", size: 192 },
  { path: "public/icon-512.png", size: 512 },
];

for (const { path, size } of RASTERS) {
  const buf = await sharp(Buffer.from(svgText))
    .resize(size, size, { kernel: "lanczos3" })
    .png({ compressionLevel: 9, palette: true, dither: 0, effort: 10 })
    .toBuffer();
  emit(path, buf);
}

// ─────────── 6 · prova de que o vão recortado ≡ o traço original ────────────

/* O recorte só é legítimo se o símbolo remontado sobre o tile iron produzir os
   MESMOS pixels que o F1_TEv17 original. Remonta e compara a 256²: qualquer
   erro de sinal, de meia-largura ou de polígono escolhido aparece como um
   bloco de pixels divergentes, não como ruído de antialiasing. */
const rebuilt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" shape-rendering="geometricPrecision"><rect width="1024" height="1024" fill="${IRON}"/>${SYMBOL_PARTS.map(
  (p) => `<polygon points="${p.points}" fill="${p.role === "paper" ? PAPER : BLAZE}"/>`,
).join("")}</svg>`;

const CMP = 256;
const raw = (svg) =>
  sharp(Buffer.from(svg)).resize(CMP, CMP).removeAlpha().raw().toBuffer();
const [origPx, minePx] = await Promise.all([raw(svgText), raw(rebuilt)]);

let differing = 0;
let worst = 0;
for (let i = 0; i < origPx.length; i++) {
  const d = Math.abs(origPx[i] - minePx[i]);
  if (d > worst) worst = d;
  if (d > 24) differing++;
}
const differingPct = (differing / origPx.length) * 100;
/* Tolerância: só as 2 arestas do vão podem divergir, e só por antialiasing —
   o original pinta um stroke (AA nas duas bordas do traço), o remontado tem
   duas arestas de polígono. São ~2×340 px de perímetro num quadro de 256²×3
   canais, ou seja bem abaixo de 1 %. Um erro de geometria passaria de 2 %. */
if (differingPct > 1) {
  console.error(
    `FALHA: símbolo remontado divergiu do F1_TEv17 em ${differingPct.toFixed(2)} % dos canais (máx ${worst}) — o recorte não reproduz o traço.`,
  );
  process.exit(1);
}
console.log(
  `recorte ≡ traço original: ${differingPct.toFixed(3)} % dos canais divergem a 256² (delta máx ${worst})`,
);

// ──────────────────────── 7 · SattiMark.tsx não pode divergir ───────────────

/* O componente repete a MESMA geometria inline (é o ponto dele: zero request).
   Duas cópias da mesma verdade divergem — então o script falha se o TSX não
   contiver exatamente os polígonos calculados aqui. */
const MARK_TSX = join(ROOT, "components/ui/SattiMark.tsx");
if (existsSync(MARK_TSX)) {
  const tsx = readFileSync(MARK_TSX, "utf8");
  const missing = SYMBOL_PARTS.filter((p) => !tsx.includes(p.points));
  const vbOk = tsx.includes(`${VB.min} ${VB.min} ${VB.size} ${VB.size}`);
  if (missing.length || !vbOk) {
    console.error(
      `FALHA: components/ui/SattiMark.tsx divergiu da geometria — ` +
        `${missing.length} polígono(s) fora, viewBox ${vbOk ? "ok" : "fora"}.`,
    );
    for (const p of missing) console.error(`  esperado: ${p.points}`);
    process.exit(1);
  }
  console.log("SattiMark.tsx: geometria idêntica à do símbolo (ok)");
} else {
  console.log("SattiMark.tsx: ainda não existe — verificação de divergência pulada");
}

// ────────────── 8 · a fonte do OG tem que ser parseável pelo satori ─────────

/* `app/[locale]/opengraph-image.tsx` embarca essa TTF em tempo de build. Duas
   condições fazem a diferença entre "card social com a tipografia da marca" e
   "build quebrado", e nenhuma é óbvia lendo o arquivo:
   · tabela `fvar` PRESENTE ⇒ o fork de opentype.js do @vercel/og estoura em
     `parseFvarAxis` (lê os nomes de eixo no dicionário macintosh, que o
     Archivo-Variable não popula) e a rota de OG derruba o build;
   · `usWeightClass != 800` ⇒ satori não instancia eixos, então o peso do
     arquivo É o peso final: o `weight: 800` do ImageResponse seria mentira.
   Ver assets/fonts/README.md. Leitura direta do table directory — sem dep. */
const OG_FONT = "assets/fonts/Archivo-ExtraBold-latin.ttf";
const ogFontAbs = join(ROOT, OG_FONT);
if (!existsSync(ogFontAbs)) {
  console.error(
    `FALHA: ${OG_FONT} ausente — o opengraph-image não consegue embarcar o Archivo. Regenere conforme assets/fonts/README.md.`,
  );
  process.exit(1);
}
const ttf = readFileSync(ogFontAbs);
const numTables = ttf.readUInt16BE(4);
const tables = new Map();
for (let i = 0; i < numTables; i++) {
  const off = 12 + i * 16;
  tables.set(ttf.toString("ascii", off, off + 4), {
    offset: ttf.readUInt32BE(off + 8),
    length: ttf.readUInt32BE(off + 12),
  });
}
const os2 = tables.get("OS/2");
const weightClass = os2 ? ttf.readUInt16BE(os2.offset + 4) : 0;
if (tables.has("fvar") || weightClass !== 800) {
  console.error(
    `FALHA: ${OG_FONT} inválida para o satori — fvar=${tables.has("fvar")} (tem que ser false), usWeightClass=${weightClass} (tem que ser 800).`,
  );
  process.exit(1);
}
console.log(
  `${OG_FONT}: estática (sem fvar), usWeightClass ${weightClass}, ${fmt(ttf.length)} — build-time, nunca servida`,
);

// ─────────────────────────────── 9 · budgets (L4) ───────────────────────────

let violations = 0;
for (const path of written) {
  const abs = join(ROOT, path);
  if (!existsSync(abs)) {
    console.log(`  — ${path} (não escrito: --check)`);
    continue;
  }
  const size = statSync(abs).size;
  const max = BUDGETS[path];
  const ok = size <= max;
  if (!ok) violations++;
  console.log(`${ok ? "  OK" : "FAIL"} ${path} — ${fmt(size)} / máx ${fmt(max)}`);
}

console.log(`\n${written.length} assets de marca · ${violations} violações`);
if (violations > 0) {
  console.error("BUDGET ESTOURADO (L4) — corrija antes do merge.");
  process.exit(1);
}
