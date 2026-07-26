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
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
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
 * Mídia por card, na ordem dos itens do JSON (paths do MANIFEST v2):
 * 1–3 → vídeo P1–P3 + poster · 4–6 → videoSrc "" (só o screenshot).
 *
 * v2: os posters dos 3 primeiros cards eram `/media/portfolio-{n}-poster.webp`,
 * um SEGUNDO arquivo para o mesmo slot visual que `shot-{n}` já ocupa — o
 * CasesSlider consome exatamente `shot-{1..3}` para os mesmos 3 cases. Slots
 * unificados em `shot-{1..6}`: 3 assets e 3 linhas de budget a menos, e o
 * poster passa a ser sempre o frame 0 do próprio .mp4 (zero "pop" no play).
 */
const CARD_MEDIA: ReadonlyArray<{ videoSrc: string; posterSrc: string }> = [
  { videoSrc: "/media/portfolio-1.mp4", posterSrc: "/img/portfolio/shot-1.webp" },
  { videoSrc: "/media/portfolio-2.mp4", posterSrc: "/img/portfolio/shot-2.webp" },
  { videoSrc: "/media/portfolio-3.mp4", posterSrc: "/img/portfolio/shot-3.webp" },
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
          {items.slice(0, CARD_MEDIA.length).flatMap((item, index) => {
            const media = CARD_MEDIA[index]; // index < length (slice acima)
            const title = readField(item.title);
            const tag = readField(item.tag);
            // W6 modo final: card sem projeto confirmado (6º) é omitido.
            if (OMIT_UNCONFIRMED && (title.confirm || tag.confirm)) {
              return [];
            }
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
