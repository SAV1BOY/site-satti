"use client";

import Image from "next/image";
import { useMotionOk } from "@/hooks/useMotionOk";
import styles from "./Hero.module.css";

/**
 * HeroMedia — slot de vídeo A1 do hero (contrato §8 + MANIFEST).
 *
 * Markup FINAL: aponta para o path definitivo do MANIFEST
 * (`/media/hero.mp4`) + poster (`/media/hero-poster.webp`) +
 * `data-asset` no slot (presente no SSR) e no <video>. Quando o
 * .mp4 aparecer no path, o vídeo passa a tocar sem mudança de código.
 *
 * L5/§8: o <video autoplay muted playsInline loop> SÓ monta com
 * motion ok (useMotionOk). Reduced-motion e SSR/primeiro paint =
 * poster via next/image fill priority (L4: sizes real de 100vw —
 * o frame é full-bleed com margem de 12px/8px).
 *
 * A11y: fundo puramente decorativo — wrapper aria-hidden, alt "".
 */

interface HeroMediaProps {
  /** Path definitivo do .mp4 (MANIFEST A1). */
  videoSrc: string;
  /** Poster webp no path do MANIFEST. */
  posterSrc: string;
}

export default function HeroMedia({ videoSrc, posterSrc }: HeroMediaProps) {
  const motionOk = useMotionOk();

  return (
    <div className={styles.media} data-asset={videoSrc} aria-hidden="true">
      <Image
        src={posterSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.poster}
      />
      {motionOk ? (
        <video
          className={styles.video}
          src={videoSrc}
          poster={posterSrc}
          data-asset={videoSrc}
          muted
          playsInline
          loop
          autoPlay
        />
      ) : null}
    </div>
  );
}
