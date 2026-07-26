"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import { A11y, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMotionOk } from "@/hooks/useMotionOk";
import "swiper/css";
import "swiper/css/effect-fade";
import styles from "./Reviews.module.css";

/**
 * ReviewsClient — carrossel de depoimentos (S10).
 * Geometria: awsmd-geometry.json → reviews.* (4 slides, blockquote
 * 3.9375em, conteúdo pl 3.375em, citação 600 2.2em/1.2 max 30em pb 1.55em,
 * linha bt 1 pt 2.5em mt auto, avatar 78 circular, cliente pl 24).
 *
 * Fade entre slides: `opacity .5s ease-in-out` (medido) → effect fade com
 * crossFade. L5: com reduced-motion `speed: 0` (troca instantânea) e os
 * dots continuam funcionais — o carrossel não deixa de funcionar, só de
 * animar. É por isso que o gate de motion aqui é a prop `speed` e não a
 * ausência do componente.
 *
 * Dots: <button> próprios em vez dos bullets clicáveis do Swiper. Razão de
 * copy (L1): um bullet clicável do Swiper recebe o aria-label default da
 * lib ("Go to slide N", em inglês) e o JSON não tem chave de rótulo por
 * dot. O rótulo aqui é "n / total", que é NUMÉRICO — não é copy editorial
 * inventada, é a mesma convenção do slideLabelMessage do próprio Swiper.
 *
 * Avatares: blueprint gerado pela SATTI (DEC-017 — os avatares do modelo
 * são pessoas reais e não entram nem em preview). Por isso NÃO passam por
 * resolveAsset(): não são asset de terceiro nem estão na declaração.
 */

export interface ReviewItem {
  quote: string;
  quoteConfirm: boolean;
  name: string;
  nameConfirm: boolean;
  role: string;
  roleConfirm: boolean;
  avatarSrc: string;
}

interface ReviewsClientProps {
  items: ReviewItem[];
  /** Aspas decorativas (reviews.quoteMark do JSON — L1). */
  quoteMark: string;
}

export default function ReviewsClient({ items, quoteMark }: ReviewsClientProps) {
  const motionOk = useMotionOk();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [active, setActive] = useState(0);

  const onSlideChange = useCallback((sw: SwiperType) => {
    setActive(sw.activeIndex);
  }, []);

  return (
    <div className={styles.slider}>
      <Swiper
        modules={[EffectFade, Keyboard, A11y]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        speed={motionOk ? 500 : 0}
        allowTouchMove={items.length > 1}
        keyboard={{ enabled: true, onlyInViewport: true }}
        onSwiper={setSwiper}
        onSlideChange={onSlideChange}
        data-lenis-prevent
        data-cursor="drag"
      >
        {items.map((item, i) => (
          <SwiperSlide key={i} className={styles.slide}>
            <figure className={styles.figure}>
              <span className={styles.mark} aria-hidden="true">
                {quoteMark}
              </span>

              <div className={styles.content}>
                <blockquote
                  className={styles.quote}
                  data-confirm={item.quoteConfirm ? "true" : undefined}
                >
                  {item.quote}
                </blockquote>

                <figcaption className={styles.row}>
                  <Image
                    className={styles.avatar}
                    src={item.avatarSrc}
                    alt=""
                    width={78}
                    height={78}
                  />
                  <span className={styles.client}>
                    <span
                      className={styles.name}
                      data-confirm={item.nameConfirm ? "true" : undefined}
                    >
                      {item.name}
                    </span>
                    <span
                      className={styles.role}
                      data-confirm={item.roleConfirm ? "true" : undefined}
                    >
                      {item.role}
                    </span>
                  </span>
                </figcaption>
              </div>
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>

      {items.length > 1 ? (
        <div className={styles.dots}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              aria-label={`${i + 1} / ${items.length}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => swiper?.slideTo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
