import { existsSync } from "node:fs";
import { join } from "node:path";
import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import HeroMedia from "./HeroMedia";
import HeroShowreel from "./HeroShowreel";
import HeroTypewriter from "./HeroTypewriter";
import styles from "./Hero.module.css";

/**
 * Hero (S1+S2) — Server Component (L11).
 * Geometria: design/awsmd-ref/awsmd-geometry.json → `hero`.
 * Copy/paleta: comps "S1+S2 Hero Desktop 1920/Mobile 375".
 *
 * v2 (W11-A) — a seção é uma MOLDURA de 12px em volta de um CARD de
 * raio 33px com scrim, não um bloco full-bleed. Ver o cabeçalho do
 * Hero.module.css para o porquê de cada mudança.
 *
 * - `data-tone="light"` é DELIBERADO mesmo com o interior do card
 *   escuro: `tone` é o ritmo claro/escuro da PÁGINA (verticalAnatomy
 *   classifica o hero como "media") e o gate de paridade conta 3
 *   seções escuras. Ver Hero.module.css.
 * - Nada de pin/scale-down/clip-path de saída: o modelo mede ratio
 *   0,94 no hero (geometry.meta.noPinning) — a seção só rola.
 * - O H1 é o único do site: hero.line1 + scroll-button INLINE +
 *   hero.line2 + typewriter das hero.words.
 * - A nav secundária reusa os 6 rótulos OFICIAIS de footer.navigation
 *   com os MESMOS destinos do rodapé (L1 — zero copy nova).
 * - StickyHeader e o pill fixo NÃO são daqui (infra de movimento).
 *
 * A11y conhecido: o scroll-button vive DENTRO do <h1> (é a geometria
 * do modelo — hero.scrollButton.$comment), então o nome acessível do
 * heading passa a incluir hero.scrollAriaLabel. É o preço de ter o
 * botão inline na frase; a alternativa (botão fora do h1) perderia a
 * assinatura. Registrado aqui de propósito.
 */

/** Campo com marcação [CONFIRMAR] do JSON (L1 — copy-law). */
interface ConfirmField {
  value: string;
  confirm?: boolean;
  draft?: string | null;
}

/** Paths definitivos do MANIFEST (A1) — contrato §8. */
const HERO_VIDEO = "/media/hero.mp4";
/* @resolved-by HeroMedia — só declaração de path; a decisão draft/final e o
   gate de 768px do vídeo são do HeroMedia. */
const HERO_POSTER = "/media/hero-poster.webp";

/** Slot SR do MANIFEST §1 — DEFERIDO (o Miguel grava). */
const SHOWREEL_VIDEO = "/media/showreel.mp4";
const SHOWREEL_POSTER = "/media/showreel-poster.webp";

/**
 * Alvos da nav secundária: os MESMOS de Footer.tsx (NAV_TARGETS), na
 * ordem de footer.navigation. "Início" não tem seção própria → "#top".
 */
const ANCHOR_TARGETS = [
  "#top",
  "#servicos",
  "#sobre",
  "#automacao",
  "#portfolio",
  "#contato",
] as const;

/** Índice de "Portfólio" em footer.navigation — destino do showreel deferido. */
const PORTFOLIO_INDEX = 4;

/** O arquivo já está no path? Decidido no servidor, no build. */
function publicFileExists(publicPath: string): boolean {
  return existsSync(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

export default async function Hero() {
  const t = await getTranslations("hero");
  const tFooter = await getTranslations("footer");

  const eyebrow = t.raw("eyebrow") as ConfirmField;
  const words = t.raw("words") as string[];

  const navigation = (tFooter.raw("navigation") as string[]).slice(
    0,
    ANCHOR_TARGETS.length,
  );

  /* MANIFEST SR: sem o arquivo em disco o player é omitido e o botão
     ancora no portfólio — em draft e em final, porque o que decide é a
     ausência do vídeo, não o modo de conteúdo. */
  const hasShowreel = publicFileExists(SHOWREEL_VIDEO);
  const hasShowreelPoster = hasShowreel && publicFileExists(SHOWREEL_POSTER);

  // W6: badge só com prova real — modo final omite o [CONFIRMAR].
  const showProof = !(OMIT_UNCONFIRMED && eyebrow.confirm);

  return (
    <section className={styles.section} data-section="hero" data-tone="light">
      <AutomationLine zone="hero" tone="light" className={styles.threadLine} />

      <div className={styles.card}>
        <HeroMedia videoSrc={HERO_VIDEO} posterSrc={HERO_POSTER} />

        <div className={styles.content}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>
              {t("line1")}{" "}
              <a
                className={styles.scrollButton}
                href="#servicos"
                aria-label={t("scrollAriaLabel")}
              >
                <span className={styles.scrollArrow} aria-hidden="true">
                  {t("scroll")}
                </span>
                <span
                  className={`${styles.scrollArrow} ${styles.scrollArrowIn}`}
                  aria-hidden="true"
                >
                  {t("scroll")}
                </span>
              </a>{" "}
              {t("line2")} <HeroTypewriter words={words} />
            </h1>
          </div>

          <div className={styles.aside}>
            <HeroShowreel
              mode={hasShowreel ? "player" : "anchor"}
              videoSrc={SHOWREEL_VIDEO}
              posterSrc={hasShowreelPoster ? SHOWREEL_POSTER : undefined}
              playLabel={t("showreelPlayAriaLabel")}
              anchorLabel={navigation[PORTFOLIO_INDEX] ?? ""}
              anchorHref={ANCHOR_TARGETS[PORTFOLIO_INDEX]}
            />

            {/* Prova social: o selo de plataforma do modelo está em
                excludedEvenInPreview (DEC-017) — o slot é hero.eyebrow. */}
            {showProof ? (
              <div
                className={styles.proof}
                data-confirm={eyebrow.confirm ? "true" : undefined}
              >
                <span className={styles.proofBox}>{eyebrow.value}</span>
              </div>
            ) : null}
          </div>
        </div>

        <nav className={styles.anchorNav} aria-label={t("anchorsAriaLabel")}>
          {navigation.map((label, i) => (
            <a key={label} className={`hit-target ${styles.anchorLink}`} href={ANCHOR_TARGETS[i]}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
