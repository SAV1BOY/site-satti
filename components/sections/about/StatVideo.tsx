"use client";

/**
 * StatVideo — slot de vídeo A2–A5 no canto do stat-card (S5 Sobre).
 * Contrato §8 (família autoplay: hero/stats/phone):
 * - Markup FINAL apontando pro path definitivo do MANIFEST
 *   (`/media/stats/stat-{n}.mp4`) + poster
 *   (`/media/stats/stat-{n}-poster.webp`) + `data-asset` no wrapper
 *   (presente no SSR) e no <video> — quando o .mp4 aparecer no path,
 *   toca sem mudança de código.
 * - `muted playsInline loop autoplay preload="metadata"`, mas o
 *   <video> SÓ monta com motion ok (useMotionOk). Reduced-motion e
 *   SSR/primeiro paint = só o poster (L5).
 * - Poster sempre presente via next/image com sizes reais (L4:
 *   comp 84×84 mobile · 150×150 desktop).
 * - A11y: canto decorativo — wrapper aria-hidden, alt "".
 */

import Image from "next/image";

import { useMotionOk } from "@/hooks/useMotionOk";
import styles from "./About.module.css";

/** Comp: quadrado 84px (mobile 375) / 150px (desktop 1920). */
const POSTER_SIZES = "(max-width: 767px) 84px, 150px";

interface StatVideoProps {
  /** Path definitivo do .mp4 (MANIFEST A2–A5). */
  videoSrc: string;
  /** Poster webp no path do MANIFEST. */
  posterSrc: string;
}

export default function StatVideo({ videoSrc, posterSrc }: StatVideoProps) {
  const motionOk = useMotionOk();

  return (
    <div className={styles.statSlot} data-asset={videoSrc} aria-hidden="true">
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes={POSTER_SIZES}
        className={styles.statPoster}
      />
      {motionOk ? (
        <video
          className={styles.statVideo}
          src={videoSrc}
          poster={posterSrc}
          data-asset={videoSrc}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
        />
      ) : null}
    </div>
  );
}
