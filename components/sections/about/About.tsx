import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";

import Button from "@/components/ui/Button";
import FillText from "@/components/ui/FillText";
import Marquee from "@/components/ui/Marquee";
import PulseCircle from "@/components/ui/PulseCircle";

import StatVideo from "./StatVideo";
import styles from "./About.module.css";

/**
 * About (S5) — "02 — Sobre" · Server Component (L11).
 * Comps: "S5 Sobre Desktop 1920.dc.html" · "S5 Sobre Mobile 375.dc.html".
 *
 * Estrutura (ordem da comp): eyebrow + título → 3 statements FillText
 * (assinatura fill-text: IO+rAF no client child, L10) → 4 stat-cards
 * (valor mono GIGANTE [CONFIRMAR] → steel + data-confirm, L1/L8; slot
 * de vídeo A2–A5 no canto, contrato §8 via StatVideo) → diagrama
 * PulseCircle (10 nodes, raios 100/68/42%) + método + CTA → marquee
 * de logos 24s (placeholder autorizado about.logosNotice — L6: nenhum
 * logo inventado).
 *
 * Leis:
 * - L1: copy 100% via next-intl; campos {value, confirm} renderizam
 *   em var(--c-steel) com data-confirm="true" (modo draft; W6 final).
 * - L2: blaze da S5 = CTA "Falar com a SATTI" (comp, aside de specs:
 *   "Blaze único do viewport = CTA"); tint-blaze dos cards é tint,
 *   não acento; marcador 8×8 do eyebrow não conta.
 * - L3: circuit só no diagrama (linhas/hub — funcional).
 * - L5/L10: motion mora nos children (FillText, PulseCircle, Marquee,
 *   StatVideo) — todos gated por media query CSS ou useMotionOk.
 * - §8/MANIFEST: slots A2–A5 nascem com markup final + data-asset;
 *   quando o .mp4 aparecer no path, toca sem mudança de código.
 * - D3: a Linha de Automação NÃO passa pela S5 (zonas: hero →
 *   serviços → automação → portfólio → contato) — sem AutomationLine.
 *
 * Sem retrato/founder: nenhuma das duas comps S5 tem o slot A9
 * (ele vive no mosaico da S6) — não inventar layout.
 */

/** Campo de copy L1: string oficial OU { value, confirm } ([CONFIRMAR] → steel). */
type CopyField =
  | string
  | { value: string; confirm?: boolean; draft?: string | null };

interface MetricJson {
  value: CopyField;
  label: CopyField;
}

function readField(field: CopyField): { text: string; confirm: boolean } {
  if (typeof field === "string") return { text: field, confirm: false };
  return { text: field.value, confirm: field.confirm === true };
}

/** Slots A2–A5, na ordem dos cards (paths definitivos do MANIFEST). */
const STAT_MEDIA: ReadonlyArray<{ videoSrc: string; posterSrc: string }> = [
  {
    videoSrc: "/media/stats/stat-1.mp4",
    posterSrc: "/media/stats/stat-1-poster.webp",
  },
  {
    videoSrc: "/media/stats/stat-2.mp4",
    posterSrc: "/media/stats/stat-2-poster.webp",
  },
  {
    videoSrc: "/media/stats/stat-3.mp4",
    posterSrc: "/media/stats/stat-3-poster.webp",
  },
  {
    videoSrc: "/media/stats/stat-4.mp4",
    posterSrc: "/media/stats/stat-4-poster.webp",
  },
];

/** Tint por card (comp S5: blaze-soft → blue → slate → paper). */
const STAT_TINTS: ReadonlyArray<string> = [
  styles.statBlaze,
  styles.statBlue,
  styles.statSlate,
  styles.statPaper,
];

/** Repetições do aviso na tira de logos (comp: 6 células por cópia). */
const LOGO_CELLS = 6;

export default async function About() {
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const metrics = t.raw("metrics") as MetricJson[];

  return (
    <section
      id="sobre"
      className={styles.section}
      data-section="about"
      data-tone="light"
    >
      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.sectionEyebrow}`}>
          {t("sectionLabel")}
        </p>
        <h2 className={styles.title}>{t("title")}</h2>

        {/* Statements — assinatura fill-text (base var(--c-line),
            preenchimento iron por progresso de scroll no FillText). */}
        <div className={styles.statements}>
          {paragraphs.map((statement) => (
            <FillText key={statement} className={styles.statement}>
              {statement}
            </FillText>
          ))}
        </div>

        {/* 4 stat-cards — valores/labels [CONFIRMAR] (L1/L8) +
            slot de vídeo A2–A5 no canto inferior direito (§8).
            W6 modo final: só cards com valor CONFIRMADO renderizam. */}
        <ul className={styles.stats}>
          {metrics.slice(0, STAT_MEDIA.length).flatMap((metric, index) => {
            const media = STAT_MEDIA[index]; // index < length (slice acima)
            const value = readField(metric.value);
            const label = readField(metric.label);
            if (OMIT_UNCONFIRMED && (value.confirm || label.confirm)) {
              return [];
            }
            return (
              <li
                key={`stat-${index}`}
                className={`${styles.statCard} ${STAT_TINTS[index]}`}
              >
                <span
                  className={styles.statValue}
                  data-confirm={value.confirm ? "true" : undefined}
                >
                  {value.text}
                </span>
                <span
                  className={styles.statLabel}
                  data-confirm={label.confirm ? "true" : undefined}
                >
                  {label.text}
                </span>
                <StatVideo
                  videoSrc={media.videoSrc}
                  posterSrc={media.posterSrc}
                />
              </li>
            );
          })}
        </ul>

        {/* Diagrama do método + copy + CTA. DOM na ordem da comp
            mobile (kicker → diagrama → texto → CTA); no desktop o
            grid re-arranja (diagrama à esquerda, copy à direita). */}
        <div className={styles.method}>
          <p className={styles.methodKicker}>{t("methodTitle")}</p>
          <div className={styles.methodDiagram}>
            <PulseCircle
              ariaLabel={t("methodTitle")}
              labels={t.raw("methodNodes") as string[]}
              className={styles.diagram}
            />
          </div>
          <div className={styles.methodCopy}>
            <p className={styles.methodDescription}>
              {t("methodDescription")}
            </p>
            <Button
              href="#contato"
              variant="primary"
              className={styles.methodCta}
            >
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>

      {/* Marquee de logos 24s — L6: nenhum logo inventado; a tira
          renderiza o aviso oficial about.logosNotice em mono steel
          como placeholder autorizado, nas células da comp. */}
      <div className={styles.logosBand}>
        <Marquee speed={24} gap="0px">
          {Array.from({ length: LOGO_CELLS }, (_, index) => (
            <span
              key={`logo-cell-${index}`}
              className={styles.logoCell}
              aria-hidden={index > 0 ? "true" : undefined}
            >
              {t("logosNotice")}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
