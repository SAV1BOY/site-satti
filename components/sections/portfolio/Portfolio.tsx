/**
 * Portfolio (S7) — "03 — Portfólio" · 6 work-cards em 2 colunas com stagger.
 * Geometria: design/awsmd-ref/awsmd-geometry.json → portfolio (DEC-016).
 * Copy e paleta: comps S7 Portfolio Desktop 1920 / Mobile 375.
 *
 * Server Component (L11): copy 100% via next-intl (L1); todo o motion mora
 * nos client children (WorkCard: parallax da mídia + scale + glow blaze ·
 * AutomationLine: desenho no scroll + pulso único do fio).
 *
 * Mídia (MANIFEST/§8): cards 1–3 com vídeo real deferido (markup final,
 * preload="none" + data-asset via WorkCard) · cards 4–6 só screenshot.
 *
 * Fill-text do cabeçalho (medido: headFillText, margin-top 83, 400
 * 25px/1.335, max 14.241em): renderizado SÓ quando
 * `portfolio.supportingText` tem string. Hoje o EN tem copy oficial e o
 * PT-BR está `null` — e `null` neste JSON significa "slot omitido"
 * (footer.eyebrow, footer.preferEmail seguem a mesma convenção), não
 * "inventar um placeholder". Quando o Miguel escrever a versão PT o slot
 * aparece sem mudança de código. L1: nada é inventado aqui.
 */

import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import FillText from "@/components/ui/FillText";
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
/* @resolved-by WorkCard — este arquivo só DECLARA a tabela de paths; a decisão
   draft/final de cada asset é tomada pelo resolveAsset() dentro do WorkCard.
   Resolver aqui também resolveria duas vezes. */
const CARD_MEDIA: ReadonlyArray<{ videoSrc: string; posterSrc: string }> = [
  { videoSrc: "/media/portfolio-1.mp4", posterSrc: "/img/portfolio/shot-1.webp" },
  { videoSrc: "/media/portfolio-2.mp4", posterSrc: "/img/portfolio/shot-2.webp" },
  { videoSrc: "/media/portfolio-3.mp4", posterSrc: "/img/portfolio/shot-3.webp" },
  { videoSrc: "", posterSrc: "/img/portfolio/shot-4.webp" },
  { videoSrc: "", posterSrc: "/img/portfolio/shot-5.webp" },
  { videoSrc: "", posterSrc: "/img/portfolio/shot-6.webp" },
];

/**
 * Sentido do parallax da mídia por posição no grid de 2 colunas
 * row-major: `(coluna + linha) % 2`. Cards vizinhos — na horizontal e na
 * vertical — derivam em sentidos opostos, que é o que faz o efeito ser
 * legível em vez de parecer um scroll mais lento.
 */
function parallaxDir(index: number): 1 | -1 {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return (col + row) % 2 === 0 ? -1 : 1;
}

export default async function Portfolio() {
  const t = await getTranslations("portfolio");
  const items = t.raw("items") as PortfolioItemJson[];
  /* W13 (auditoria): o guard tinha de ser `t.has`, não `t.raw`. O resolvePath do
     use-intl LANÇA para valor `null` e `t.raw` devolve o getMessageFallback —
     isto é, a STRING "portfolio.supportingText" — então `typeof === "string"`
     dava true e a chave crua era pintada na página em PT-BR (mais um
     MISSING_MESSAGE no log do build). `t.has` devolve false no mesmo caso. */
  const supporting = t.has("supportingText") ? t.raw("supportingText") : null;
  const supportingText =
    typeof supporting === "string" && supporting.trim() !== ""
      ? supporting
      : null;

  return (
    <section
      id="portfolio"
      className={styles.section}
      data-section="portfolio"
      data-tone="light"
    >
      {/* D3: zona "portfolio" do fio — primeiro filho da section relative.
          Sem nodeLabels: a comp S7 não traz strings de node. */}
      <AutomationLine zone="portfolio" tone="light" />

      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.sectionEyebrow}`}>
          {t("sectionLabel")}
        </p>

        <div className={styles.head}>
          <h2 className={styles.title}>{t("title")}</h2>
          {supportingText !== null ? (
            <FillText className={styles.headFill}>{supportingText}</FillText>
          ) : null}
        </div>

        <div className={styles.list}>
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
                    parallaxDir={parallaxDir(index)}
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
      </div>
    </section>
  );
}
