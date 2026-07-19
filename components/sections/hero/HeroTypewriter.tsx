"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import styles from "./Hero.module.css";

/**
 * HeroTypewriter — 3ª linha do H1 (comp S1+S2): cicla as palavras
 * OFICIAIS hero.words (VENDER · ATENDER · OPERAR · CRESCER) via
 * hooks/useTypewriter (90ms/char · 1400ms hold · 45ms delete —
 * defaults do hook = valores da comp).
 *
 * L1: as palavras chegam por props do server (JSON) — nada aqui.
 * L2: o caret blaze é O elemento blaze do viewport do hero (F0–F5);
 *     blink steps(1) vive no CSS Module, gated por
 *     prefers-reduced-motion: no-preference (L5).
 * L5: reduced-motion/SSR → o hook devolve a 1ª palavra fixa
 *     ("VENDER", comp), caret estático aceso.
 * A11y: palavra atual no fluxo do h1 com aria-live="off" (não
 *     anuncia cada tecla); ghost reserva largura ("CRESCER" =
 *     última palavra) → zero layout shift, escondido de AT.
 */

export default function HeroTypewriter({ words }: { words: string[] }) {
  const { text } = useTypewriter(words);
  const ghost = words[words.length - 1] ?? "";

  return (
    <span className={styles.typeLine}>
      <span className={styles.ghost} aria-hidden="true">
        {ghost}
      </span>
      <span className={styles.live}>
        <span aria-live="off">{text}</span>
        <span className={styles.caret} aria-hidden="true" />
      </span>
    </span>
  );
}
