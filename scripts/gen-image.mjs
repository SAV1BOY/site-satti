/* gen-image.mjs — pipeline de imagens do W5 (ULTRAGOAL §5.B).
   Gera PNG via API de imagens da OpenAI (OPENAI_API_KEY), pós-processa
   com sharp → WebP DENTRO do budget e grava no path de destino exato.
   Sem chave / erro de API → placeholder blueprint do DS nas dimensões
   finais (nunca bloquear o build por asset).

   Uso:
     node scripts/gen-image.mjs --prompt "..." --size 1200x1500 \
       --out public/img/services/agents.webp --budget 180
     node scripts/gen-image.mjs --prompt-file prompts/A7-agents.txt ...

   Flags: --prompt | --prompt-file · --size WxH · --out <path> ·
          --budget <KB> (default 180) · --label "[ A7 · 4:5 ]" (fallback) */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith("--")) {
      args[key.slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const out = args.out;
const [w, h] = (args.size ?? "1024x1024").split("x").map(Number);
const budgetKb = Number(args.budget ?? 180);

if (!out || !Number.isFinite(w) || !Number.isFinite(h)) {
  console.error(
    "uso: gen-image.mjs --prompt|--prompt-file <p> --size WxH --out <path> [--budget KB] [--label <txt>]",
  );
  process.exit(2);
}

const prompt = args["prompt-file"]
  ? await readFile(args["prompt-file"], "utf-8")
  : args.prompt;

/** Placeholder blueprint do DS (mesma identidade do gen-placeholders). */
function blueprintSvg(width, height, label) {
  const GRID = 64;
  const v = Array.from(
    { length: Math.floor(width / GRID) },
    (_, i) =>
      `<line x1="${(i + 1) * GRID}" y1="0" x2="${(i + 1) * GRID}" y2="${height}"/>`,
  ).join("");
  const hz = Array.from(
    { length: Math.floor(height / GRID) },
    (_, i) =>
      `<line x1="0" y1="${(i + 1) * GRID}" x2="${width}" y2="${(i + 1) * GRID}"/>`,
  ).join("");
  const fs = Math.max(14, Math.round(Math.min(width, height) / 42));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ECEEF2"/>
  <g stroke="#E3E6EB" stroke-width="1">${v}${hz}</g>
  <g stroke="#6E7480" stroke-width="1.5">
    <line x1="${width / 2 - 24}" y1="${height / 2}" x2="${width / 2 + 24}" y2="${height / 2}"/>
    <line x1="${width / 2}" y1="${height / 2 - 24}" x2="${width / 2}" y2="${height / 2 + 24}"/>
  </g>
  <text x="${width / 2}" y="${height / 2 + 56}" text-anchor="middle" font-family="monospace"
    font-size="${fs}" letter-spacing="2" fill="#6E7480">${label}</text>
</svg>`);
}

/** Chama a API de imagens; devolve Buffer PNG ou null (fallback). */
async function generate() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY ausente → placeholder blueprint.");
    return null;
  }
  if (!prompt) {
    console.warn("Sem prompt → placeholder blueprint.");
    return null;
  }
  // A API aceita tamanhos fixos; pedimos o mais próximo e o sharp recorta.
  const apiSize =
    w === h ? "1024x1024" : w > h ? "1536x1024" : "1024x1536";
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt,
        size: apiSize,
        n: 1,
      }),
    });
    if (!res.ok) {
      console.warn(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      console.warn("Resposta sem b64_json → placeholder.");
      return null;
    }
    return Buffer.from(b64, "base64");
  } catch (err) {
    console.warn(`Falha na API (${err?.message}) → placeholder.`);
    return null;
  }
}

const source =
  (await generate()) ??
  blueprintSvg(w, h, args.label ?? `[ ${path.basename(out)} ]`);

// cover crop para a dimensão final + compressão iterativa até o budget
await mkdir(path.dirname(out), { recursive: true });
let quality = 82;
let buffer;
do {
  buffer = await sharp(source)
    .resize(w, h, { fit: "cover", position: "attention" })
    .webp({ quality })
    .toBuffer();
  quality -= 8;
} while (buffer.length > budgetKb * 1024 && quality >= 34);

if (buffer.length > budgetKb * 1024) {
  console.error(
    `IMPOSSÍVEL caber no budget: ${(buffer.length / 1024).toFixed(1)} KB > ${budgetKb} KB (q=34)`,
  );
  process.exit(1);
}

await writeFile(out, buffer);
console.log(
  `${out} — ${(buffer.length / 1024).toFixed(1)} KB (q=${quality + 8}, ${w}×${h})`,
);
