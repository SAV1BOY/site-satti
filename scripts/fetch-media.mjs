/* fetch-media.mjs — pipeline dos 9 vídeos do modelo estrutural (W10-B).
 *
 * Ordem de autoridade: MANIFEST.md §1 (paths, dimensões, budgets) > DEC-020 (copiar
 * quando já cabe) > este arquivo. Se divergirem, o MANIFEST vence.
 *
 * Nada de origem terceira entra no git: o download bruto fica em `.cache/awsmd/`
 * (ignorado), só o arquivo final otimizado é escrito em `public/`.
 *
 * Subcomandos:
 *   node scripts/fetch-media.mjs head      → só HEAD nas 9 fontes (confere bytes/tipo)
 *   node scripts/fetch-media.mjs fetch     → HEAD + download + sha256 + ffprobe + provenance
 *   node scripts/fetch-media.mjs scenes    → detecção de corte de cena dos 3 do portfólio
 *   node scripts/fetch-media.mjs encode    → copia/remuxa os 6 + re-encoda os 3
 *   node scripts/fetch-media.mjs posters   → extrai poster do .mp4 JÁ CODIFICADO → webp
 *   node scripts/fetch-media.mjs all       → fetch + encode + posters
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readSync,
  readFileSync,
  statSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import sharp from "sharp";

const KB = 1024;
const MB = 1024 * KB;
const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache", "awsmd");
const FF = path.join(ROOT, ".cache", "ff");
const FRAMES = path.join(ROOT, ".cache", "frames");
const PROVENANCE = path.join(CACHE, "provenance.json");

const BASE = "https://awsmd.com/media";

/* Escada de qualidade dos posters. L4: quando não cabe, desce QUALIDADE em passos —
   nunca dimensão (a dimensão é contrato do MANIFEST). Se nem q=40 couber, aborta. */
const Q_LADDER = [92, 86, 80, 74, 68, 62, 56, 50, 45, 40];

/* Encode dos 3 do portfólio (aritmética fechada no plano da W10):
   720×720 @ 24 fps × 8 s, 2-pass a 650 kbps → 650000×8/8 = 634,8 KiB contra budget de 1 MB.
   Por que trim e não CRF: 43 s dentro de 1 MB dá 0,0157 bpp; x264 precisa de ~0,06 bpp
   para gravação de tela limpa, e a 0,016 bpp aparece blocking nos painéis planos.
   8 s a 650 kbps dá 0,052 bpp. O slot é micro-loop por IntersectionObserver
   (DEC-018c) — ~35 dos 43 s nunca são vistos e um clipe longo corta no meio do scroll. */
const PORTFOLIO_VF =
  "crop=1200:1200:200:0,scale=720:720:flags=lanczos,fps=24,format=yuv420p";
const PORTFOLIO_BITRATE = "650k";
const PORTFOLIO_DUR = 8;

/* ESCOLHA DO -ss (medida, não chute — ver o subcomando `scenes`).
 *
 * A detecção de CORTE de cena (`gt(scene,0.2)`) não serve nestes 3 clipes: são
 * gravações de tela com scroll/crossfade contínuo e retornam 0 cortes (o único hit,
 * t=0,03 em portfolio-3, é o artefato do primeiro frame). Então mediu-se a ENERGIA
 * de mudança: soma do `lavfi.scene_score` de todos os frames em cada janela de 8 s.
 *
 * Segundo critério, que domina o primeiro: **o frame 0 de cada encode é também o
 * `shot-N.webp`**, um card do portfólio a 1400×1440 (MANIFEST §1, slots unificados).
 * Um -ss que cai no meio de um crossfade produz poster borrado — inspeção visual dos
 * candidatos confirmou. Então o -ss tem de cair num frame ASSENTADO que abra a janela
 * de maior energia, não no pico de energia em si.
 *
 *   portfolio-1  -ss 20   energia 1,08 = 25 % do clipe em 8/43 s (uniforme daria 18,6 %),
 *                         e o frame em 20 s está assentado e legível.
 *   portfolio-2  -ss 3    o clipe pulsa a cada ~4 s (perfil 0,10 · 0,01 · 0,01 · 0,00…).
 *                         A janela [3,11) pega as DUAS transições inteiras — energia 0,44,
 *                         empatada no máximo — e abre num frame assentado. O "melhor"
 *                         bruto (-ss 4,5) abre no meio do crossfade: texto duplicado.
 *   portfolio-3  -ss 0    energia 3,63 = 97,9 % de todo o clipe nos primeiros 8 s (os
 *                         últimos ~5 s são estáticos), e o frame 0 é a UI completa.
 *                         -ss 0,5 pega a UI em fade-out.
 */

/** As 9 fontes. `ss` dos 3 do portfólio = janela de 8 s escolhida pelo `scenes`. */
const SOURCES = [
  {
    id: "hero",
    url: `${BASE}/hero.mp4`,
    cache: "hero.mp4",
    out: "public/media/hero.mp4",
    mode: "copy",
    budget: 1.2 * MB,
    poster: {
      out: "public/media/hero-poster.webp",
      w: 1600,
      h: 900,
      budget: 120 * KB,
      ss: 0,
    },
  },
  {
    id: "stat-1",
    url: `${BASE}/about/volchek-color.mp4`,
    cache: "about-volchek-color.mp4",
    out: "public/media/stats/stat-1.mp4",
    mode: "copy",
    budget: 200 * KB,
    poster: {
      out: "public/media/stats/stat-1-poster.webp",
      w: 320,
      h: 320,
      budget: 24 * KB,
      ss: 0.5,
    },
  },
  {
    id: "stat-2",
    url: `${BASE}/about/pruzina-color.mp4`,
    cache: "about-pruzina-color.mp4",
    out: "public/media/stats/stat-2.mp4",
    mode: "copy",
    budget: 200 * KB,
    poster: {
      out: "public/media/stats/stat-2-poster.webp",
      w: 320,
      h: 320,
      budget: 24 * KB,
      ss: 0.5,
    },
  },
  {
    id: "stat-3",
    url: `${BASE}/about/time-color.mp4`,
    cache: "about-time-color.mp4",
    out: "public/media/stats/stat-3.mp4",
    mode: "copy",
    budget: 200 * KB,
    poster: {
      out: "public/media/stats/stat-3-poster.webp",
      w: 320,
      h: 320,
      budget: 24 * KB,
      ss: 0.5,
    },
  },
  {
    id: "stat-4",
    url: `${BASE}/about/ball-color.mp4`,
    cache: "about-ball-color.mp4",
    out: "public/media/stats/stat-4.mp4",
    mode: "copy",
    budget: 200 * KB,
    poster: {
      out: "public/media/stats/stat-4-poster.webp",
      w: 320,
      h: 320,
      budget: 24 * KB,
      ss: 0.5,
    },
  },
  {
    id: "phone",
    url: `${BASE}/development/phone.mp4`,
    cache: "development-phone.mp4",
    out: "public/media/phone.mp4",
    mode: "copy",
    budget: 250 * KB,
    poster: {
      out: "public/media/phone-poster.webp",
      w: 384,
      h: 832,
      budget: 40 * KB,
      ss: 0,
    },
  },
  /* Mapeamento do portfólio (o slot 2 do site é a fonte 5 do modelo). Os posters de
     P1–P3 não têm entrada própria: o slot visual é o mesmo de img/portfolio/shot-{1,2,3}
     (MANIFEST §1, slots unificados no v2). */
  {
    id: "portfolio-1",
    url: `${BASE}/portfolio-1.compressed.mp4`,
    cache: "portfolio-1.compressed.mp4",
    out: "public/media/portfolio-1.mp4",
    mode: "encode",
    budget: 1 * MB,
    ss: 20,
    poster: {
      out: "public/img/portfolio/shot-1.webp",
      w: 1400,
      h: 1440,
      budget: 250 * KB,
      ss: 0,
    },
  },
  {
    id: "portfolio-2",
    url: `${BASE}/portfolio-5.compressed.mp4`,
    cache: "portfolio-5.compressed.mp4",
    out: "public/media/portfolio-2.mp4",
    mode: "encode",
    budget: 1 * MB,
    ss: 3,
    poster: {
      out: "public/img/portfolio/shot-2.webp",
      w: 1400,
      h: 1440,
      budget: 250 * KB,
      ss: 0,
    },
  },
  {
    id: "portfolio-3",
    url: `${BASE}/portfolio-3.compressed.mp4`,
    cache: "portfolio-3.compressed.mp4",
    out: "public/media/portfolio-3.mp4",
    mode: "encode",
    budget: 1 * MB,
    ss: 0,
    poster: {
      out: "public/img/portfolio/shot-3.webp",
      w: 1400,
      h: 1440,
      budget: 250 * KB,
      ss: 0,
    },
  },
];

/* Bytes medidos por HEAD em 2026-07-26 e registrados no DEC-020. O `head` avisa
   se a origem mudou de tamanho — a trilha de evidência do swap depende disso. */
const EXPECTED_BYTES = {
  hero: 1012686,
  "stat-1": 125184,
  "stat-2": 157201,
  "stat-3": 29265,
  "stat-4": 142404,
  phone: 207752,
  "portfolio-1": 6264388,
  "portfolio-2": 1348598,
  "portfolio-3": 3296243,
};

const fmt = (b) =>
  b >= MB ? `${(b / MB).toFixed(2)} MB` : `${(b / KB).toFixed(1)} KB`;
const abs = (p) => path.join(ROOT, p);
const mkdirp = (d) => mkdirSync(d, { recursive: true });

function die(msg) {
  console.error(`\nABORTADO: ${msg}`);
  process.exit(1);
}

function sh(bin, args) {
  return execFileSync(bin, args, {
    encoding: "utf8",
    maxBuffer: 64 * MB,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/* ─────────────────────────── HEAD ─────────────────────────── */

async function headAll() {
  const rows = [];
  for (const s of SOURCES) {
    const r = await fetch(s.url, { method: "HEAD", redirect: "follow" });
    const type = r.headers.get("content-type") ?? "";
    const len = Number(r.headers.get("content-length") ?? 0);
    if (r.status !== 200) die(`${s.url} respondeu ${r.status} (esperado 200)`);
    if (!type.startsWith("video/mp4"))
      die(`${s.url} respondeu content-type "${type}" (esperado video/mp4)`);
    const expected = EXPECTED_BYTES[s.id];
    const drift = expected && len !== expected ? ` ⚠ esperado ${expected}` : "";
    rows.push({ id: s.id, url: s.url, bytes: len, type });
    console.log(
      `  200 ${type.padEnd(10)} ${String(len).padStart(9)} B  ${s.id}${drift}`,
    );
  }
  return rows;
}

/* ─────────────────────────── fetch ─────────────────────────── */

async function download(s) {
  const dest = path.join(CACHE, s.cache);
  const r = await fetch(s.url, { redirect: "follow" });
  if (r.status !== 200) die(`${s.url} respondeu ${r.status} no GET`);
  const type = r.headers.get("content-type") ?? "";
  if (!type.startsWith("video/mp4"))
    die(`${s.url} respondeu content-type "${type}" no GET`);

  const hash = createHash("sha256");
  let bytes = 0;
  const body = Readable.fromWeb(r.body);
  body.on("data", (c) => {
    hash.update(c);
    bytes += c.length;
  });
  await pipeline(body, createWriteStream(dest));

  const expected = EXPECTED_BYTES[s.id];
  if (expected && bytes !== expected)
    console.warn(`  ⚠ ${s.id}: ${bytes} B baixados, HEAD prometia ${expected}`);
  return { dest, bytes, sha256: hash.digest("hex") };
}

/** Metadados reais do stream (não confiar no HTML/CSS do modelo). */
function probe(file) {
  const raw = sh("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,r_frame_rate,avg_frame_rate,codec_name,pix_fmt,nb_frames",
    "-show_entries",
    "format=duration,size,nb_streams",
    "-of",
    "json",
    file,
  ]);
  const j = JSON.parse(raw);
  const st = j.streams?.[0] ?? {};
  const [n, d] = String(st.avg_frame_rate ?? "0/1").split("/").map(Number);
  return {
    width: st.width ?? null,
    height: st.height ?? null,
    fps: d ? Number((n / d).toFixed(3)) : null,
    codec: st.codec_name ?? null,
    pixFmt: st.pix_fmt ?? null,
    frames: st.nb_frames ? Number(st.nb_frames) : null,
    duration: j.format?.duration ? Number(Number(j.format.duration).toFixed(3)) : null,
    streams: j.format?.nb_streams ?? null,
  };
}

/** Ordem dos boxes de topo. `moov` antes de `mdat` = faststart (moov no início). */
function topLevelBoxes(file) {
  const fd = openSync(file, "r");
  const boxes = [];
  try {
    const size = statSync(file).size;
    let off = 0;
    const head = Buffer.alloc(16);
    while (off + 8 <= size && boxes.length < 64) {
      if (readSync(fd, head, 0, 16, off) < 8) break;
      let boxSize = head.readUInt32BE(0);
      const type = head.toString("latin1", 4, 8);
      let header = 8;
      if (boxSize === 1) {
        boxSize = Number(head.readBigUInt64BE(8));
        header = 16;
      } else if (boxSize === 0) {
        boxSize = size - off;
      }
      if (boxSize < header) break;
      boxes.push(type);
      off += boxSize;
    }
  } finally {
    closeSync(fd);
  }
  return boxes;
}

function isFaststart(file) {
  const b = topLevelBoxes(file);
  const moov = b.indexOf("moov");
  const mdat = b.indexOf("mdat");
  return { boxes: b, faststart: moov !== -1 && (mdat === -1 || moov < mdat) };
}

async function cmdFetch() {
  mkdirp(CACHE);
  console.log("HEAD nas 9 fontes:");
  await headAll();
  console.log("\nDownload + sha256 + ffprobe:");
  const provenance = { fetchedAt: new Date().toISOString(), files: {} };
  for (const s of SOURCES) {
    const { dest, bytes, sha256 } = await download(s);
    const meta = probe(dest);
    const fs_ = isFaststart(dest);
    provenance.files[s.id] = {
      url: s.url,
      cache: path.relative(ROOT, dest).replaceAll("\\", "/"),
      out: s.out,
      mode: s.mode,
      bytes,
      sha256,
      width: meta.width,
      height: meta.height,
      duration: meta.duration,
      fps: meta.fps,
      codec: meta.codec,
      pixFmt: meta.pixFmt,
      streams: meta.streams,
      topLevelBoxes: fs_.boxes,
      faststart: fs_.faststart,
      fetchedAt: new Date().toISOString(),
    };
    console.log(
      `  ${s.id.padEnd(12)} ${String(bytes).padStart(9)} B  ${meta.width}×${meta.height}  ` +
        `${meta.duration}s  ${meta.fps}fps  ${meta.codec}/${meta.pixFmt}  ` +
        `streams=${meta.streams}  faststart=${fs_.faststart}  ${sha256.slice(0, 12)}…`,
    );
  }
  writeFileSync(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);
  console.log(`\nprovenance → ${path.relative(ROOT, PROVENANCE)}`);
}

/* ─────────────────────────── scenes ─────────────────────────── */

/** Janela de 8 s com mais mudança de cena — escolha do -ss por medida, não por chute. */
function cmdScenes() {
  for (const s of SOURCES.filter((x) => x.mode === "encode")) {
    const src = path.join(CACHE, s.cache);
    let out = "";
    try {
      out = sh("ffmpeg", [
        "-hide_banner",
        "-i",
        src,
        "-vf",
        "select='gt(scene,0.2)',metadata=print:file=-",
        "-an",
        "-f",
        "null",
        "-",
      ]);
    } catch (e) {
      out = String(e.stdout ?? "") + String(e.stderr ?? "");
    }
    const times = [...out.matchAll(/pts_time:([0-9.]+)/g)].map((m) =>
      Number(m[1]),
    );
    const dur = probe(src).duration ?? 0;
    let best = { ss: 2, hits: -1 };
    for (let ss = 0; ss + PORTFOLIO_DUR <= dur; ss += 0.5) {
      const hits = times.filter((t) => t >= ss && t < ss + PORTFOLIO_DUR).length;
      if (hits > best.hits) best = { ss: Number(ss.toFixed(1)), hits };
    }
    console.log(
      `${s.id}: duração ${dur}s · ${times.length} cortes de cena · ` +
        `melhor janela de ${PORTFOLIO_DUR}s em -ss ${best.ss} (${best.hits} cortes) · ` +
        `cortes: ${times.map((t) => t.toFixed(2)).join(", ")}`,
    );
  }
}

/* ─────────────────────────── encode ─────────────────────────── */

/* Não-negociáveis em todo encode: -an (autoplay muted não usa áudio e faixa de áudio
   é risco de bloqueio de autoplay no iOS), yuv420p (Safari recusa 4:2:2/4:4:4),
   +faststart, e -g/-keyint_min fixos com -sc_threshold 0 (seek previsível, loop limpo). */
function encodePortfolio(s) {
  const src = path.join(CACHE, s.cache);
  const dst = abs(s.out);
  const log = path.join(FF, s.id);
  const common = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(s.ss),
    "-t",
    String(PORTFOLIO_DUR),
    "-i",
    src,
    "-an",
    "-sn",
    "-dn",
    "-vf",
    PORTFOLIO_VF,
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-preset",
    "veryslow",
    "-b:v",
    PORTFOLIO_BITRATE,
    /* GOP nos DOIS passes. O snippet do plano punha -g/-keyint_min/-sc_threshold só no
       pass 2 e o x264 recusa: "different keyint setting than first pass (48 vs 250)".
       Não é só o erro: as estatísticas do pass 1 têm de ser colhidas com a MESMA
       estrutura de GOP que o pass 2 vai codificar, senão a alocação de bits do
       2-pass descreve um vídeo que não é o que sai. */
    "-g",
    "48",
    "-keyint_min",
    "48",
    "-sc_threshold",
    "0",
  ];
  sh("ffmpeg", [...common, "-pass", "1", "-passlogfile", log, "-f", "null", "-"]);
  sh("ffmpeg", [
    ...common,
    "-maxrate",
    "850k",
    "-bufsize",
    "1300k",
    "-pass",
    "2",
    "-passlogfile",
    log,
    "-movflags",
    "+faststart",
    dst,
  ]);
}

/** DEC-020: quando já cabe, copiar. Re-encodar só adiciona perda de geração. */
function copyOrRemux(s) {
  const src = path.join(CACHE, s.cache);
  const dst = abs(s.out);
  const { faststart } = isFaststart(src);
  if (faststart) {
    writeFileSync(dst, readFileSync(src));
    return "copy";
  }
  /* Sem moov no início: remux sem perda (bitstream idêntico, só a ordem dos boxes muda). */
  sh("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    src,
    "-map",
    "0:v:0",
    "-c",
    "copy",
    "-an",
    "-sn",
    "-dn",
    "-movflags",
    "+faststart",
    dst,
  ]);
  return "remux";
}

function cmdEncode() {
  mkdirp(FF);
  mkdirp(abs("public/media/stats"));
  const results = [];
  for (const s of SOURCES) {
    if (!existsSync(path.join(CACHE, s.cache)))
      die(`${s.cache} não está em .cache/awsmd — rode o subcomando fetch primeiro`);
    const how = s.mode === "encode" ? (encodePortfolio(s), "encode") : copyOrRemux(s);
    const dst = abs(s.out);
    const bytes = statSync(dst).size;
    const meta = probe(dst);
    const fs_ = isFaststart(dst);
    const ok = bytes <= s.budget;
    results.push({ id: s.id, out: s.out, bytes, budget: s.budget, ok });
    console.log(
      `${ok ? "  OK" : "FAIL"} ${s.out.padEnd(34)} ${fmt(bytes).padStart(9)} / máx ${fmt(s.budget)}  ` +
        `[${how}] ${meta.width}×${meta.height} ${meta.duration}s ${meta.fps}fps ` +
        `${meta.pixFmt} streams=${meta.streams} faststart=${fs_.faststart}`,
    );
  }
  const bad = results.filter((r) => !r.ok);
  if (bad.length) die(`${bad.length} vídeo(s) fora de budget: ${bad.map((r) => r.id).join(", ")}`);
}

/* ─────────────────────────── posters ─────────────────────────── */

/* Poster extraído do .mp4 JÁ CODIFICADO (MANIFEST §1) — garante poster ≡ frame 0 e
   mata o "pop" visual no instante do play. Stat-cards usam -ss 0.5: o frame 0 de um
   objeto 3D girando costuma ser o menos legível dos 24 primeiros. */
async function makePoster(s) {
  const src = abs(s.out);
  if (!existsSync(src)) die(`${s.out} não existe — rode encode antes de posters`);
  const png = path.join(FRAMES, `${s.id}.png`);
  sh("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(s.poster.ss),
    "-i",
    src,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    png,
  ]);

  const { w, h, budget, out } = s.poster;
  const srcMeta = await sharp(png).metadata();
  const upscale = w / srcMeta.width;
  let base = sharp(png).resize(w, h, {
    fit: "cover",
    position: "centre",
    kernel: "lanczos3",
  });
  /* Upscale (só os 3 do portfólio, 720² → 1400×1440) pede sharpen leve para não
     entregar frame borrado; downscale já sai nítido do lanczos3. */
  if (upscale > 1.05) base = base.sharpen({ sigma: 0.8, m1: 0.6, m2: 1.2 });
  const png2 = await base.png().toBuffer();

  let chosen = null;
  for (const q of Q_LADDER) {
    const buf = await sharp(png2).webp({ quality: q, effort: 6 }).toBuffer();
    if (buf.length <= budget) {
      chosen = { q, buf };
      break;
    }
    chosen = { q, buf };
  }
  if (chosen.buf.length > budget)
    die(
      `${out} não cabe em ${fmt(budget)} nem a q=40 (${fmt(chosen.buf.length)}). ` +
        `Não vou entregar asset fora de budget — reveja a dimensão no MANIFEST.`,
    );
  mkdirp(path.dirname(abs(out)));
  writeFileSync(abs(out), chosen.buf);
  unlinkSync(png);
  const m = await sharp(chosen.buf).metadata();
  console.log(
    `  OK ${out.padEnd(38)} ${fmt(chosen.buf.length).padStart(9)} / máx ${fmt(budget)}  ` +
      `${m.width}×${m.height} q=${chosen.q} ss=${s.poster.ss}` +
      (upscale > 1.05 ? ` (upscale ${upscale.toFixed(2)}× + sharpen)` : ""),
  );
}

async function cmdPosters() {
  mkdirp(FRAMES);
  for (const s of SOURCES) await makePoster(s);
}

/* ─────────────────────────── main ─────────────────────────── */

const cmd = process.argv[2] ?? "all";
if (cmd === "head") await headAll();
else if (cmd === "fetch") await cmdFetch();
else if (cmd === "scenes") cmdScenes();
else if (cmd === "encode") cmdEncode();
else if (cmd === "posters") await cmdPosters();
else if (cmd === "all") {
  await cmdFetch();
  cmdEncode();
  await cmdPosters();
} else die(`subcomando desconhecido: ${cmd}`);
