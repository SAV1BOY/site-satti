"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import styles from "./page.module.css";

/**
 * Demos client do playground W2 (página some no W7 — §6).
 * TypewriterDemo: usa as palavras OFICIAIS do hero (copy-law L1 —
 * strings vêm do JSON via props, nada inventado aqui).
 * Caret blaze: elemento blaze do viewport (L2), blink em steps(1)
 * só com motion ok (L5, no CSS Module).
 */
export function TypewriterDemo({ words }: { words: string[] }) {
  const { text } = useTypewriter(words);

  return (
    <p className={styles.typewriter}>
      {text}
      <span className={styles.caret} aria-hidden="true" />
    </p>
  );
}
