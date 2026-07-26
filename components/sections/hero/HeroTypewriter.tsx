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
 * O caret blaze é bloco de 0.15em × 0.8em com PULSO SUAVE de 1,2s
 * (opacidade 1 → .5 → 1), corrigido em DEC-021 — era um blink 1 → 0 em
 * steps(1), que é outro efeito. Vive no CSS Module, gated por
 * prefers-reduced-motion: no-preference (L5).
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
