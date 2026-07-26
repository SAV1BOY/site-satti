import { getTranslations } from "next-intl/server";

import AutomationLine from "@/components/ui/AutomationLine";
import Button from "@/components/ui/Button";
import PhoneVideo from "./PhoneVideo";
import styles from "./Automation.module.css";

/**
 * S6 — Automação (seção DARK, zona "automation" do fio D3).
 * Fonte visual: S6 Automacao Desktop 1920.dc.html · Mobile 375.dc.html
 *
 * Server Component (L11). Único client child: PhoneVideo (slot A6,
 * §8 autoplay motion-ok). AutomationLine/Button já são self-contained.
 *
 * D2: título "{AUTOMAÇÃO} INTELIGENTE **" — chaves e ** em steel nos
 * dois breakpoints; o blaze do viewport é o CTA "Ver portfólio".
 * D3: <AutomationLine zone="automation" tone="dark" /> é o PRIMEIRO
 * filho da section (position: relative); conteúdo em wrapper z-index 1.
 * A régua horizontal do rodapé da comp era a aproximação estática do
 * fio — substituída pelo fio contínuo (não portada). Os labels de
 * passo (automation.steps) viram labels dos nodes do segmento.
 * L1: toda copy via next-intl (t.raw no título por causa das chaves
 * {} — sintaxe ICU); labels do mosaico/blueprint são marcação técnica
 * decorativa da comp (aria-hidden), não copy editorial.
 */

/** Paths definitivos do MANIFEST (§8 — A6 · Phone S6). */
const PHONE_VIDEO_SRC = "/media/phone.mp4";
/* @resolved-by PhoneVideo — só declaração de path; a decisão draft/final é
   do resolveAsset() dentro do PhoneVideo. */
const PHONE_POSTER_SRC = "/media/phone-poster.webp";

interface MosaicCell {
  key: string;
  /** Coluna central destacada (fundo iron, label ink-on-dark). */
  center: boolean;
  label: string;
}

/**
 * Mosaico 3×4 na ordem row-major da comp desktop (coluna central:
 * A6 na linha 1, A9 na linha 3). O CSS reordena p/ a comp mobile.
 */
const MOSAIC_CELLS: readonly MosaicCell[] = [
  { key: "sc1", center: false, label: "SC1" },
  { key: "a6", center: true, label: "A6 · VÍDEO" },
  { key: "sc2", center: false, label: "SC2" },
  { key: "sc3", center: false, label: "SC3" },
  { key: "sc4", center: false, label: "SC4" },
  { key: "sc5", center: false, label: "SC5" },
  { key: "sc6", center: false, label: "SC6" },
  { key: "a9", center: true, label: "A9 · VÍDEO" },
  { key: "sc7", center: false, label: "SC7" },
  { key: "sc8", center: false, label: "SC8" },
  { key: "sc9", center: false, label: "SC9" },
  { key: "sc10", center: false, label: "SC10" },
];

/**
 * Renderiza o título D2 a partir da string oficial do JSON:
 * "{PALAVRA} RESTO **" → chaves e ** em steel (aria-hidden — leitores
 * de tela ouvem só "PALAVRA RESTO"). Se a copy mudar de forma, cai no
 * fallback literal (copy-law L1: nunca reescrever).
 */
function TitleContent({ raw }: { raw: string }) {
  const match = /^\{([^}]+)\}\s+(.+?)\s+\*\*$/.exec(raw.trim());
  if (match === null) {
    return <>{raw}</>;
  }
  const [, word, rest] = match;
  return (
    <>
      <span className={styles.steel} aria-hidden="true">
        {"{"}
      </span>
      {word}
      <span className={styles.steel} aria-hidden="true">
        {"}"}
      </span>
      <br className={styles.mobileBreak} aria-hidden="true" />{" "}
      {rest}{" "}
      <span className={styles.steel} aria-hidden="true">
        **
      </span>
    </>
  );
}

export default async function Automation() {
  const t = await getTranslations();

  // t.raw: as chaves {} da copy oficial são sintaxe ICU p/ o t() normal.
  const rawTitle: unknown = t.raw("automation.title");
  const title = typeof rawTitle === "string" ? rawTitle : "";

  // Descrição existe só na comp mobile; hoje o JSON traz null — o
  // parágrafo só renderiza quando a copy oficial for cravada (L1).
  const rawDescription: unknown = t.raw("automation.description");
  const description =
    typeof rawDescription === "string" && rawDescription.length > 0
      ? rawDescription
      : null;

  // Labels dos nodes do fio (D3): o segmento "automation" tem 3 slots
  // (n1/n2/n3) no THREAD_PLAN — um por passo da comp (CAPTURA/AGENTES/ENTREGA).
  const rawSteps: unknown = t.raw("automation.steps");
  const steps = Array.isArray(rawSteps)
    ? rawSteps.filter((s): s is string => typeof s === "string")
    : [];
  const [stepOne, stepTwo, stepThree] = steps;
  const nodeLabels =
    stepOne !== undefined && stepTwo !== undefined && stepThree !== undefined
      ? { n1: stepOne, n2: stepTwo, n3: stepThree }
      : undefined;

  return (
    <section id="automacao" className={`section-dark ${styles.section}`}
      data-section="automation"
      data-tone="dark"
    >
      <AutomationLine zone="automation" tone="dark" nodeLabels={nodeLabels} />

      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{t("automation.eyebrow")}</p>

        <h2 className={styles.title}>
          <TitleContent raw={title} />
        </h2>

        {description !== null ? (
          <p className={styles.description}>{description}</p>
        ) : null}

        <div className={styles.ctas}>
          <Button variant="primary" href="#portfolio">
            {t("automation.portfolioCta")}
          </Button>
          <Button variant="dark-ghost" href="#contato">
            {t("automation.contactCta")}
          </Button>
        </div>

        <div className={styles.mediaGrid}>
          {/* Phones flutuando (float 6s, fases ±3s). PH-L = slot de
              vídeo A6 (§8); PH-R = tela blueprint decorativa. */}
          <div className={styles.phones} aria-hidden="true">
            <div className={`${styles.phone} ${styles.phoneA}`}>
              <div className={styles.phoneScreen}>
                <PhoneVideo
                  videoSrc={PHONE_VIDEO_SRC}
                  posterSrc={PHONE_POSTER_SRC}
                />
              </div>
            </div>
            <div className={`${styles.phone} ${styles.phoneB}`}>
              <div className={styles.phoneScreen} />
            </div>
          </div>

          {/* Mosaico 3×4 (2 col no mobile) — blueprint decorativo. */}
          <div className={styles.mosaic} aria-hidden="true">
            {MOSAIC_CELLS.map((cell) => (
              <div
                key={cell.key}
                className={
                  cell.center
                    ? `${styles.cell} ${styles.cellCenter}`
                    : styles.cell
                }
              >
                <span
                  className={
                    cell.center
                      ? `${styles.cellLabel} ${styles.labelVideo}`
                      : `${styles.cellLabel} ${styles.labelSc}`
                  }
                >
                  {cell.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
