"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveAsset } from "@/lib/third-party";
import styles from "./HeroShowreel.module.css";

/**
 * HeroShowreel — slot SR (MANIFEST §1) na geometria de
 * awsmd-geometry.json → `hero.showreel`.
 *
 * A SATTI não tem showreel. O slot nasce apontando para o path
 * definitivo (`/media/showreel.mp4`) e o SERVIDOR decide o modo por
 * `existsSync` (Hero.tsx) — trocar o arquivo no path não muda código:
 *
 *   mode="player"  → arquivo existe: poster + <video preload="none">,
 *                    play sob clique no botão de 88px (MANIFEST §1).
 *   mode="anchor"  → arquivo ausente: o PLAYER é omitido (nenhum
 *                    <video> monta, em draft ou em final) e o botão
 *                    vira âncora para #portfolio, que é o lugar onde
 *                    o trabalho de fato está.
 *
 * O selo é SVG inline first-party e o texto dele é copy OFICIAL do JSON
 * (L1): `hero.showreelPlayAriaLabel` no modo player, o rótulo de
 * `footer.navigation` no modo âncora. Nada de string inventada.
 *
 * L11 · client só por causa do estado de play (um useState).
 */

export type ShowreelMode = "player" | "anchor";

interface HeroShowreelProps {
  mode: ShowreelMode;
  /** Path definitivo do .mp4 (MANIFEST SR). */
  videoSrc: string;
  /** Poster — passado só quando o arquivo existe em disco. */
  posterSrc?: string;
  /** hero.showreelPlayAriaLabel — nome acessível do botão de play. */
  playLabel: string;
  /** Rótulo oficial do destino no modo âncora (footer.navigation). */
  anchorLabel: string;
  anchorHref: string;
}

/** id único do path do anel — há exatamente um selo na página. */
const SEAL_RING_ID = "hero-showreel-seal-ring";

/**
 * Texto do anel: repete o rótulo oficial até fechar a volta.
 * Um rótulo curto ("Portfólio") esticado por `textLength` para os 214
 * unidades do anel viraria letra solta; repetir é o que selo faz.
 */
function ringLabel(label: string): string {
  const unit = `${label.toUpperCase()} · `;
  if (unit.trim().length === 0) return "";
  let out = unit;
  // Teto de repetições: guarda contra rótulo de 1 caractere.
  for (let i = 0; i < 8 && out.length < 40; i += 1) out += unit;
  return out;
}

function ShowreelSeal({ label }: { label: string }) {
  return (
    <svg
      className={styles.seal}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Anel r=44 → comprimento 276,46 unidades. r=44 e não 38 porque o
            selo mede 121,44px e o botão 88: um anel a 38% do box cairia a
            2px da borda do botão e o texto (≈9,7px) atravessaria o disco
            claro, onde é da mesma cor. A 44% sobram 9,4px de folga. */}
        <path
          id={SEAL_RING_ID}
          fill="none"
          d="M50 6a44 44 0 1 1 0 88 44 44 0 1 1 0-88"
        />
      </defs>
      <text className={styles.sealText}>
        <textPath
          href={`#${SEAL_RING_ID}`}
          startOffset="14"
          textLength="248"
          lengthAdjust="spacing"
        >
          {ringLabel(label)}
        </textPath>
      </text>
      {/* Ponto blaze no topo do anel, no vão deixado pelo startOffset. */}
      <circle className={styles.sealDot} cx="50" cy="6" r="2.6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      className={styles.playIcon}
      viewBox="0 0 20 22"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 9.27a1.5 1.5 0 0 1 0 2.6L2.5 21.4A1.5 1.5 0 0 1 .25 20.1V1.04A1.5 1.5 0 0 1 2.5-.26Z" />
    </svg>
  );
}

export default function HeroShowreel({
  mode,
  videoSrc,
  posterSrc,
  playLabel,
  anchorLabel,
  anchorHref,
}: HeroShowreelProps) {
  const [playing, setPlaying] = useState(false);

  /* V2-D2: todo path de mídia passa pelo resolveAsset. O showreel é
     first-party (não está na declaração), então isto é passagem — mas
     é o ponto único de decisão se algum dia ele entrar na lista. */
  const video = resolveAsset(videoSrc);
  const poster = posterSrc ? resolveAsset(posterSrc) : undefined;

  const isPlayer = mode === "player";
  const sealLabel = isPlayer ? playLabel : anchorLabel;

  return (
    <div className={styles.root} data-mode={mode}>
      <div className={styles.frame} data-asset={videoSrc}>
        {poster?.render && !playing ? (
          <Image
            src={poster.src}
            alt=""
            fill
            quality={70}
            sizes="405px"
            className={styles.poster}
          />
        ) : null}

        {isPlayer && playing && video.render ? (
          /* controls: o showreel tem áudio e é iniciado pelo usuário —
             ele precisa poder pausar sem depender de hover. */
          <video
            className={styles.video}
            src={video.src}
            data-asset={videoSrc}
            preload="none"
            playsInline
            autoPlay
            controls
          />
        ) : null}

        {!playing ? (
          isPlayer ? (
            <button
              type="button"
              className={styles.trigger}
              aria-label={playLabel}
              onClick={() => {
                setPlaying(true);
              }}
            >
              <PlayIcon />
              <ShowreelSeal label={sealLabel} />
            </button>
          ) : (
            <a
              className={styles.trigger}
              href={anchorHref}
              aria-label={anchorLabel}
            >
              <PlayIcon />
              <ShowreelSeal label={sealLabel} />
            </a>
          )
        ) : null}
      </div>
    </div>
  );
}
