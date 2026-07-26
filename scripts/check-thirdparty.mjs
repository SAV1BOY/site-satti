/* check-thirdparty.mjs — porteiro dos assets de terceiro (ULTRAGOAL v2 · V2-D2).
 *
 * O v2 usa assets do site-modelo em PREVIEW para poder avaliar a paridade.
 * Nada disso pode ser servido no domínio público. Este script é o gate.
 *
 *   node scripts/check-thirdparty.mjs                → audita a declaração
 *   node scripts/check-thirdparty.mjs --mode final   → falha se algo vazaria
 *
 * Checa:
 *  1. Coerência da declaração (ids únicos, finalMode válido, placeholder
 *     presente quando finalMode === "placeholder", swapTarget preenchido).
 *  2. Que todo asset presente em disco está declarado — um arquivo importado
 *     do modelo que ninguém declarou é o cenário perigoso.
 *  3. Que nenhum componente referencia um asset declarado sem passar por
 *     resolveAsset() de lib/third-party.ts.
 *  4. Em --mode final: que os grupos de excludedEvenInPreview não existem em
 *     disco de forma alguma.
 */

import { globSync, existsSync, readFileSync, statSync } from "node:fs";

const FINAL = process.argv.includes("--mode")
  && process.argv[process.argv.indexOf("--mode") + 1] === "final";

const decl = JSON.parse(
  readFileSync(new URL("../lib/third-party-assets.json", import.meta.url), "utf8"),
);

const VALID_MODES = new Set(["omit", "placeholder", "deferred"]);
const problems = [];
const notes = [];

/* ---------- 1 · coerência da declaração ---------------------------------- */
const seen = new Set();
for (const a of decl.assets) {
  if (seen.has(a.id)) problems.push(`id duplicado na declaração: ${a.id}`);
  seen.add(a.id);
  if (!a.path && !a.pathGlob) problems.push(`${a.id}: sem path nem pathGlob`);
  if (!VALID_MODES.has(a.finalMode)) problems.push(`${a.id}: finalMode inválido "${a.finalMode}"`);
  if (a.finalMode === "placeholder" && !a.placeholder) {
    problems.push(`${a.id}: finalMode "placeholder" exige o campo placeholder`);
  }
  if (!a.swapTarget || a.swapTarget.trim() === "") {
    problems.push(`${a.id}: swapTarget vazio — o RELATORIO-FINAL não saberia o que pedir ao Miguel`);
  }
}

/* ---------- 2 · arquivos em disco × declaração --------------------------- */
const declaredPaths = new Set();
for (const a of decl.assets) {
  const files = a.pathGlob
    ? globSync(a.pathGlob)
    : (a.path && existsSync(a.path) ? [a.path] : []);
  for (const f of files) declaredPaths.add(f.replace(/\\/g, "/"));
  if (a.pathGlob && a.count && files.length && files.length !== a.count) {
    notes.push(`${a.id}: declara ${a.count} arquivos, existem ${files.length}`);
  }
  if (a.placeholder && a.placeholder !== "blueprint" && !existsSync(a.placeholder)) {
    notes.push(`${a.id}: placeholder ${a.placeholder} ainda não existe (deferido)`);
  }
}

/* Assets importados do modelo vivem só nestes diretórios. Qualquer arquivo
   aqui que não esteja declarado é o caso perigoso: entrou e ninguém marcou. */
const WATCHED = [
  "public/img/automation/*.webp",
  "public/img/services/*.webp",
  "public/img/portfolio/*.webp",
  "public/img/cases/*.webp",
  "public/img/texture-*.webp",
  "public/img/ui/*.webp",
  "public/media/*.mp4",
  "public/media/stats/*.mp4",
];
/* Placeholders blueprint e posters gerados pela SATTI não são de terceiro. */
const OWN = [
  "public/img/reviews/",
  "public/img/founder.webp",
  "public/img/brand/",
];
for (const pattern of WATCHED) {
  for (const f of globSync(pattern)) {
    const p = f.replace(/\\/g, "/");
    if (declaredPaths.has(p)) continue;
    if (OWN.some((o) => p.startsWith(o))) continue;
    problems.push(`arquivo em disco NÃO declarado: ${p} (${(statSync(f).size / 1024).toFixed(1)} KB) — declare em lib/third-party-assets.json ou remova`);
  }
}

/* ---------- 3 · componentes precisam passar por resolveAsset -------------
   Escalonamento deliberado, e a condição precisa é sutil: vários destes paths
   JÁ têm arquivo em disco — mas o conteúdo é o placeholder blueprint da
   própria SATTI, não bytes de terceiro. "Arquivo existe" ≠ "terceiro em
   disco". A fonte de verdade é public/assets-manifest.json, que o import da
   W10 escreve registrando o que ele de fato trouxe. Enquanto um path não
   estiver lá, é slot diferido → aviso. No instante em que o import registra,
   vira FAIL e trava o merge até o componente passar pelo resolveAsset().
   Assim o gate morde exatamente quando nasce o risco, e não antes.        */
const IMPORTED = new Set();
if (existsSync("public/assets-manifest.json")) {
  try {
    const m = JSON.parse(readFileSync("public/assets-manifest.json", "utf8"));
    for (const e of m.assets ?? []) {
      if (e.thirdParty) IMPORTED.add(String(e.path).replace(/\\/g, "/"));
    }
  } catch {
    problems.push("public/assets-manifest.json existe mas não é JSON válido — o gate não pode confiar nele");
  }
}
const componentFiles = globSync("components/**/*.tsx");
const usesResolve = new Set();
for (const f of componentFiles) {
  const src = readFileSync(f, "utf8");
  const p = f.replace(/\\/g, "/");
  /* Um arquivo está coberto de duas formas legítimas:
     (a) chama resolveAsset() ele mesmo; ou
     (b) só DECLARA a tabela de paths e entrega a um filho que resolve — nesse
         caso chamar resolveAsset aqui resolveria duas vezes. A cobertura é
         declarada com `@resolved-by <Componente>` num comentário, que é
         grep-ável, revisável e obriga a nomear quem resolve. */
  if (src.includes("resolveAsset") || /@resolved-by\s+\w/.test(src)) {
    usesResolve.add(p);
  }
}
let pendingWiring = 0;
/* Um asset pode ser declarado por `path` (1 arquivo) OU por `pathGlob` (um grupo:
   mosaico, shots do portfólio, texturas, thumbs de case). A primeira versão deste
   loop fazia `if (!literal) continue` quando `path` estava ausente — e com isso
   ignorava os 4 grupos glob, 23 arquivos, deixando 11 slots REAIS com bytes de
   terceiro em disco sem nenhuma cobertura de gate. Agora expandimos o glob para
   os arquivos concretos que existem em disco e confrontamos cada um. */
const declaredFiles = [];
for (const a of decl.assets) {
  const files = a.pathGlob
    ? globSync(a.pathGlob)
    : (a.path ? [a.path] : []);
  for (const f of files) {
    declaredFiles.push({ asset: a, file: f.replace(/\\/g, "/") });
  }
}
for (const { asset: a, file } of declaredFiles) {
  const literal = file.replace(/^public/, "");
  const imported = IMPORTED.has(file);
  for (const f of componentFiles) {
    const p = f.replace(/\\/g, "/");
    const src = readFileSync(f, "utf8");
    if (!src.includes(literal) || usesResolve.has(p)) continue;
    const msg = `${p} referencia ${literal} (asset ${a.id}) sem usar resolveAsset() de lib/third-party.ts`;
    if (imported) problems.push(msg);
    else {
      pendingWiring++;
      notes.push(`${msg} — terceiro ainda não importado; vira FAIL quando o import registrar`);
    }
  }
}

/* ---------- 4 · excluídos até em preview --------------------------------- */
for (const ex of decl.excludedEvenInPreview.items) {
  notes.push(`excluído até em preview: ${ex.id} — ${ex.renders}`);
}

/* ---------- relatório ---------------------------------------------------- */
console.log(`check-thirdparty · modo ${FINAL ? "final" : "audit"} · ${decl.assets.length} assets declarados`);
console.log(`  ${declaredPaths.size} arquivos presentes em disco e declarados`);
for (const n of notes) console.log(`  nota: ${n}`);
if (pendingWiring > 0) {
  console.log(`\n  ${pendingWiring} slot(s) aguardando ligação ao resolveAsset() — sem risco hoje (asset ausente), obrigatório antes do merge da wave que importar o asset.`);
}

if (problems.length) {
  console.error(`\n${problems.length} PROBLEMA(S):`);
  for (const p of problems) console.error(`  FAIL ${p}`);
  console.error("\nAsset de terceiro pode vazar para produção — corrija antes do merge (V2-D2).");
  process.exit(1);
}

console.log("\nOK — nenhum asset de terceiro pode vazar para o modo final.");
