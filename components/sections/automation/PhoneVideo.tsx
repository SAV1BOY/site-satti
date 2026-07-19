"use client";

/**
 * PhoneVideo — slot de vídeo A6 na tela do phone (S6 Automação).
 * Contrato §8 (família autoplay: hero/stats/phone):
 * - Markup FINAL apontando pro path definitivo do MANIFEST +
 *   poster + data-asset — quando o .mp4 aparecer no path, toca
 *   sem mudança de código.
 * - `muted playsInline loop autoplay`, mas o <video> SÓ monta com
 *   motion ok (useMotionOk). Reduced-motion = só o poster (L5).
 * - Poster sempre presente via next/image com sizes reais (L4).
 */

import Image from "next/image";

import { useMotionOk } from "@/hooks/useMotionOk";
import styles from "./Automation.module.css";

interface PhoneVideoProps {
  /** Path definitivo do .mp4 (MANIFEST — ex.: /media/phone.mp4). */
  videoSrc: string;
  /** Poster definitivo (MANIFEST — ex.: /media/phone-poster.webp). */
  posterSrc: string;
}

/** Tela interna do phone: 128px de frame − 2×8px de padding. */
const POSTER_SIZES = "112px";

export default function PhoneVideo({ videoSrc, posterSrc }: PhoneVideoProps) {
  const motionOk = useMotionOk();

  return (
    <>
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes={POSTER_SIZES}
        className={styles.phonePoster}
      />
      {motionOk ? (
        <video
          className={styles.phoneVideo}
          src={videoSrc}
          poster={posterSrc}
          data-asset={videoSrc}
          muted
          playsInline
          loop
          autoPlay
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
