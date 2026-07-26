"use client";

import Image from "next/image";
import { useMediaGate } from "@/hooks/useMediaGate";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";
import styles from "./Hero.module.css";

/**
 * HeroMedia — slot de vídeo A1 do hero (contrato §8 + MANIFEST).
 *
 * Markup FINAL: aponta para o path definitivo do MANIFEST
 * (`/media/hero.mp4`) + poster (`/media/hero-poster.webp`) + `data-asset` no
 * slot (presente no SSR) e no <video>. Trocar o arquivo no path não muda código.
 *
 * v2 — três correções, todas medidas em Chromium real pela auditoria da W10:
 *
 * 1. **Gate de 768px.** O MANIFEST §5 sempre exigiu que o hero vídeo fosse
 *    gated a `min-width: 768px`, e o código gateava só por reduced-motion — o
 *    resultado medido foi `hero.mp4` de 989 KiB baixando no mobile 375, levando
 *    o payload acima da dobra a 2.603 KiB contra os 405 KiB do contrato. 1,2 MB
 *    a ~200 KB/s de throttle do Lighthouse são 6 s de link saturado.
 * 2. **`preload="none"` + `src` só no play intent.** O `<video>` subia com
 *    `autoPlay` e sem `preload`, então bufferizava os 10 s inteiros na
 *    hidratação. É o padrão que o `WorkCard` já usava e que faltava aqui.
 * 3. **`resolveAsset()`.** O vídeo e o poster são assets do modelo estrutural
 *    (V2-D2): em `draft` renderizam marcados; em `final` o vídeo é omitido e o
 *    poster cai no blueprint. Nenhum componente decide isso sozinho.
 *
 * A11y: fundo puramente decorativo — wrapper aria-hidden, alt "".
 */

/** MANIFEST §5: abaixo disto o mobile carrega só o poster. */
const VIDEO_MIN_WIDTH = 768;

interface HeroMediaProps {
  /** Path definitivo do .mp4 (MANIFEST A1). */
  videoSrc: string;
  /** Poster webp no path do MANIFEST. */
  posterSrc: string;
}

export default function HeroMedia({ videoSrc, posterSrc }: HeroMediaProps) {
  const { canPlay, ref } = useMediaGate(VIDEO_MIN_WIDTH);
  const video = resolveAsset(videoSrc);
  const poster = resolveAsset(posterSrc);

  return (
    <div
      ref={ref}
      className={styles.media}
      data-asset={videoSrc}
      {...thirdPartyAttrs(videoSrc)}
      aria-hidden="true"
    >
      {poster.render ? (
        <Image
          src={poster.src}
          alt=""
          fill
          priority
          quality={70}
          sizes="100vw"
          className={styles.poster}
        />
      ) : null}
      {video.render && video.mountVideo && canPlay ? (
        <video
          className={styles.video}
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
