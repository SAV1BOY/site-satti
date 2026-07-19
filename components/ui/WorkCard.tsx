"use client";

/**
 * WorkCard — S7 Portfólio
 * Fonte visual: S7 Portfolio Desktop 1920.dc.html / Mobile 375.dc.html
 *
 * Comportamento do vídeo (L5/L10):
 * - SSR/estático: só o poster via next/image (sizes reais, L4).
 * - Motion ok (no-preference): monta <video> preload="none" com
 *   data-asset={videoSrc}; o src só é atribuído no primeiro intent de play.
 * - Pointer fino: play() em mouseenter/focus quando in-view; pause() ao sair.
 * - Touch: play() quando in-view (IntersectionObserver), pause() fora.
 * - Reduced-motion: vídeo nunca monta nem toca — só o poster.
 * - Scroll via IntersectionObserver + requestAnimationFrame (L10).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./WorkCard.module.css";

type HeadingLevel = "h2" | "h3" | "h4";

export interface WorkCardProps {
  title: string;
  tags: string[];
  videoSrc: string;
  posterSrc: string;
  href?: string;
  headingLevel?: HeadingLevel;
}

/** Grid S7: 1 coluna mobile · 2 colunas no container 1440 (gutter 4vw, gap 24). */
const POSTER_SIZES =
  "(max-width: 767px) calc(100vw - 40px), (max-width: 1500px) 46vw, 645px";

export default function WorkCard({
  title,
  tags,
  videoSrc,
  posterSrc,
  href,
  headingLevel = "h3",
}: WorkCardProps) {
  const Heading = headingLevel;

  const rootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef(0);
  const inViewRef = useRef(false);
  const hoverRef = useRef(false);
  const motionOkRef = useRef(false);
  const touchRef = useRef(false);

  const [motionOk, setMotionOk] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const setRootRef = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
  }, []);

  /** Decide play/pause a partir do estado atual (refs, sem closure velha). */
  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (video === null || !motionOkRef.current) return;
    const wantsPlay =
      inViewRef.current && (touchRef.current || hoverRef.current);
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

  /** L10: mudanças disparadas por scroll/IO passam por requestAnimationFrame. */
  const scheduleSync = useCallback(() => {
    if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      syncPlayback();
    });
  }, [syncPlayback]);

  /* Media queries: reduced-motion (L5) e touch. */
  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const mqTouch = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => {
      motionOkRef.current = mqMotion.matches;
      touchRef.current = mqTouch.matches;
      setMotionOk(mqMotion.matches);
      setIsTouch(mqTouch.matches);
      scheduleSync();
    };
    apply();
    mqMotion.addEventListener("change", apply);
    mqTouch.addEventListener("change", apply);
    return () => {
      mqMotion.removeEventListener("change", apply);
      mqTouch.removeEventListener("change", apply);
    };
  }, [scheduleSync]);

  /* In-view via IntersectionObserver (L10). */
  useEffect(() => {
    const root = rootRef.current;
    if (root === null || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inViewRef.current = entry.isIntersecting;
        scheduleSync();
      },
      { threshold: 0.45 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [scheduleSync]);

  /* Pausa e cancela rAF quando o vídeo desmonta (troca p/ reduced-motion) ou no unmount. */
  useEffect(() => {
    if (motionOk) scheduleSync();
    // Captura o nó no setup: no cleanup o ref já pode apontar para outro
    // render (ou null) — queremos pausar exatamente o vídeo deste ciclo.
    const video = videoRef.current;
    return () => {
      if (video !== null && !video.paused) video.pause();
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [motionOk, scheduleSync]);

  const handleEnter = useCallback(() => {
    hoverRef.current = true;
    scheduleSync();
  }, [scheduleSync]);

  const handleLeave = useCallback(() => {
    hoverRef.current = false;
    scheduleSync();
  }, [scheduleSync]);

  const dataActive = isTouch && isPlaying ? "true" : undefined;

  const content = (
    <>
      <div className={styles.media}>
        <Image
          src={posterSrc}
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
            poster={posterSrc}
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
      <div className={styles.meta}>
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
        {href !== undefined ? (
          <span className={styles.pill} aria-hidden="true">
            Ver case
            <span className={styles.pillArrow}>→</span>
          </span>
        ) : null}
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
