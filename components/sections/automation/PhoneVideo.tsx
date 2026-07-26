"use client";

/**
 * PhoneVideo — slot de vídeo A6 na tela do phone (S6 Automação).
 *
 * Contrato §8 (família autoplay: hero/stats/phone): markup FINAL apontando pro
 * path definitivo do MANIFEST + poster + `data-asset` — trocar o arquivo no path
 * não muda código.
 *
 * v2: montava na hidratação com `autoPlay` e sem `preload`, então bufferizava os
 * 5,44 s inteiros antes de qualquer scroll (medido pela auditoria da W10 —
 * `readyState=4`, `buffered=<duração inteira>`). Agora `useMediaGate()` só monta
 * com motion ok E o slot em view (IO threshold 0.35, DEC-018), com
 * `preload="none"`, e vídeo/poster passam por `resolveAsset()` (V2-D2).
 *
 * Este componente é um fragmento dentro da moldura do phone, então o ref do gate
 * precisa de um elemento próprio para observar — daí o wrapper absoluto, que não
 * altera layout (`inset: 0` sobre a tela já posicionada pelo pai).
 */

import Image from "next/image";

import { useMediaGate } from "@/hooks/useMediaGate";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";
import styles from "./Automation.module.css";

interface PhoneVideoProps {
  /** Path definitivo do .mp4 (MANIFEST — ex.: /media/phone.mp4). */
  videoSrc: string;
  /** Poster definitivo (MANIFEST — ex.: /media/phone-poster.webp). */
  posterSrc: string;
}

/**
 * Largura real da moldura do vídeo central por patamar (W12 · geometry →
 * `automation.centerVideo`). Era "112px", da moldura de 128px do blueprint que
 * a W12 substituiu: com o slot agora em 348px, aquele hint fazia o next/image
 * servir um poster de 112px esticado 3,1× — só o `sizes` mudou, o gate de IO e
 * o preload="none" medidos na W10 estão intocados.
 */
const POSTER_SIZES =
  "(max-width: 565px) 145px, (max-width: 991px) 193px, (max-width: 1600px) 297px, 348px";

export default function PhoneVideo({ videoSrc, posterSrc }: PhoneVideoProps) {
  const { canPlay, ref } = useMediaGate();
  const video = resolveAsset(videoSrc);
  const poster = resolveAsset(posterSrc);

  return (
    <span
      ref={ref}
      className={styles.phoneSlot}
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
          className={styles.phonePoster}
        />
      ) : null}
      {video.render && video.mountVideo && canPlay ? (
        <video
          className={styles.phoneVideo}
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
    </span>
  );
}
