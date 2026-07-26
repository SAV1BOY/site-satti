"use client";

/**
 * StatVideo — slot de vídeo A2–A5 no canto do stat-card (S5 Sobre).
 *
 * Contrato §8 (família autoplay: hero/stats/phone): markup FINAL apontando pro
 * path definitivo do MANIFEST (`/media/stats/stat-{n}.mp4`) + poster +
 * `data-asset` no wrapper (presente no SSR) e no <video>.
 *
 * v2 — o caso mais crítico dos quatro slots de vídeo. São QUATRO na mesma dobra,
 * e a auditoria da W10 mediu os quatro subindo com `autoPlay` + `preload="metadata"`
 * e `readyState=4`, bufferizando a duração inteira antes de qualquer scroll.
 * Agora:
 * - `useMediaGate()` monta o <video> só com motion ok E o slot em view
 *   (IntersectionObserver threshold 0.35, o valor de DEC-018);
 * - `preload="none"` em vez de `"metadata"`;
 * - `resolveAsset()` no vídeo e no poster (V2-D2): em `final` o vídeo é omitido
 *   e o poster cai no blueprint.
 *
 * A11y: canto decorativo — wrapper aria-hidden, alt "".
 */

import Image from "next/image";

import { useMediaGate } from "@/hooks/useMediaGate";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";
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
  const { canPlay, ref } = useMediaGate();
  const video = resolveAsset(videoSrc);
  const poster = resolveAsset(posterSrc);

  return (
    <div
      ref={ref}
      className={styles.statSlot}
      data-asset={videoSrc}
      {...thirdPartyAttrs(videoSrc)}
      aria-hidden="true"
    >
      {poster.render ? (
        <Image
          src={poster.src}
          alt=""
          fill
          sizes={POSTER_SIZES}
          className={styles.statPoster}
        />
      ) : null}
      {video.render && video.mountVideo && canPlay ? (
        <video
          className={styles.statVideo}
          src={video.src}
          /* SEM atributo `poster`: o <Image> logo abaixo já renderiza o poster,
          otimizado por next/image (AVIF + srcSet). O `poster=` do <video>
          baixa o arquivo CRU no path literal, sem otimização nenhuma, e em
          duplicata — a auditoria da W10 mediu 531 KiB só nos 6 do portfólio.
          Um <video> sem dados é transparente, então o <Image> aparece por
          baixo até o primeiro frame chegar. */
          data-asset={videoSrc}
          muted
          playsInline
          loop
          autoPlay
          preload="none"
        />
      ) : null}
    </div>
  );
}
