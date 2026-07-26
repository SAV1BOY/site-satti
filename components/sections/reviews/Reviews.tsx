import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import ReviewsClient from "./ReviewsClientLazy";
import { type ReviewItem } from "./ReviewsClient";
import styles from "./Reviews.module.css";

/**
 * Reviews (S10 · Depoimentos) — carrossel de 4 slides sobre paper.
 * Geometria: awsmd-geometry.json → reviews (4 slides, Swiper, fade).
 * Copy e paleta: comps "S10 Depoimentos Desktop 1920" + Mobile 375.
 *
 * V2 (W12-E): era uma grade estática de 3 cards; o modelo é um carrossel
 * de 4 slides com um depoimento por vez. `reviews.items[]` (4 entradas,
 * todas [CONFIRMAR]) foi criado na W9 exatamente para isto — as chaves
 * singulares reviews.quote/name/role continuam no JSON como legado e não
 * são mais lidas aqui.
 *
 * L1: NUNCA inventar nome/cargo/foto/citação. Em draft os 4 slides
 * renderizam os placeholders do JSON em steel com data-confirm e o avatar
 * blueprint da SATTI (DEC-017: os avatares do modelo são pessoas reais e
 * não entram nem em preview). Em final (DEC-012) a seção inteira não
 * renderiza enquanto não houver depoimento autorizado.
 *
 * Selos de plataforma de review do modelo: `excludedEvenInPreview` —
 * nenhum é renderizado, em nenhum modo.
 *
 * Server Component: só o carrossel (estado do slider) é client island.
 */

type CopyField = { value: string; confirm?: boolean };

interface ReviewItemJson {
  quote: CopyField;
  name: CopyField;
  role: CopyField;
}

/** Avatar blueprint por slide (MANIFEST v2 · RV1–RV4, 78×78 render). */
function avatarSrc(index: number): string {
  return `/img/reviews/avatar-${index + 1}.webp`;
}

export default async function Reviews() {
  const t = await getTranslations("reviews");
  const raw = t.raw("items") as ReviewItemJson[];

  const items: ReviewItem[] = raw.map((item, i) => ({
    quote: item.quote.value,
    quoteConfirm: item.quote.confirm === true,
    name: item.name.value,
    nameConfirm: item.name.confirm === true,
    role: item.role.value,
    roleConfirm: item.role.confirm === true,
    avatarSrc: avatarSrc(i),
  }));

  // W6 modo final: só depoimento REAL entra; sem nenhum, a seção inteira
  // desaparece (DEC-012). Em draft os 4 placeholders ficam.
  const visible = OMIT_UNCONFIRMED
    ? items.filter((i) => !i.quoteConfirm && !i.nameConfirm && !i.roleConfirm)
    : items;

  if (visible.length === 0) return null;

  const hasPlaceholder = visible.some((i) => i.quoteConfirm);

  return (
    <section
      id="depoimentos"
      className={styles.root}
      data-section="reviews"
      data-tone="light"
    >
      <p className={`eyebrow ${styles.eyebrow}`}>{t("sectionLabel")}</p>

      <div className={styles.head}>
        <h2 className={styles.title}>{t("title")}</h2>
        {/* Aviso de rascunho: só existe enquanto houver placeholder. */}
        {hasPlaceholder ? (
          <p className={styles.notice}>{t("notice")}</p>
        ) : null}
      </div>

      <ReviewsClient items={visible} quoteMark={t("quoteMark")} />
    </section>
  );
}
