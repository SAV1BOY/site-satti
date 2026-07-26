import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";

import Button from "@/components/ui/Button";
import Marquee from "@/components/ui/Marquee";

import AboutStatements from "./AboutStatements";
import { MethodFocusProvider } from "./MethodFocus";
import MethodGraph from "./MethodGraph";
import MethodSteps from "./MethodSteps";
import StatVideo from "./StatVideo";
import styles from "./About.module.css";

/**
 * About (S5) — "02 — Sobre" · Server Component (L11).
 * Geometria: design/awsmd-ref/awsmd-geometry.json → about.
 *
 * v2 · REESTRUTURADA. A S5 era o SEGUNDO MAIOR desvio de paridade do site:
 * ocupava 21,2 % da altura da página contra 8,8 % do modelo. O excesso não
 * estava em padding — estava em EMPILHAR o que o modelo põe em slider e em
 * coluna:
 *
 * - os 3 statements eram uma pilha vertical de fill-text em tamanho display;
 *   a spec (`about.fillTextSlider`) é UM slot em fade. Agora é um slot, e o
 *   slot é dirigido pelo anel do grafo (DEC-021 §7 — a interação que faltava);
 * - o método era uma faixa própria embaixo dos stat-cards, com o diagrama
 *   atravessando quatro linhas de grid; agora o grafo e a copy são as DUAS
 *   COLUNAS do bloco `content` da spec (esquerda ≤650px, direita padding-left
 *   25px, align-items center);
 * - os stat-cards caíram de min-height 300 para os 199 da spec (180 ≤1366px);
 * - o head ganhou o `::after` de colchete aberto de 15px, que é pequeno e
 *   muito característico.
 *
 * Estrutura (ordem da spec): head (eyebrow + título 58px com o colchete) →
 * content (grafo | statement em crossfade + passos do método + descrição +
 * CTA) → 4 stat-cards → banda de logos.
 *
 * Leis:
 * - L1: copy 100 % via next-intl; campos {value, confirm} renderizam em
 *   var(--c-steel) com data-confirm="true" (modo draft; W6 final omite).
 * - L3: circuit só no grafo (anéis/nós — uso funcional).
 * - L5/L10: motion mora nos children (FillText, PulseCircle, Marquee,
 *   StatVideo) e nunca fora de no-preference.
 * - L6: NENHUM logo de terceiro, em nenhum modo. A tira renderiza células com
 *   hairline (288×202 da spec) e a legenda oficial `about.logosNotice`.
 * - §8/MANIFEST: slots A2–A5 nascem com markup final + data-asset.
 * - D3: a Linha de Automação não passa pela S5 — sem AutomationLine.
 *
 * O provider `MethodFocusProvider` envolve o bloco `content` e recebe a árvore
 * como children: os stat-cards, a lista de métricas e o CTA seguem sendo
 * renderizados NO SERVIDOR (L11). Só `AboutStatements`, `MethodGraph` e
 * `MethodSteps` são client, porque só eles precisam do estado compartilhado.
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
    // @resolved-by StatVideo — a tabela abaixo só declara paths; a decisão
    // draft/final é do resolveAsset() dentro do StatVideo.
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

/** Células por cópia da tira de logos (spec: célula 288×202 com hairline). */
const LOGO_CELLS = 5;

export default async function About() {
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const metrics = t.raw("metrics") as MetricJson[];
  const methodNodes = t.raw("methodNodes") as string[];

  return (
    <section
      id="sobre"
      className={styles.section}
      data-section="about"
      data-tone="light"
    >
      <div className={`container-s ${styles.inner}`}>
        {/* Head — o ::after é o colchete aberto de 15px (spec: head.bracket):
            borda em três lados, ancorado na base, sem borda inferior. */}
        <div className={styles.head}>
          <p className={`eyebrow ${styles.sectionEyebrow}`}>
            {t("sectionLabel")}
          </p>
          <h2 className={styles.title}>{t("title")}</h2>
        </div>

        <MethodFocusProvider>
          <div className={styles.content}>
            {/* Coluna esquerda (spec: max-width 650) — o grafo do método. */}
            <div className={styles.graphCol}>
              <p className={styles.methodKicker}>{t("methodTitle")}</p>
              <MethodGraph
                ariaLabel={t("methodTitle")}
                labels={methodNodes}
              />
            </div>

            {/* Coluna direita (spec: padding-left 25) — statement em crossfade
                dirigido pelos anéis, passos alcançáveis, descrição e CTA. */}
            <div className={styles.copyCol}>
              <AboutStatements paragraphs={paragraphs} />
              <MethodSteps labels={methodNodes} />
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
        </MethodFocusProvider>

        {/* 4 stat-cards — valores/labels [CONFIRMAR] (L1/L8) + slot de vídeo
            A2–A5 no canto (§8). W6 modo final: só cards confirmados. */}
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
      </div>

      {/* Tira de logos — L6 integral neste ponto: as 10 marcas do modelo estão
          em excludedEvenInPreview, então NENHUMA imagem entra. Ficam as células
          com hairline da spec (288×202, sem borda esquerda na adjacente) e a
          legenda oficial about.logosNotice. DEC-021: 15s, não 24s. */}
      <div className={styles.logosBand}>
        {/* staticBelow=768: DEC-021 — a tira do modelo vira grade estática em
            tela pequena. É prop do Marquee, sem JS e sem tocar no componente. */}
        <Marquee speed={15} gap="0px" staticBelow={768}>
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
