/* smoke-prod.mjs — smoke test do W8 (§6-W8) contra a URL de produção.
   Usa o Chrome do sistema via playwright-core (channel: "chrome").
   Cobre: 200 + PT/EN + overlays (O1 abre/Esc fecha, O2 via CTA) +
   form (submit real da Server Action → sem envs = erro oficial) +
   reduced-motion (marquee sem animação).
   Rodar: node scripts/smoke-prod.mjs [url] */

import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "https://site-satti.vercel.app";
const results = [];
const check = (name, ok, info = "") => {
  results.push({ name, ok, info });
  console.log(`${ok ? "  OK" : "FAIL"} ${name}${info ? ` — ${info}` : ""}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  // --- PT + estrutura -------------------------------------------------
  const page = await browser.newPage();
  const resp = await page.goto(BASE, { waitUntil: "domcontentloaded" });
  check("GET / responde 200", resp?.status() === 200, `HTTP ${resp?.status()}`);
  check(
    "PT: eyebrow '01 — Serviços' presente",
    (await page.locator("text=01 — Serviços").count()) > 0,
  );
  check(
    "h1 único",
    (await page.locator("h1").count()) === 1,
    `${await page.locator("h1").count()} h1`,
  );
  for (const id of ["servicos", "sobre", "portfolio", "cases", "depoimentos", "contato"]) {
    check(`âncora #${id}`, (await page.locator(`#${id}`).count()) === 1);
  }

  // --- O1 Menu: abre pelo hambúrguer, fecha com Esc -------------------
  await page.locator("header button[aria-haspopup='dialog'][aria-label]").first().click();
  await page.waitForTimeout(600);
  // Número e label vivem em spans separados (split do MenuNavLink) e o
  // label sobe para caps via CSS — matcher pega o texto agregado.
  const menuText = (
    await page
      .locator("[role='dialog']")
      .innerText()
      .catch(() => "")
  ).replace(/\s+/g, " ");
  check(
    "O1 abre (dialog + nav 01-06)",
    (await page.locator("[role='dialog']").count()) === 1 &&
      /06/.test(menuText) &&
      /contato/i.test(menuText),
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check("Esc fecha o O1", (await page.locator("[role='dialog']").count()) === 0);

  // --- O2 Contato: abre pelo CTA do header ----------------------------
  await page.locator("header a[aria-haspopup='dialog']").click();
  await page.waitForTimeout(600);
  check("O2 abre pelo CTA", (await page.locator("[role='dialog']").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // --- Form: submit real (sem envs → erro oficial degradado) ----------
  await page.locator("#footer-name").scrollIntoViewIfNeeded();
  await page.fill("#footer-name", "Smoke Test W8");
  await page.fill("#footer-email", "smoke@sattiai.com");
  await page.fill("#footer-message", "Mensagem de smoke test do gate W8.");
  await page.locator("#contato button[type='submit']").click();
  await page.waitForTimeout(4000);
  const errorVisible = await page
    .locator("text=Não foi possível enviar")
    .isVisible()
    .catch(() => false);
  const successVisible = await page
    .locator("#contato >> text=Sucesso")
    .isVisible()
    .catch(() => false);
  check(
    "form responde (erro oficial degradado OU sucesso)",
    errorVisible || successVisible,
    errorVisible ? "erro oficial (sem envs — esperado)" : successVisible ? "sucesso" : "sem feedback",
  );
  await page.close();

  // --- EN espelho ------------------------------------------------------
  const pageEn = await browser.newPage();
  const respEn = await pageEn.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
  check("GET /en responde 200", respEn?.status() === 200);
  check(
    "EN: '01 — Services' presente",
    (await pageEn.locator("text=01 — Services").count()) > 0,
  );
  await pageEn.close();

  // --- Reduced-motion: marquee estático -------------------------------
  const ctxReduced = await browser.newContext({ reducedMotion: "reduce" });
  const pageR = await ctxReduced.newPage();
  await pageR.goto(BASE, { waitUntil: "domcontentloaded" });
  const marqueeAnim = await pageR
    .locator("[class*='Marquee'] [class*='track']")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName)
    .catch(() => "none");
  check(
    "reduced-motion: marquee sem animação",
    marqueeAnim === "none",
    `animation-name: ${marqueeAnim}`,
  );
  const pulseCount = await pageR.locator("circle[style*='offset-path']").count();
  check("reduced-motion: zero pulso na Linha", pulseCount === 0, `${pulseCount} pulsos`);
  await ctxReduced.close();
} finally {
  await browser.close();
}

const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} checks OK`);
if (fails.length > 0) process.exit(1);
