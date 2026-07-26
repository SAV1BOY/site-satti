"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionOk } from "./useMotionOk";

/**
 * useMediaGate — decide QUANDO um slot de vídeo pode montar, e devolve o ref
 * que observa o slot.
 *
 * Existe porque a auditoria da W10 mediu, em Chromium real e sem rolar a página,
 * **2.603 KiB no mobile 375** contra os 405 KiB que o MANIFEST §5 promete — 6,4×
 * o contrato. Duas causas, ambas endereçadas aqui:
 *
 * 1. **O gate de largura não existia.** O `hero.mp4` de 989 KiB baixava no
 *    mobile. O MANIFEST §5 é explícito: hero vídeo é gated a `min-width: 768px`,
 *    porque 1,2 MB a ~200 KB/s de throttle do Lighthouse são 6 s de link
 *    saturado — e o LCP já era 3,0 s com 4 KiB de imagem.
 * 2. **Os vídeos montavam na hidratação.** 6 dos 12 subiam com `autoPlay` sem
 *    `preload="none"` e sem IntersectionObserver, então bufferizavam a duração
 *    INTEIRA antes de qualquer scroll: 1.610 KiB de mp4 no primeiro paint. O
 *    `WorkCard` já fazia certo (`preload="none"` + src atribuído no primeiro
 *    play intent) — o padrão existia no projeto e só não tinha sido aplicado.
 *
 * O gate combina três condições, todas necessárias:
 *   - `prefers-reduced-motion: no-preference` (L5)
 *   - viewport ≥ `minWidth` (default 0 = sem restrição; o hero passa 768)
 *   - o slot está em view, por IntersectionObserver com threshold 0.35
 *     (o valor decidido em DEC-018, o mesmo do WorkCard)
 *
 * SSR e primeiro paint retornam sempre `false`: o poster é o estado inicial, e é
 * também o estado reduced-motion — as duas rotas convergem por construção.
 */

/** Threshold único de play/pause de mídia no projeto (DEC-018). */
const IO_THRESHOLD = 0.35;

export interface MediaGate {
  /** true quando o <video> pode montar e tocar. */
  canPlay: boolean;
  /** Callback ref para o elemento que envolve o slot. */
  ref: (el: Element | null) => void;
}

export function useMediaGate(minWidth = 0): MediaGate {
  const motionOk = useMotionOk();
  const [wideEnough, setWideEnough] = useState(minWidth === 0);
  const [inView, setInView] = useState(false);
  const node = useRef<Element | null>(null);
  const io = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (minWidth === 0) return;
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setWideEnough(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [minWidth]);

  useEffect(() => {
    /* Sem motion ok não há o que observar — e não montar o observer é mais
       forte que pausar: nem a rede é tocada. Não precisa (nem deve) zerar
       `inView` aqui: `canPlay` já exige `motionOk`, então um `inView` obsoleto
       não tem efeito — e setState síncrono no corpo do effect causaria render
       em cascata (`react-hooks/set-state-in-effect`). */
    if (!motionOk) return;
    const observer = new IntersectionObserver(
      (records) => {
        const rec = records[records.length - 1];
        if (rec) setInView(rec.isIntersecting);
      },
      { threshold: IO_THRESHOLD },
    );
    io.current = observer;
    if (node.current) observer.observe(node.current);
    return () => {
      observer.disconnect();
      io.current = null;
    };
  }, [motionOk]);

  const ref = useCallback((el: Element | null) => {
    if (node.current && io.current) io.current.unobserve(node.current);
    node.current = el;
    if (el && io.current) io.current.observe(el);
  }, []);

  return { canPlay: motionOk && wideEnough && inView, ref };
}
