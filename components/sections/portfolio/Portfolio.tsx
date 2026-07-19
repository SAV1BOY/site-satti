/**
 * Portfolio (S7) — "03 — Portfólio" · grid de 6 work-cards (D4).
 * Fonte visual: S7 Portfolio Desktop 1920.dc.html / Mobile 375.dc.html
 *
 * Server Component (L11): copy 100% via next-intl (L1); todo o motion
 * mora nos client children já prontos (WorkCard: scale + glow blaze
 * blur(90px) op .8 + vídeo só no hover · AutomationLine: desenho no
 * scroll + pulso único do fio). Blaze-law (L2): nesta dobra o blaze é
 * o glow do card em hover — ou o pulso da Linha quando estiver aqui.
 *
 * Mídia (MANIFEST/§8): cards 1–3 com vídeo real deferido (markup final,
 * preload="none" + data-asset via WorkCard) · cards 4–6 só screenshot.
 */

import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import WorkCard from "@/components/ui/WorkCard";
import styles from "./Portfolio.module.css";

/** Campo de copy L1: string oficial OU { value, confirm } ([CONFIRMAR] → steel). */
type CopyField =
  string | { value: string; confirm?: boolean; draft?: string | null };

interface PortfolioItemJson {
  title: CopyField;
  tag: CopyField;
}

function readField(field: CopyField): { text: string; confirm: boolean } {
  if (typeof field === "string") return { text: field, confirm: false };
  return { text: field.value, confirm: field.confirm === true };
}

/**
 * Mídia por card, na ordem dos itens do JSON (paths do MANIFEST):
 * 1–3 → vídeo P1–P3 (toca só no hover/in-view; o WorkCard resolve) +
 * poster · 4–6 → videoSrc "" (WorkCard mostra só o screenshot).
 */
const CARD_MEDIA: ReadonlyArray<{ videoSrc: string; posterSrc: string }> = [
  {
    videoSrc: "/media/portfolio-1.mp4",
    posterSrc: "/media/portfolio-1-poster.webp",
  },
  {
    videoSrc: "/media/portfolio-2.mp4",
    posterSrc: "/media/portfolio-2-poster.webp",
  },
  {
    videoSrc: "/media/portfolio-3.mp4",
    posterSrc: "/media/portfolio-3-poster.webp",
  },
  { videoSrc: "", posterSrc: "/img/portfolio/shot-4.webp" },
  { videoSrc: "", posterSrc: "/img/portfolio/shot-5.webp" },
  { videoSrc: "", posterSrc: "/img/portfolio/shot-6.webp" },
];

export default async function Portfolio() {
  const t = await getTranslations("portfolio");
  const items = t.raw("items") as PortfolioItemJson[];

  return (
    <section id="portfolio" className={styles.section}>
      {/* D3: zona "portfolio" do fio — primeiro filho da section relative.
          Sem nodeLabels: a comp S7 não traz strings de node. */}
      <AutomationLine zone="portfolio" tone="light" />

      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.sectionEyebrow}`}>
          {t("sectionLabel")}
        </p>
        <h2 className={styles.title}>{t("title")}</h2>

        <ul className={styles.grid}>
          {items.slice(0, CARD_MEDIA.length).map((item, index) => {
            const media = CARD_MEDIA[index]; // index < length (slice acima)
            const title = readField(item.title);
            const tag = readField(item.tag);
            return (
              <li
                key={title.text}
                className={styles.gridItem}
                data-confirm={title.confirm ? "true" : undefined}
              >
                <WorkCard
                  title={title.text}
                  tags={[tag.text]}
                  videoSrc={media.videoSrc}
                  posterSrc={media.posterSrc}
                />
              </li>
            );
          })}
        </ul>

        <a className={styles.allCta} href="#cases">
          {t("allCta")}
          <span className={styles.allCtaArrow} aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}
