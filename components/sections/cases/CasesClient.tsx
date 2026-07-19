"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMotionOk } from "@/hooks/useMotionOk";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./CasesSlider.module.css";

/**
 * CasesClient — client island do S9: Swiper 1 coluna (D4/Atlas) com
 * prev/next custom (aria-labels do JSON), dots de paginação e cards
 * com métrica antes→depois.
 *
 * ERRO DO 1º PASSE corrigido: tema do Swiper 100% via tokens — o CSS
 * default da lib pinta dots/controles de #007aff; aqui o escopo
 * .slider sobrescreve --swiper-theme-color/--swiper-pagination-* para
 * steel (inativo) e blaze (ativo) — ver CasesSlider.module.css.
 *
 * - Navegação: botões próprios (circuit, como na comp — controle
 *   funcional) chamando slidePrev/slideNext; disabled nas pontas
 *   (sem loop: "setas avançam 1", comp).
 * - Paginação: bullets do módulo Pagination renderizados num el
 *   externo próprio (data-cases-dots, aria-hidden — a posição do
 *   slide já é anunciada pelo módulo A11y como "n / total"). Não
 *   clicáveis: não há chave de aria-label por dot no JSON e copy
 *   nunca é inventada (L1).
 * - L5/§7.9: speed 550 (comp: track 0.55s) só com motion ok;
 *   reduced-motion → speed 0 (troca instantânea, estado da comp).
 *   data-lenis-prevent no container do slider (scroll interno).
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
  /** <h2> renderizado no server (copy L1) — compõe a linha título+setas. */
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
}

/** El externo dos dots — seletor estável, presente no DOM no init. */
const DOTS_SELECTOR = "#cases [data-cases-dots]";

export default function CasesClient({
  heading,
  slides,
  beforeLabel,
  afterLabel,
  beforeValue,
  afterValue,
  prevLabel,
  nextLabel,
}: CasesClientProps) {
  const motionOk = useMotionOk();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback((sw: SwiperType) => {
    setAtStart(sw.isBeginning);
    setAtEnd(sw.isEnd);
  }, []);

  return (
    <div className={styles.slider}>
      <div className={styles.headRow}>
        {heading}
        {/* Setas circuit (funcional, comp) — só desktop; mobile = swipe + dots */}
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
        data-lenis-prevent
      >
        {slides.map((slide) => (
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
                    <div className={styles.metricArrow} aria-hidden="true">
                      →
                    </div>
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

      {/* Dots (bullets do Pagination) — decorativos: posição anunciada
          pelo A11y ("n / total"); tema via tokens no module.css */}
      <div className={styles.dots} data-cases-dots aria-hidden="true" />
    </div>
  );
}
