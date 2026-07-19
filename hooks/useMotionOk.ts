"use client";

import { useEffect, useState } from "react";

/**
 * useMotionOk — preferência de motion como estado React (L5).
 *
 * SSR/primeiro paint: `false` (conservador — nada anima antes da
 * detecção, evitando flash de animação para quem prefere reduzido).
 * Após o mount, sincroniza com `(prefers-reduced-motion: no-preference)`
 * e acompanha mudanças ao vivo.
 */
export function useMotionOk(): boolean {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const sync = () => {
      setMotionOk(mql.matches);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => {
      mql.removeEventListener("change", sync);
    };
  }, []);

  return motionOk;
}
