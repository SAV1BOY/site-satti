/* parity-timeline.mjs — verificador de paridade coreográfica (ULTRAGOAL v2 · W15).
 *
 * Compara o build da SATTI contra design/awsmd-ref/awsmd-motion.json, que foi derivado
 * do frame-timeline.csv real do modelo (3.288 frames, 137 s @ 24 fps, 1920×1080).
 *
 *   node scripts/parity-timeline.mjs --dom [url]     ~2 s   · só DOM, entra no `verify`
 *   node scripts/parity-timeline.mjs [url]           ~5 min · captura de frames completa
 *   node scripts/parity-timeline.mjs --reduced [url]        · prova que reduced-motion é estático
 *
 * Duas leis que mantêm a comparação honesta:
 *
 *  1. COMPARAR DISTRIBUIÇÕES, NUNCA ÍNDICES DE FRAME. O conteúdo é outro; só a FORMA da
 *     timeline é comparável. Números de frame de pico nunca são diffados diretamente.
 *
 *  2. A CAPTURA DE REFERÊNCIA É UM SCROLL EM PASSOS, NÃO CONTÍNUO. Só 29,8% dos frames
 *     dela têm diff > 1.0 (mediana 0.009; 549 rajadas com intervalo mediano de 3 frames).
 *     Se a nossa captura for contínua, todo frame carrega delta, o duty cycle vai a ~1.0
 *     e TODA comparação de frame vira ruído. Por isso o gate de duty cycle roda PRIMEIRO
 *     e é um gate sobre o HARNESS, não sobre o site.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARGV = process.argv.slice(2);
const DOM_ONLY = ARGV.includes("--dom");
const REDUCED = ARGV.includes("--reduced");
const URL_ARG = ARGV.find((a) => a.startsWith("http")) ?? "http://localhost:3000";

const REF = JSON.parse(
  readFileSync(new URL("../design/awsmd-ref/awsmd-motion.json", import.meta.url), "utf8"),
);
const TH = REF.parityThresholds;

/* ------------------------------------------------------------------ helpers */

const results = [];
const gate = (name, passed, evidence) => {
  results.push({ name, passed, evidence });
  console.log(`${passed ? "  OK  " : " FAIL "} ${name} — ${evidence}`);
  return passed;
};
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/* -------------------------------------------------------- fase 1 · só DOM
 * Barata, exata e sem dependência de pixel. É a metade que pega um pin
 * acidental e um desalinhamento de fronteira — e é a que cabe no `verify`.
 */

async function domPass(page) {
  const dom = await page.evaluate(() => {
    /* Preferimos [data-section] (que a W11 adiciona). Enquanto não existir,
       caímos para a ordem estrutural — o resultado é o mesmo hoje. */
    let els = [...document.querySelectorAll("[data-section]")];
    let fromAttr = els.length > 0;
    if (!fromAttr) {
      els = [...document.querySelectorAll("main > section"), ...document.querySelectorAll("footer")];
    }
    const luminance = (rgb) => {
      const m = rgb.match(/\d+(\.\d+)?/g);
      if (!m) return null;
      const [r, g, b] = m.map(Number);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };
    return {
      fromAttr,
      docHeight: document.documentElement.scrollHeight,
      vh: window.innerHeight,
      sections: els.map((el, i) => {
        const cs = getComputedStyle(el);
        /* fundo efetivo: sobe a árvore até achar um bg não-transparente */
        let node = el, bg = cs.backgroundColor;
        while (node && (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) {
          node = node.parentElement;
          if (!node) break;
          bg = getComputedStyle(node).backgroundColor;
        }
        /* maior descendente com position:sticky — assinatura de pin */
        let stickyH = 0;
        for (const d of el.querySelectorAll("*")) {
          const p = getComputedStyle(d).position;
          if (p === "sticky") stickyH = Math.max(stickyH, d.getBoundingClientRect().height);
        }
        return {
          idx: i,
          id: el.dataset.section ?? el.id ?? el.tagName.toLowerCase() + i,
          tone: el.dataset.tone ?? null,
          offsetTop: el.offsetTop,
          offsetHeight: el.offsetHeight,
          bgLuma: luminance(bg),
          stickyH,
        };
      }),
    };
  });

  console.log(
    `\n== DOM ==  doc ${dom.docHeight}px · vh ${dom.vh} · ${dom.sections.length} seções` +
      ` · fonte: ${dom.fromAttr ? "[data-section]" : "estrutural (W11 adiciona data-section)"}`,
  );

  /* --- teste 7 · pin budget ------------------------------------------------
   * Nada no modelo é pinado. Mas "seção alta" ≠ "seção pinada": o portfólio do
   * próprio modelo tem 2.657px = 2,46 viewports e não é pinado. A assinatura de
   * pin é um STICKY STAGE MENOR QUE A SEÇÃO — a seção rola, o palco fica. Uma
   * seção sem descendente sticky não pode estar pinada, independente da altura.
   * (Formulação corrigida: a versão anterior dividia por max(stickyH, vh) e
   * reprovava qualquer seção com mais de 1,25 viewport.)                     */
  const pins = dom.sections
    .filter((s) => s.stickyH > 0)
    .map((s) => ({ id: s.id, budget: s.offsetHeight / s.stickyH, stickyH: s.stickyH }))
    .filter((p) => p.budget > TH.pinBudgetMax.value);
  const stickyCount = dom.sections.filter((s) => s.stickyH > 0).length;
  gate(
    `pin budget ≤ ${TH.pinBudgetMax.value} (seção ÷ sticky stage)`,
    pins.length === 0,
    pins.length
      ? pins.map((p) => `${p.id}=${p.budget.toFixed(2)} (sticky ${Math.round(p.stickyH)}px)`).join(", ")
      : `${stickyCount} seção(ões) com sticky, nenhuma pinada`,
  );

  /* --- testes 1+2 · perfil de altura por seção --------------------------
   * Comparação exata, não reamostrada: o campo `satti` do awsmd-motion.json
   * já mapeia bloco do modelo → seção da SATTI, então agrupamos os dois lados
   * nos MESMOS grupos. A ordem de render é fixa (app/[locale]/page.tsx), então
   * o índice é mapeamento suficiente enquanto data-section não existir.
   * O rodapé fica FORA: a razão 2,77 dele na referência é o operador parado no
   * fim do documento por 23 s, não coreografia.                            */
  const GROUPS = [
    { name: "hero", ours: [0], ref: ["hero"] },
    { name: "values+services", ours: [1, 2], ref: ["band+services"] },
    { name: "about", ours: [3], ref: ["about"] },
    { name: "automation", ours: [4], ref: ["development-open", "development-mosaic"] },
    { name: "portfolio", ours: [5], ref: ["portfolio"] },
    { name: "banner", ours: [6], ref: ["banner"] },
    { name: "cases", ours: [7], ref: ["cases"] },
    { name: "reviews", ours: [8], ref: ["reviews"] },
  ];
  const refById = Object.fromEntries(REF.sectionTimeline.map((s) => [s.id, s]));
  /* normalizamos os dois lados excluindo o rodapé, para comparar maçã com maçã */
  const refNoFooter = REF.sectionTimeline.filter((s) => s.id !== "footer");
  const refTotal = refNoFooter.reduce((n, s) => n + s.scrollShare, 0);
  const ourTotal = dom.sections.slice(0, -1).reduce((n, s) => n + s.offsetHeight, 0);

  const profile = GROUPS.map((g) => {
    const ours = g.ours.reduce((n, i) => n + (dom.sections[i]?.offsetHeight ?? 0), 0) / ourTotal;
    const theirs = g.ref.reduce((n, id) => n + (refById[id]?.scrollShare ?? 0), 0) / refTotal;
    return { ...g, ours, theirs, delta: ours - theirs };
  });
  const offenders = profile.filter((p) => Math.abs(p.delta) > TH.scrollShareTolerance);
  gate(
    `fatia de altura por seção dentro de ±${TH.scrollShareTolerance}`,
    offenders.length === 0,
    offenders.length
      ? offenders.map((p) => `${p.name} ${(p.ours * 100).toFixed(1)}% vs ${(p.theirs * 100).toFixed(1)}% (Δ${(p.delta * 100).toFixed(1)}pp)`).join(" · ")
      : `pior Δ ${(Math.max(...profile.map((p) => Math.abs(p.delta))) * 100).toFixed(1)}pp`,
  );
  console.log("       perfil:", profile.map((p) => `${p.name} ${(p.ours * 100).toFixed(1)}/${(p.theirs * 100).toFixed(1)}`).join(" · "));

  /* --- teste 3 · ritmo claro/escuro --------------------------------------
   * É o ritmo da página. A referência: 3 blocos escuros (development-open,
   * development-mosaic, cases) e 7 claros.                                */
  const refDark = REF.sectionTimeline.filter((s) => s.tone === "dark").length;
  const ourDark = dom.sections.filter((s) => (s.tone ? s.tone === "dark" : s.bgLuma !== null && s.bgLuma < 128)).length;
  gate(
    "contagem de seções escuras bate com o modelo",
    ourDark === refDark,
    `nossas ${ourDark} vs referência ${refDark}` +
      (dom.fromAttr ? "" : " (por luminância de fundo; fica exato quando data-tone existir)"),
  );

  /* --- teste 10 · loops rAF persistentes --------------------------------- */
  const rafCount = await page.evaluate(async () => {
    const seen = new Set();
    const orig = window.requestAnimationFrame;
    window.requestAnimationFrame = function (cb) {
      const st = new Error().stack ?? "";
      const line = st.split("\n").slice(2, 4).join("|");
      seen.add(line);
      return orig.call(window, cb);
    };
    for (const y of [0, 0.25, 0.5, 0.75, 1]) {
      window.scrollTo({ top: document.documentElement.scrollHeight * y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 600));
    }
    window.requestAnimationFrame = orig;
    return seen.size;
  });
  gate("loops rAF persistentes ≤ 3", rafCount <= 3, `${rafCount} call sites distintos`);

  return dom;
}

/* -------------------------------------------- fase 2 · captura de frames */

async function framePass(page, dom) {
  const sharp = (await import("sharp")).default;
  const dir = join(tmpdir(), "satti-parity");
  mkdirSync(dir, { recursive: true });

  const TOTAL = REF.meta.totalFrames;
  const FPS = REF.meta.fps;
  const BURST = 3; // 125 ms — a cadência medida da referência
  const maxScroll = dom.docHeight - dom.vh;
  const step = maxScroll / (TOTAL / BURST);

  const rows = [];
  let prevSmall = null, prevHash = null, y = 0;

  console.log(`\n== FRAMES ==  ${TOTAL} frames, passo ${step.toFixed(1)}px a cada ${BURST} frames`);

  for (let f = 0; f < TOTAL; f++) {
    if (f % BURST === 0 && !REDUCED) {
      y = Math.min(maxScroll, y + step);
      await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
    }
    const buf = await page.screenshot({ type: "jpeg", quality: 80 });
    const img = sharp(buf);
    const stats = await img.stats();
    const [r, g, b] = stats.channels.slice(0, 3).map((c) => c.mean);
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    const small = await sharp(buf).greyscale().resize(64, 36, { fit: "fill" }).raw().toBuffer();
    let diff = 0;
    if (prevSmall) {
      let acc = 0;
      for (let i = 0; i < small.length; i++) acc += Math.abs(small[i] - prevSmall[i]);
      diff = acc / small.length;
    }
    prevSmall = small;

    /* dHash 9×8 → 64 bits */
    const h = await sharp(buf).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
    let hash = 0n;
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 8; col++)
        if (h[row * 9 + col] > h[row * 9 + col + 1]) hash |= 1n << BigInt(row * 8 + col);
    let ham = 0;
    if (prevHash !== null) { let x = hash ^ prevHash; while (x) { ham += Number(x & 1n); x >>= 1n; } }
    prevHash = hash;

    const sec = dom.sections.findLast((s) => s.offsetTop <= y + dom.vh * 0.5) ?? dom.sections[0];
    rows.push({ frame: f, t: f / FPS, section: sec.id, r, g, b, luma, diff, ham });

    if (f % 240 === 0) process.stdout.write(`\r  frame ${f}/${TOTAL}`);
  }
  process.stdout.write(`\r  frame ${TOTAL}/${TOTAL}\n`);

  /* --- teste 6 · duty cycle (GATE DO HARNESS — roda antes de tudo) ------- */
  const duty = rows.filter((x) => x.diff > 1.0).length / rows.length;
  const dutyOk = gate(
    `duty cycle de movimento ${TH.motionDutyCycle.reference} ±${TH.motionDutyCycle.tolerance}`,
    REDUCED || near(duty, TH.motionDutyCycle.reference, TH.motionDutyCycle.tolerance),
    `${duty.toFixed(3)} (mediana do diff ${median(rows.map((x) => x.diff)).toFixed(4)})`,
  );
  if (!dutyOk && !REDUCED) {
    console.error(
      "\n  A cadência da captura não bate com a da referência. Toda comparação de frame\n" +
        "  abaixo é RUÍDO até isto passar — corrija o harness, não o site.\n",
    );
  }

  /* --- teste 8 · reduced-motion estático -------------------------------- */
  if (REDUCED) {
    const maxDiff = Math.max(...rows.map((x) => x.diff));
    const maxHam = Math.max(...rows.map((x) => x.ham));
    gate("reduced-motion: sem movimento com scroll parado", maxDiff < 0.5 && maxHam === 0,
      `maxDiff ${maxDiff.toFixed(4)} (limite 0.5) · maxHam ${maxHam} (limite 0)`);
  }

  /* --- teste 4 · luminância mediana por tom ------------------------------ */
  if (!REDUCED) {
    const byTone = { light: [], dark: [] };
    for (const s of dom.sections) {
      const rs = rows.filter((x) => x.section === s.id);
      if (!rs.length) continue;
      const tone = s.tone ?? (s.bgLuma !== null && s.bgLuma < 128 ? "dark" : "light");
      byTone[tone].push(median(rs.map((x) => x.luma)));
    }
    const refByTone = { light: [], dark: [] };
    for (const s of REF.sectionTimeline) refByTone[s.tone].push(s.lumaMedian);
    for (const tone of ["light", "dark"]) {
      if (!byTone[tone].length) continue;
      const ours = median(byTone[tone]), theirs = median(refByTone[tone]);
      const tol = tone === "dark" ? 25 : 35;
      gate(`luminância mediana (${tone}) dentro de ±${tol}`, near(ours, theirs, tol),
        `nossa ${ours.toFixed(1)} vs referência ${theirs.toFixed(1)}`);
    }

    /* --- teste 5 · distribuição de picos -------------------------------- */
    const sorted = [...rows].sort((a, b) => b.diff - a.diff);
    const peaks = [];
    for (const cand of sorted) {
      if (peaks.length >= REF.meta.peakCount) break;
      if (peaks.every((p) => Math.abs(p.frame - cand.frame) >= FPS)) peaks.push(cand);
    }
    const refTotal = Object.values(REF.changePeaks.countBySection).reduce((a, b) => a + b, 0);
    const tol = Math.max(TH.peakDistributionTolerance * refTotal, TH.peakDistributionFloor.value);
    gate(`contagem total de picos dentro de ±${tol.toFixed(0)}`, near(peaks.length, refTotal, tol),
      `nossos ${peaks.length} vs referência ${refTotal}`);
  }

  /* --- CSV no MESMO schema da referência (BOM + campos citados) --------- */
  const out = ARGV.includes("--out") ? ARGV[ARGV.indexOf("--out") + 1] : "satti-frame-timeline.csv";
  const hh = (t) => new Date(t * 1000).toISOString().slice(11, 22);
  const head =
    '"frame","timestamp_seconds","timestamp_hh_mm_ss","section","phase_event","mean_r","mean_g",' +
    '"mean_b","mean_luma","frame_difference","perceptual_hash_hamming","is_top_change_peak","extracted_keyframe"';
  const body = rows.map((x) =>
    [x.frame, x.t.toFixed(3), hh(x.t), x.section, "", x.r.toFixed(3), x.g.toFixed(3), x.b.toFixed(3),
     x.luma.toFixed(3), x.diff.toFixed(3), x.ham, "", ""].map((v) => `"${v}"`).join(","));
  writeFileSync(out, "﻿" + head + "\n" + body.join("\n") + "\n", "utf8");
  console.log(`\n  CSV → ${out} (${rows.length} linhas, schema idêntico ao da referência)`);

  rmSync(dir, { recursive: true, force: true });
}

/* ------------------------------------------------------------------- main */

const { chromium } = await import("playwright-core");
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--force-device-scale-factor=1", "--hide-scrollbars"],
});
const ctx = await browser.newContext({
  viewport: { width: REF.meta.viewport.width, height: REF.meta.viewport.height },
  deviceScaleFactor: 1,
  reducedMotion: REDUCED ? "reduce" : "no-preference",
});
const page = await ctx.newPage();

console.log(`parity-timeline · ${URL_ARG} · ${DOM_ONLY ? "só DOM" : "captura completa"}${REDUCED ? " · reduced-motion" : ""}`);

try {
  /* `networkidle` NÃO estabiliza aqui: vídeo em autoplay + analytics mantêm
     conexões abertas indefinidamente. Esperamos o que de fato importa. */
  await page.goto(URL_ARG, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  /* decode não pode disputar corrida com a captura — com teto, porque uma
     imagem que nunca carrega não pode travar a run inteira. */
  await page.evaluate(async () => {
    const pending = [...document.images].filter((i) => !i.complete);
    await Promise.race([
      Promise.all(pending.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))),
      new Promise((r) => setTimeout(r, 8000)),
    ]);
  });
  await page.waitForTimeout(1200); // layout assenta (Lenis + fontes)

  const dom = await domPass(page);
  if (!DOM_ONLY) await framePass(page, dom);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} gates de paridade passaram`);
if (failed.length) {
  console.error("\nREPROVOU:");
  for (const f of failed) console.error(`  ${f.name} — ${f.evidence}`);
  process.exit(1);
}
