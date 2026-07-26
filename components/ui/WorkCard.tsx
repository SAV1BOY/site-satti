"use client";

/**
 * WorkCard — S7 Portfólio
 * Geometria: design/awsmd-ref/awsmd-geometry.json → portfolio.card /
 * .cardImage / .glow / .linkButton / .infoPill (fonte única, DEC-016).
 * Copy e paleta: comps S7 Portfolio Desktop 1920 / Mobile 375.
 *
 * ANATOMIA V2 (W12-E) — mudou de "card graphite com mídia no topo e meta
 * embaixo" para o card do modelo: a MÍDIA PREENCHE o card inteiro (720px,
 * raio 33) e o texto vive numa info-pill ancorada embaixo à esquerda. Três
 * camadas empilhadas: .media (parallax) → .glow (hover) → .pill (texto).
 *
 * Comportamento do vídeo (L5/L10) — INTOCADO nesta wave:
 * - SSR/estático: só o poster via next/image (sizes reais, L4).
 * - Motion ok: monta <video> preload="none" com data-asset; o src só é
 *   atribuído no primeiro intent de play.
 * - Pointer fino: play() em mouseenter/focus quando in-view; pause ao sair.
 * - Touch: play() quando in-view (IO threshold 0.45), pause fora, com claim
 *   único entre cards (o glow é blaze).
 * - Reduced-motion: vídeo nunca monta nem toca — só o poster.
 *
 * O rAF próprio SAIU (W12-E): ele existia "porque L10 manda passar por
 * rAF", mas syncPlayback só chama play()/pause() — não escreve estilo nem
 * lê layout, então não há frame a alinhar. Era 1 dos 7 call sites de rAF
 * que o `parity:dom` acusa (teto do projeto: 2 loops persistentes).
 *
 * Parallax alternado (±150px, ±75 em ≤900px, desligado <768px): track do
 * loop COMPARTILHADO (useScrollTimeline) sobre a camada .media, que é
 * sobredimensionada em ±150px verticalmente justamente para que o
 * deslocamento nunca exponha a borda da imagem. Nunca abrir rAF novo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./WorkCard.module.css";
import { resolveAsset } from "@/lib/third-party";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";

type HeadingLevel = "h2" | "h3" | "h4";

export interface WorkCardProps {
  title: string;
  tags: string[];
  videoSrc: string;
  posterSrc: string;
  href?: string;
  headingLevel?: HeadingLevel;
  /**
   * Sentido do parallax da mídia: +1 desce, −1 sobe. O pai calcula por
   * `(coluna + linha) % 2` para que cards vizinhos derivem em sentidos
   * opostos (é o efeito; um sentido só não se lê).
   */
  parallaxDir?: 1 | -1;
}

/** Grid S7: 1 coluna mobile · 2 colunas no container 1440 (gutter 4vw, gap 24). */
const POSTER_SIZES =
  "(max-width: 767px) calc(100vw - 40px), (max-width: 1500px) 46vw, 645px";

/** Amplitude do parallax por breakpoint (px). <768px: sem parallax. */
function parallaxAmplitude(width: number): number {
  if (width < 768) return 0;
  if (width <= 900) return 75;
  return 150;
}

/* Coordenação de touch (L2): em telas touch vários cards podem estar
   in-view ao mesmo tempo; só UM pode tocar/brilhar (o glow é blaze).
   Último a entrar leva — o anterior é liberado e pausa. */
let activeTouchRelease: (() => void) | null = null;

function claimTouchPlayback(release: () => void) {
  if (activeTouchRelease !== null && activeTouchRelease !== release) {
    activeTouchRelease();
  }
  activeTouchRelease = release;
}

function releaseTouchPlayback(release: () => void) {
  if (activeTouchRelease === release) {
    activeTouchRelease = null;
  }
}

export default function WorkCard({
  title,
  tags,
  videoSrc,
  posterSrc,
  href,
  headingLevel = "h3",
  parallaxDir = -1,
}: WorkCardProps) {
  const Heading = headingLevel;

  const rootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inViewRef = useRef(false);
  const hoverRef = useRef(false);
  const motionOkRef = useRef(false);
  const touchRef = useRef(false);
  /** Em touch: este card detém o claim único de playback/glow (L2). */
  const claimedRef = useRef(false);

  const [motionOk, setMotionOk] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const setRootRef = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
  }, []);

  /**
   * Parallax da camada de mídia. O rect medido é o do PRÓPRIO elemento
   * inscrito: ele é `position: absolute` com inset fixo, então o transform
   * que escrevemos NÃO realimenta a leitura (rect.top do elemento
   * transformado muda, sim — por isso o progresso é derivado do CENTRO do
   * card, que obtemos do offsetParent, o card, cuja caixa é imóvel).
   */
  const attachMedia = useScrollTimeline<number>({
    read: (el, { vh }) => {
      const card = (el as HTMLElement).offsetParent as HTMLElement | null;
      if (!card) return 0;
      const amp = parallaxAmplitude(window.innerWidth);
      if (amp === 0) return 0;
      const rect = card.getBoundingClientRect();
      // 0 quando o topo do card entra pela base da viewport · 1 quando a
      // base sai pelo topo. O deslocamento vai de −amp a +amp.
      const progress = Math.min(
        1,
        Math.max(0, (vh - rect.top) / (vh + rect.height)),
      );
      return Math.round(parallaxDir * amp * (progress * 2 - 1));
    },
    write: (el, y) => {
      (el as HTMLElement).style.transform = `translate3d(0, ${y}px, 0)`;
    },
    promote: true,
  });

  /** Decide play/pause a partir do estado atual (refs, sem closure velha). */
  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (video === null || !motionOkRef.current) return;
    // Touch: além de in-view, precisa deter o claim único (L2 — um glow
    // por vez). Pointer fino: hover decide (um hover por vez por natureza).
    const wantsPlay =
      inViewRef.current &&
      (touchRef.current ? claimedRef.current : hoverRef.current);
    if (wantsPlay) {
      if (video.src === "") {
        const asset = video.dataset.asset;
        if (asset !== undefined && asset !== "") video.src = asset;
      }
      void video.play().catch(() => {
        /* autoplay bloqueado — permanece no poster */
      });
    } else if (!video.paused) {
      video.pause();
    }
  }, []);

  /* Media queries: reduced-motion (L5) e touch. */
  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const mqTouch = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => {
      motionOkRef.current = mqMotion.matches;
      touchRef.current = mqTouch.matches;
      setMotionOk(mqMotion.matches);
      setIsTouch(mqTouch.matches);
      syncPlayback();
    };
    apply();
    mqMotion.addEventListener("change", apply);
    mqTouch.addEventListener("change", apply);
    return () => {
      mqMotion.removeEventListener("change", apply);
      mqTouch.removeEventListener("change", apply);
    };
  }, [syncPlayback]);

  /** Libera o claim de touch deste card (chamado quando outro card entra). */
  const releaseClaim = useCallback(() => {
    claimedRef.current = false;
    syncPlayback();
  }, [syncPlayback]);

  /* In-view via IntersectionObserver (L10) + claim único em touch (L2). */
  useEffect(() => {
    const root = rootRef.current;
    if (root === null || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inViewRef.current = entry.isIntersecting;
          if (touchRef.current) {
            if (entry.isIntersecting) {
              claimedRef.current = true;
              claimTouchPlayback(releaseClaim);
            } else if (claimedRef.current) {
              claimedRef.current = false;
              releaseTouchPlayback(releaseClaim);
            }
          }
        }
        syncPlayback();
      },
      { threshold: 0.45 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      claimedRef.current = false;
      releaseTouchPlayback(releaseClaim);
    };
  }, [syncPlayback, releaseClaim]);

  /* Pausa quando o vídeo desmonta (troca p/ reduced-motion) ou no unmount. */
  useEffect(() => {
    if (motionOk) syncPlayback();
    // Captura o nó no setup: no cleanup o ref já pode apontar para outro
    // render (ou null) — queremos pausar exatamente o vídeo deste ciclo.
    const video = videoRef.current;
    return () => {
      if (video !== null && !video.paused) video.pause();
    };
  }, [motionOk, syncPlayback]);

  const handleEnter = useCallback(() => {
    hoverRef.current = true;
    syncPlayback();
  }, [syncPlayback]);

  const handleLeave = useCallback(() => {
    hoverRef.current = false;
    syncPlayback();
  }, [syncPlayback]);

  const dataActive = isTouch && isPlaying ? "true" : undefined;

  const content = (
    <>
      <div ref={attachMedia} className={styles.media}>
        <Image
          src={resolveAsset(posterSrc).src}
          alt=""
          fill
          sizes={POSTER_SIZES}
          className={styles.poster}
        />
        {motionOk ? (
          <video
            ref={videoRef}
            className={
              isPlaying ? `${styles.video} ${styles.videoPlaying}` : styles.video
            }
            /* SEM atributo `poster`: o <Image> logo acima já renderiza o poster,
            otimizado por next/image (AVIF + srcSet). O `poster=` do <video>
            baixa o arquivo CRU no path literal, sem otimização nenhuma, e em
            duplicata — a auditoria da W10 mediu 531 KiB só nos 6 do portfólio.
            Um <video> sem dados é transparente, então o <Image> aparece por
            baixo até o primeiro frame chegar. */
            data-asset={videoSrc}
            preload="none"
            muted
            playsInline
            loop
            aria-hidden="true"
            onPlaying={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : null}
      </div>

      {/* Glow blaze (L9: único brilho de cor do sistema). Sobe da base no
          hover; o blur(90px) é estático — só transform/opacity animam. */}
      <span className={styles.glow} aria-hidden="true" />

      <div className={styles.pill}>
        <div className={styles.info}>
          {tags.length > 0 ? (
            <ul className={styles.tags}>
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          <Heading className={styles.title}>{title}</Heading>
        </div>
        {/* Botão de link do modelo: gira 1 volta no hover do card. Puramente
            gráfico (aria-hidden) — quem carrega a semântica é o <Link> do
            card quando há href. Sem texto: a copy do CTA vive no JSON e não
            se repete por card. */}
        <span className={styles.linkBtn} aria-hidden="true">
          →
        </span>
      </div>
    </>
  );

  if (href !== undefined) {
    return (
      <Link
        href={href}
        ref={setRootRef}
        className={styles.card}
        data-active={dataActive}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      ref={setRootRef}
      className={styles.card}
      data-active={dataActive}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {content}
    </article>
  );
}
