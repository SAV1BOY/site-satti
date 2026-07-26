/* import-ref-assets.mjs — W10-A · importa as imagens ESTÁTICAS do material de
 * referência (`Site/`, fora do git · DEC-016) para dentro dos budgets do
 * MANIFEST v2, e gera os placeholders blueprint dos avatares de depoimento.
 *
 *   node scripts/import-ref-assets.mjs
 *
 * Autoridade de path/dimensão/budget: MANIFEST.md v2. Este arquivo NÃO redefine
 * nada — a tabela abaixo é a transcrição do MANIFEST em forma executável, e cada
 * asset é conferido contra ela antes de ir para o disco.
 *
 * Três invariantes, todas verificadas (falha = exit 1, nada de aviso):
 *   1. BUDGET — começa na qualidade declarada e desce de 6 em 6 até caber.
 *      Piso q=40: se não couber, o asset é reprovado com o histórico das
 *      tentativas. Nunca se baixa a DIMENSÃO para caber (L4 + razão de aspecto).
 *   2. DIMENSÃO — `sharp(buf).metadata()` do buffer final tem de dar exatamente
 *      o width×height do MANIFEST. A razão de aspecto é o que mantém o CLS em 0.
 *   3. DECLARAÇÃO — tudo o que sai daqui entra em `public/assets-manifest.json`
 *      com a origem real. É esse arquivo que faz o `check-thirdparty.mjs`
 *      escalar de aviso para FAIL nos slots que ainda não passam por
 *      `resolveAsset()`.
 *
 * Regra de enquadramento (as fontes do modelo não têm a razão de aspecto dos
 * slots do v2, então alguma coisa tem de ceder):
 *   - fonte com "headroom" transparente  → `fit:"contain"` + `position:"bottom"`
 *     e fundo transparente. O padding cai onde a fonte JÁ era transparente, logo
 *     não se perde conteúdo nem aparece faixa sobre o tint do card.
 *   - fonte full-bleed (sangra nos 4 lados) → `fit:"cover"` + `position:"center"`.
 *     Cortar ~1 % é melhor do que abrir uma faixa visível de tint na borda.
 * O `flatten` só entra onde o fundo de destino é conhecido e opaco (mosaico e
 * shot-6 sobre graphite). Onde o destino fica sobre tint variável — cards de
 * serviço, phones, a mão — o alpha É o efeito e é preservado.
 */

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = "Site/Creative Design and Development Agency_files";
const OUT_MANIFEST = "public/assets-manifest.json";

const KB = 1024;
const Q_STEP = 6;
const Q_FLOOR = 40;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const GRAPHITE = "#0F1115"; // --c-graphite, o fundo da célula do mosaico

const fmt = (b) => `${(b / KB).toFixed(1)} KB`;
const model = (sourceFile) => ({ origin: "model", sourceFile });

/* ========================================================================== *
 * Tabela declarativa — transcrição do MANIFEST.md v2 §2
 * ========================================================================== */

const SERVICES = [
  {
    id: "service-agents",
    from: "mob-dev.png",
    to: "public/img/services/agents.webp",
    // "Agentes de IA & Automações" integram ao WhatsApp → telefones.
    // Fonte 1068×1142 com 345 px de topo transparente: padding cai no vazio.
    fit: "contain",
    position: "bottom",
    alpha: true,
  },
  {
    id: "service-products",
    from: "design-solutions.png",
    to: "public/img/services/products.webp",
    // "Produtos Web & SaaS" → formas 3D ricas de produto.
    // Única das três que sangra nos 4 lados (bbox = canvas): cover.
    fit: "cover",
    position: "center",
    alpha: true,
  },
  {
    id: "service-data",
    from: "web-dev.png",
    to: "public/img/services/data.webp",
    // "Dados & Integrações" → folhas de código.
    // 534×544 = METADE da resolução das outras duas para o mesmo alvo de
    // 1208×1306. Upscale de 2,26× na largura + sharpen; espere suavidade
    // visível em DPR2 neste card (MANIFEST §2 avisa: é o 1º a substituir).
    fit: "contain",
    position: "bottom",
    alpha: true,
    sharpen: { sigma: 0.6 },
  },
].map((a) => ({
  ...a,
  width: 1208,
  height: 1306,
  maxBytes: 180 * KB,
  quality: 82,
  thirdParty: model(a.from),
}));

const AUTOMATION_PHONES = [
  {
    id: "automation-phone-left",
    from: "phone-01.png",
    to: "public/img/automation/phone-left.webp",
    width: 674,
    height: 1100,
  },
  {
    id: "automation-phone-right",
    from: "phone-02.png",
    to: "public/img/automation/phone-right.webp",
    width: 756,
    height: 1236,
  },
].map((a) => ({
  ...a,
  // Razão de aspecto da fonte bate com a do alvo em <0,1 % → cover não corta nada.
  fit: "cover",
  position: "center",
  alpha: true, // ficam sobre o gradiente da S6
  maxBytes: 250 * KB,
  quality: 82,
  thirdParty: model(a.from),
}));

const AUTOMATION_HAND = {
  id: "automation-hand",
  from: "hand.png",
  to: "public/img/automation/hand.webp",
  width: 1920,
  height: 1241,
  fit: "cover",
  position: "center",
  // O alpha É o efeito: a mão é sobreposta ao vídeo central e o recorte é o
  // que faz a composição. NUNCA flatten. Fonte 2880×1862 → downscale, sem perda.
  alpha: true,
  maxBytes: 400 * KB,
  quality: 82,
  thirdParty: model("hand.png"),
};

const AUTOMATION_MOSAIC = [1, 2, 3]
  .flatMap((row) => [1, 2, 3, 4].map((col) => `screen${row}-${col}.png`))
  .map((from, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `automation-mosaic-${n}`,
      from,
      to: `public/img/automation/screen-${n}.webp`,
      width: 730,
      height: 1540,
      fit: "cover",
      position: "center",
      // 7 das 12 têm alpha, mas a célula do mosaico é graphite e o fundo de
      // destino é conhecido → flatten ANTES do resize (MANIFEST §2).
      flatten: GRAPHITE,
      maxBytes: 120 * KB,
      quality: 78,
      thirdParty: model(from),
    };
  });

/* shot-1..3 são poster de vídeo e pertencem à W10-B — não são escritos aqui. */
const PORTFOLIO = [
  { n: 4, from: "portfolio-2.webp", flatten: null },
  { n: 5, from: "portfolio-4.webp", flatten: null },
  // portfolio-6 tem canal alpha, mas ele é vestigial (min 253 / média 255,0 de
  // 255 → opaco). Flatten em graphite tira o 4º canal inútil e economiza bytes.
  { n: 6, from: "portfolio-6.webp", flatten: GRAPHITE },
].map(({ n, from, flatten }) => ({
  id: `portfolio-shot-${n}`,
  from,
  to: `public/img/portfolio/shot-${n}.webp`,
  width: 1400,
  height: 1440,
  // 2048×1536 (4:3) → 1400×1440 (quase quadrado): é a maior mudança de razão
  // de aspecto do lote. Cover central corta ~13 % de cada lado, que é
  // exatamente o que um `object-fit: cover` no card faria de todo modo — e as
  // três composições são centradas, então o assunto sobrevive ao corte.
  fit: "cover",
  position: "center",
  ...(flatten ? { flatten } : {}),
  maxBytes: 250 * KB,
  quality: 80,
  thirdParty: model(from),
}));

const TEXTURES = [
  { n: 1, from: "texture-1.e7b6d3a7.jpg" },
  { n: 2, from: "texture-2.42807562.jpg" },
].map(({ n, from }) => ({
  id: `banner-texture-${n}`,
  from,
  to: `public/img/texture-${n}.webp`,
  // 238×90 → 476×180: razão de aspecto IDÊNTICA, upscale exato de 2×. A fonte
  // é um render 3D liso (sem detalhe fino), então o 2× sobe limpo — sem sharpen,
  // que aqui só amplificaria artefato de JPEG de 14 KB.
  width: 476,
  height: 180,
  fit: "cover",
  position: "center",
  maxBytes: 40 * KB,
  quality: 82,
  thirdParty: model(from),
}));

const CASES = [
  { n: 1, from: "syfter.jpeg" },
  { n: 2, from: "vvs.jpeg" },
  { n: 3, from: "ritilo.jpeg" },
].map(({ n, from }) => ({
  id: `cases-thumb-${n}`,
  from,
  to: `public/img/cases/thumb-${n}.webp`,
  width: 744,
  height: 480,
  fit: "cover",
  position: "center",
  maxBytes: 120 * KB,
  quality: 80,
  thirdParty: model(from),
}));

/* ========================================================================== *
 * Avatares de depoimento — NÃO importados (DEC-017)
 * Os 4 do modelo são fotos de pessoas reais identificáveis, com nome e cargo,
 * que no site da SATTI apareceriam como clientes da SATTI. Estão em
 * `excludedEvenInPreview`: um preview da Vercel é público, e nesse caso
 * "preview" já é publicação de pessoa, não de composição. Aqui só se GERA
 * placeholder blueprint do próprio DS — por isso `thirdParty: null`.
 * ========================================================================== */

function avatarBlueprintSvg(n) {
  const S = 156;
  const R = S / 2;
  const GRID = 12;
  const ARM = 15;
  const grid = [];
  for (let i = GRID; i < S; i += GRID) {
    grid.push(`<line x1="${i}" y1="0" x2="${i}" y2="${S}"/>`);
    grid.push(`<line x1="0" y1="${i}" x2="${S}" y2="${i}"/>`);
  }
  // Disco recortado por clipPath: fora do círculo fica TRANSPARENTE, então o
  // avatar assenta em paper ou em graphite sem quadrado de fundo aparecendo.
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <defs><clipPath id="disc"><circle cx="${R}" cy="${R}" r="${R - 0.5}"/></clipPath></defs>
  <g clip-path="url(#disc)">
    <rect width="${S}" height="${S}" fill="#ECEEF2"/>
    <g stroke="#E3E6EB" stroke-width="1">${grid.join("")}</g>
    <g stroke="#6E7480" stroke-width="1.5">
      <line x1="${R - ARM}" y1="${R}" x2="${R + ARM}" y2="${R}"/>
      <line x1="${R}" y1="${R - ARM}" x2="${R}" y2="${R + ARM}"/>
    </g>
    <text x="${R}" y="${R + 42}" text-anchor="middle" font-family="monospace"
      font-size="13" letter-spacing="1.5" fill="#6E7480">RV${n}</text>
  </g>
  <circle cx="${R}" cy="${R}" r="${R - 0.5}" fill="none" stroke="#E3E6EB" stroke-width="1"/>
</svg>`);
}

const AVATARS = [1, 2, 3, 4].map((n) => ({
  id: `review-avatar-${n}`,
  svg: avatarBlueprintSvg(n),
  to: `public/img/reviews/avatar-${n}.webp`,
  width: 156,
  height: 156,
  fit: "cover",
  position: "center",
  alpha: true, // o recorte circular
  maxBytes: 20 * KB,
  quality: 82,
  thirdParty: null,
}));

const ASSETS = [
  ...SERVICES,
  ...AUTOMATION_PHONES,
  AUTOMATION_HAND,
  ...AUTOMATION_MOSAIC,
  ...PORTFOLIO,
  ...TEXTURES,
  ...CASES,
  ...AVATARS,
];

/* ========================================================================== *
 * Pipeline
 * ========================================================================== */

function encode(a, quality) {
  let pipe = a.svg ? sharp(a.svg) : sharp(path.join(SRC, a.from));
  // flatten ANTES do resize: descartar o alpha primeiro evita que o lanczos3
  // interpole pixels transparentes para dentro da borda do conteúdo.
  if (a.flatten) pipe = pipe.flatten({ background: a.flatten });
  pipe = pipe.resize({
    width: a.width,
    height: a.height,
    fit: a.fit,
    position: a.position,
    kernel: "lanczos3",
    background: TRANSPARENT,
    withoutEnlargement: false,
  });
  if (a.sharpen) pipe = pipe.sharpen(a.sharpen);
  return pipe.webp({ quality, alphaQuality: 100, effort: 6 }).toBuffer();
}

async function produce(a) {
  const tries = [];
  let quality = a.quality;
  let buf;

  for (;;) {
    buf = await encode(a, quality);
    tries.push(`q${quality}=${fmt(buf.length)}`);
    if (buf.length <= a.maxBytes) break;
    if (quality - Q_STEP < Q_FLOOR) {
      throw new Error(
        `${a.id}: NÃO CABE no budget de ${fmt(a.maxBytes)} nem no piso q=${Q_FLOOR}. `
          + `Tentativas: ${tries.join(" → ")}. Baixar a dimensão não é opção (L4 + CLS).`,
      );
    }
    quality -= Q_STEP;
  }

  // Assert de dimensão sobre o buffer FINAL, não sobre o que pedimos ao resize.
  const md = await sharp(buf).metadata();
  if (md.width !== a.width || md.height !== a.height) {
    throw new Error(
      `${a.id}: dimensão saiu ${md.width}×${md.height}, MANIFEST manda ${a.width}×${a.height}`,
    );
  }
  if (a.alpha && !md.hasAlpha) {
    throw new Error(`${a.id}: alpha exigido pelo MANIFEST mas o arquivo saiu opaco`);
  }

  await mkdir(path.dirname(a.to), { recursive: true });
  await writeFile(a.to, buf);

  return {
    entry: {
      id: a.id,
      path: a.to.replace(/\\/g, "/"),
      bytes: buf.length,
      width: md.width,
      height: md.height,
      format: md.format,
      alpha: Boolean(md.hasAlpha),
      quality,
      thirdParty: a.thirdParty,
    },
    tries,
    budget: a.maxBytes,
  };
}

/* ========================================================================== *
 * Execução
 * ========================================================================== */

const entries = [];
const errors = [];
let totalBytes = 0;

for (const a of ASSETS) {
  try {
    const { entry, tries, budget } = await produce(a);
    entries.push(entry);
    totalBytes += entry.bytes;
    const pct = ((entry.bytes / budget) * 100).toFixed(0);
    const steps = tries.length > 1 ? `  [${tries.join(" → ")}]` : "";
    console.log(
      `  OK ${entry.path} — ${entry.width}×${entry.height} `
        + `${entry.alpha ? "alpha" : "opaco"} q${entry.quality} `
        + `${fmt(entry.bytes)} / máx ${fmt(budget)} (${pct} %)${steps}`,
    );
  } catch (err) {
    errors.push(err.message);
    console.error(`FAIL ${a.to} — ${err.message}`);
  }
}

/* O manifesto registra o que de fato foi escrito. Escopo: W10-A (imagens
   estáticas). Os vídeos e os posters de vídeo são da W10-B e entram por lá. */
await writeFile(
  OUT_MANIFEST,
  `${JSON.stringify(
    {
      $comment: [
        "SAÍDA do scripts/import-ref-assets.mjs (W10-A) — não editar à mão.",
        "Registra bytes e dimensões REAIS do que foi escrito em public/.",
        "É a fonte de verdade do check-thirdparty.mjs: enquanto um path não",
        "estiver aqui, o slot é diferido (aviso); no instante em que aparece,",
        "referenciá-lo num componente sem resolveAsset() vira FAIL.",
        "Escopo desta lista: imagens estáticas (W10-A). Vídeos e posters de",
        "vídeo são da W10-B e não são registrados por este script.",
        "thirdParty: null = original SATTI ou placeholder blueprint do DS.",
      ],
      version: 2,
      generatedBy: "scripts/import-ref-assets.mjs",
      scope: "w10-a-static-images",
      assets: entries,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `\n${entries.length}/${ASSETS.length} assets escritos · ${fmt(totalBytes)} somados`
    + ` · ${OUT_MANIFEST} atualizado`,
);

if (errors.length) {
  console.error(`\n${errors.length} ASSET(S) REPROVADO(S):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
