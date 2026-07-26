import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * OG image 1200×630 via código (§5.B — não via GPT): identidade
 * Blueprint Industrial com os tokens travados (paper, grade 1px,
 * wordmark, marcador blaze único).
 *
 * Tipografia (W10-C): **Archivo**, a display do DS — o defeito aceito
 * ("Archivo não embarca no edge sem fetch externo") está fechado. Esta rota é
 * gerada no BUILD, onde `fs` existe, então a fonte é lida do disco e embarcada
 * no `ImageResponse`; os 45,8 KB nunca chegam a um cliente porque
 * `assets/fonts/` está fora de `public/`.
 *
 * A fonte é a instância ESTÁTICA em wght=800, não o variable font: o satori do
 * Next 16 estoura em `parseFvarAxis` ao ver uma tabela `fvar`, e mesmo se não
 * estourasse ele não instancia eixos — o peso do arquivo é o peso final. Ver
 * `assets/fonts/README.md`.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SATTI";

const PAPER = "#F7F8FA";
const IRON = "#15171B";
const STEEL = "#6E7480";
const BLAZE = "#FF4D00";
const LINE = "#E3E6EB";

/** `process.cwd()` é a raiz do projeto no build do Next. */
const archivo = readFileSync(
  join(process.cwd(), "assets/fonts/Archivo-ExtraBold-latin.ttf"),
);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          padding: "72px 88px",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 14, height: 14, background: BLAZE }} />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: STEEL,
            }}
          >
            sattiai.com
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 220,
            fontWeight: 800,
            letterSpacing: -8,
            textTransform: "uppercase",
            color: IRON,
            lineHeight: 0.9,
          }}
        >
          SATTI
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 28,
            fontSize: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: STEEL,
          }}
        >
          <div>01 — 06</div>
          <div>PT / EN</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivo, weight: 800, style: "normal" },
      ],
    },
  );
}
