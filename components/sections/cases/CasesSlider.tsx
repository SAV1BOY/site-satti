/**
 * CasesSlider (S9) — "04 — Cases em detalhe" · 3 cases curados com
 * métrica antes→depois num Swiper de 1 coluna (D4: S9 ≠ S7).
 * Fonte visual: S9 CasesSlider Desktop 1920.dc.html / Mobile 375.dc.html
 *
 * Server Component (L11): copy 100% via next-intl (L1); o Swiper, os
 * controles prev/next e os dots moram na client island CasesClient
 * (estado do slider). O <h2> nasce aqui no server e entra na island
 * como prop `heading` para compor a linha título + setas da comp
 * desktop — a island fica mínima (só o que precisa de estado).
 *
 * L8: métricas antes→depois vêm de cases.beforeValue/afterValue como
 * { value: "[CONFIRMAR]", confirm: true } → renderizadas em steel com
 * data-confirm="true" até o Miguel cravar números reais (W6).
 * L2: blaze da dobra = dot ativo da paginação (decisão F0–F5).
 *
 * Mídia: imagens ESTÁTICAS com src direto no path final do MANIFEST
 * (/img/portfolio/shot-{1..3}.webp — os 3 cases curados são os mesmos
 * 3 primeiros cases oficiais do portfólio) via next/image com sizes
 * reais. Sem slot de vídeo nesta seção → sem data-asset (§8: data-asset
 * é exclusivo de vídeo).
 *
 * D3: a Linha de Automação não passa por aqui (zonas: hero → serviços
 * → automação → portfólio → contato) — nenhum AutomationLine.
 */

import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import CasesClient, { type CaseSlideData } from "./CasesClient";
import styles from "./CasesSlider.module.css";
import { resolveAsset } from "@/lib/third-party";

/** Campo de copy L1: string oficial OU { value, confirm } ([CONFIRMAR] → steel). */
type CopyField =
  string | { value: string; confirm?: boolean; draft?: string | null };

interface CaseItemJson {
  title: CopyField;
  tag: CopyField;
}

function readField(field: CopyField): { text: string; confirm: boolean } {
  if (typeof field === "string") return { text: field, confirm: false };
  return { text: field.value, confirm: field.confirm === true };
}

/**
 * Screenshots REAIS (MANIFEST v2, nunca gerados — L6), na ordem dos 3
 * primeiros cases.items do JSON (curadoria D4: slice 3).
 *
 * v2: passou de `/img/portfolio/shot-{1..3}` para `/img/cases/thumb-{1..3}`.
 * O MANIFEST v2 declara os thumbs de case como slot próprio a 744×480 (razão
 * 1,55, o render de 372×240 do modelo); o `shot-*` é 1400×1440, quase quadrado
 * — reusá-lo aqui perdia ~44 % da altura no crop da mídia do slider.
 */
const CASE_IMAGES: readonly string[] = [
  "/img/cases/thumb-1.webp",
  "/img/cases/thumb-2.webp",
  "/img/cases/thumb-3.webp",
];

export default async function CasesSlider() {
  const t = await getTranslations("cases");

  const items = (t.raw("items") as CaseItemJson[]).slice(
    0,
    CASE_IMAGES.length,
  );
  const beforeValue = readField(t.raw("beforeValue") as CopyField);
  const afterValue = readField(t.raw("afterValue") as CopyField);
  // W6 modo final: métrica só com número cravado (L8).
  const omitMetrics =
    OMIT_UNCONFIRMED && (beforeValue.confirm || afterValue.confirm);

  const slides: CaseSlideData[] = items.map((item, index) => {
    const title = readField(item.title);
    const tag = readField(item.tag);
    return {
      title: title.text,
      titleConfirm: title.confirm,
      tag: tag.text,
      // resolveAsset (V2-D2): em draft renderiza o thumb marcado; em final cai
      // no blueprint, porque o thumb é asset do modelo estrutural.
      imageSrc: resolveAsset(CASE_IMAGES[index] ?? "").src, // index < length
    };
  });

  return (
    <section
      id="cases"
      className={styles.section}
      data-section="cases"
      data-tone="dark"
    >
      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.sectionEyebrow}`}>
          {t("sectionLabel")}
        </p>

        <CasesClient
          heading={<h2 className={styles.title}>{t("title")}</h2>}
          slides={slides}
          beforeLabel={t("beforeLabel")}
          afterLabel={t("afterLabel")}
          // W6 modo final: métrica sem número confirmado é omitida (L8).
          beforeValue={omitMetrics ? undefined : beforeValue}
          afterValue={omitMetrics ? undefined : afterValue}
          prevLabel={t("previousAriaLabel")}
          nextLabel={t("nextAriaLabel")}
        />
      </div>
    </section>
  );
}
