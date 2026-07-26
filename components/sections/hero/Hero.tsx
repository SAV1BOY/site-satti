import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import HeroMedia from "./HeroMedia";
import HeroTypewriter from "./HeroTypewriter";
import styles from "./Hero.module.css";

/**
 * Hero (S1+S2) — Server Component (L11).
 * Comps: "S1+S2 Hero Desktop 1920.dc.html" · "S1+S2 Hero Mobile 375.dc.html".
 *
 * - Full-viewport (uma das 3 seções 100vh — §4).
 * - Fundo: slot de vídeo A1 (§8/MANIFEST) via HeroMedia (client):
 *   poster next/image fill priority sempre; <video> só com motion ok.
 * - H1 único do site: hero.line1 + hero.line2 + typewriter das
 *   hero.words (HeroTypewriter, client). Caret = blaze do viewport.
 * - Badge hero.eyebrow {value, confirm:true} → steel + data-confirm
 *   (modo draft; W6 final omite).
 * - Linha de Automação (D3): zone="hero" como PRIMEIRO filho — o fio
 *   NASCE aqui. Tom "light": a comp do hero é paper/blueprint claro
 *   (hairlines var(--c-line) em badge/cue/nav) — não graphite.
 *   Sem nodeLabels: a comp do hero não tem strings de node (L1).
 * - StickyHeader NÃO é daqui (builder paralelo).
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

/** Alvos das âncoras da nav secundária (ids das seções — integrador). */
const ANCHOR_TARGETS = ["#servicos", "#sobre", "#portfolio"] as const;

export default async function Hero() {
  const t = await getTranslations("hero");
  const tHeader = await getTranslations("header");

  const eyebrow = t.raw("eyebrow") as ConfirmField;
  const words = t.raw("words") as string[];

  // Nav âncora da base do hero (comp: Home · Serviços · Sobre ·
  // Portfólio). Reusa as strings OFICIAIS de header.nav (L1);
  // "Home" não tem chave no JSON — reportado em pendências, não
  // inventado.
  const anchors = (tHeader.raw("nav") as string[]).slice(
    0,
    ANCHOR_TARGETS.length,
  );

  return (
    <section
      className={styles.section}
      data-section="hero"
      data-tone="light"
    >
      <AutomationLine zone="hero" tone="light" className={styles.threadLine} />

      <HeroMedia videoSrc={HERO_VIDEO} posterSrc={HERO_POSTER} />

      <div className={styles.content}>
        {/* W6: badge só com prova real — modo final omite o [CONFIRMAR]. */}
        {!(OMIT_UNCONFIRMED && eyebrow.confirm) ? (
          <span
            className={styles.badge}
            data-confirm={eyebrow.confirm ? "true" : undefined}
          >
            {eyebrow.value}
          </span>
        ) : null}

        <h1 className={styles.title}>
          <span className={styles.titleLine}>{t("line1")}</span>
          <span className={styles.titleLine}>{t("line2")}</span>
          <HeroTypewriter words={words} />
        </h1>
      </div>

      <nav className={styles.anchorNav}>
        {anchors.map((label, i) => (
          <a key={label} className={styles.anchorLink} href={ANCHOR_TARGETS[i]}>
            {label}
          </a>
        ))}
      </nav>

      <div className={styles.cue} aria-hidden="true">
        <span className={styles.cuePing} />
        <span className={styles.cueDisc}>{t("scroll")}</span>
      </div>
    </section>
  );
}
