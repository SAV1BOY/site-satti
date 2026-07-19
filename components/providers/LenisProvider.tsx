"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Scroll suave global (awsmd-mirror). Desligado em reduced-motion (L5):
 * o scroll nativo é o fallback estático.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.12 });
    let raf = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
