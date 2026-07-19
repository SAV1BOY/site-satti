"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Cursor custom do DS: dot 8px (segue direto) + anel 36px (lerp).
 * Estados via data-cursor nos elementos interativos (anel escala).
 * Off em touch (pointer: coarse) e reduced-motion (L5).
 * Só transform/opacity no frame loop (L10).
 */
export default function CursorProvider({ children }: { children: ReactNode }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!fine || !motionOk || !dot || !ring) return;

    document.documentElement.dataset.cursor = "on";

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let scale = 1;
    let scaleTarget = 1;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-cursor]",
      );
      scaleTarget = target ? 1.6 : 1;
    };

    let raf = requestAnimationFrame(function loop() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      scale += (scaleTarget - scale) * 0.18;
      dot.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      delete document.documentElement.dataset.cursor;
    };
  }, []);

  return (
    <>
      {children}
      <div ref={dotRef} aria-hidden className="cursor-dot" />
      <div ref={ringRef} aria-hidden className="cursor-ring" />
    </>
  );
}
