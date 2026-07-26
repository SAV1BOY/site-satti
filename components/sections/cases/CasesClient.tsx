"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMotionOk } from "@/hooks/useMotionOk";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./CasesSlider.module.css";

/**
 * CasesClient — client island do S9: campo de busca + Swiper de 1 coluna
 * com prev/next custom (aria-labels do JSON), dots de paginação e cards
 * com métrica antes→depois.
 *
 * BUSCA (W12-E): no modelo o campo NÃO filtra nada — foi testado no atlas.
 * Aqui ele filtra de verdade, client-side, sobre os cases já carregados:
 * é barato (3 itens em memória, zero request) e honesto (um campo que não
 * busca é pior do que campo nenhum). Toda a copy vem do JSON (L1):
 * cases.searchPlaceholder / searchAriaLabel / searchSubmitAriaLabel /
 * emptyResult / viewAll.
 *
 * Tema do Swiper 100% via tokens — o CSS default da lib pinta
 * dots/controles de #007aff; o escopo .slider sobrescreve
 * --swiper-theme-color/--swiper-pagination-* para o par claro/blaze do
 * tom escuro (ver CasesSlider.module.css).
 *
 * - Navegação: botões próprios chamando slidePrev/slideNext; disabled nas
 *   pontas (sem loop: "setas avançam 1", comp).
 * - Paginação: bullets do módulo Pagination num el externo
 *   (data-cases-dots, aria-hidden — a posição do slide já é anunciada
 *   pelo módulo A11y como "n / total"). Não clicáveis: não há chave de
 *   aria-label por dot no JSON e copy nunca é inventada (L1).
 * - L5/§7.9: speed 550 só com motion ok; reduced-motion → speed 0 (troca
 *   instantânea). data-lenis-prevent no container (scroll interno).
 * - Sem autoplay (módulo nem importado).
 */

export interface CaseSlideData {
  title: string;
  titleConfirm: boolean;
  tag: string;
  imageSrc: string;
}

export interface MetricValue {
  text: string;
  confirm: boolean;
}

interface CasesClientProps {
  /** <h2> renderizado no server (copy L1) — compõe a linha título+busca. */
  heading: ReactNode;
  slides: CaseSlideData[];
  beforeLabel: string;
  afterLabel: string;
  /** Ausentes no modo final quando [CONFIRMAR] (W6): a linha de
      métrica é omitida com elegância (L8). */
  beforeValue?: MetricValue;
  afterValue?: MetricValue;
  prevLabel: string;
  nextLabel: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  searchSubmitAriaLabel: string;
  emptyResult: string;
  viewAllLabel: string;
}

/** El externo dos dots — seletor estável, presente no DOM no init. */
const DOTS_SELECTOR = "#cases [data-cases-dots]";

/** Normaliza para busca insensível a caixa e a acento. */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default function CasesClient({
  heading,
  slides,
  beforeLabel,
  afterLabel,
  beforeValue,
  afterValue,
  prevLabel,
  nextLabel,
  searchPlaceholder,
  searchAriaLabel,
  searchSubmitAriaLabel,
  emptyResult,
  viewAllLabel,
}: CasesClientProps) {
  const motionOk = useMotionOk();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [query, setQuery] = useState("");

  const syncEdges = useCallback((sw: SwiperType) => {
    setAtStart(sw.isBeginning);
    setAtEnd(sw.isEnd);
  }, []);

  const visible = useMemo(() => {
    const q = fold(query.trim());
    if (q === "") return slides;
    return slides.filter((s) => fold(`${s.title} ${s.tag}`).includes(q));
  }, [slides, query]);

  /* O Swiper não observa a lista de filhos: sem update() ele mantém o
     índice e a largura do conjunto anterior e passa a arrastar no vazio.
     O estado das setas NÃO é sincronizado aqui: quem faz isso é o handler
     onUpdate do próprio Swiper — setState dentro de effect encadeia
     renders (react-hooks/set-state-in-effect), e o evento da lib é a
     borda correta para reagir a uma mudança do sistema externo. */
  useEffect(() => {
    if (!swiper || swiper.destroyed) return;
    swiper.update();
    swiper.slideTo(0, 0);
  }, [swiper, visible.length]);

  return (
    <div className={styles.slider}>
      <div className={styles.headRow}>
        <div className={styles.headText}>{heading}</div>

        <div className={styles.tools}>
          {/* Busca real (client-side) sobre os cases já carregados. */}
          <form
            className={styles.search}
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
            />
            <button
              type="submit"
              className={styles.searchSubmit}
              aria-label={searchSubmitAriaLabel}
            >
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <a className={styles.viewAll} href="#portfolio">
            {viewAllLabel}
          </a>

          {/* Setas — só desktop; mobile = swipe + dots */}
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label={prevLabel}
              disabled={atStart}
              onClick={() => swiper?.slidePrev()}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className={styles.navBtn}
              aria-label={nextLabel}
              disabled={atEnd}
              onClick={() => swiper?.slideNext()}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty} role="status">
          {emptyResult}
        </p>
      ) : (
        <Swiper
          modules={[Pagination, Keyboard, A11y]}
          slidesPerView="auto"
          spaceBetween={14}
          breakpoints={{ 768: { spaceBetween: 32 } }}
          speed={motionOk ? 550 : 0}
          pagination={{ el: DOTS_SELECTOR, clickable: false }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          onSwiper={(sw) => {
            setSwiper(sw);
            syncEdges(sw);
          }}
          onSlideChange={syncEdges}
          onUpdate={syncEdges}
          data-lenis-prevent
          data-cursor="drag"
        >
          {visible.map((slide) => (
            <SwiperSlide key={slide.title} className={styles.slide}>
              <article className={styles.card}>
                <div className={styles.media}>
                  <Image
                    src={slide.imageSrc}
                    alt={slide.title}
                    fill
                    sizes="(min-width: 1024px) 720px, (min-width: 768px) 55vw, 80vw"
                    className={styles.mediaImg}
                  />
                </div>

                <div className={styles.content}>
                  <div className={styles.body}>
                    <span className={styles.tag}>{slide.tag}</span>
                    <h3
                      className={styles.cardTitle}
                      data-confirm={slide.titleConfirm ? "true" : undefined}
                    >
                      {slide.title}
                    </h3>
                  </div>

                  {/* Métrica antes→depois — L8: [CONFIRMAR] steel até nº
                      real; modo final sem número confirmado = sem linha. */}
                  {beforeValue !== undefined && afterValue !== undefined ? (
                    <dl className={styles.metrics}>
                      <div className={styles.metric}>
                        <dt className={styles.metricLabel}>{beforeLabel}</dt>
                        <dd
                          className={`${styles.metricValue} ${styles.metricBefore}`}
                          data-confirm={beforeValue.confirm ? "true" : undefined}
                        >
                          {beforeValue.text}
                        </dd>
                      </div>
                      {/* seta decorativa = ::before do 2º grupo (DOM de
                          <dl> válido — audit LH) */}
                      <div className={styles.metric}>
                        <dt className={styles.metricLabel}>{afterLabel}</dt>
                        <dd
                          className={styles.metricValue}
                          data-confirm={afterValue.confirm ? "true" : undefined}
                        >
                          {afterValue.text}
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Dots (bullets do Pagination) — decorativos: posição anunciada
          pelo A11y ("n / total"); tema via tokens no module.css */}
      <div className={styles.dots} data-cases-dots aria-hidden="true" />
    </div>
  );
}
