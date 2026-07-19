import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import styles from "./Reviews.module.css";

/**
 * Reviews (S10 · Depoimentos) — grade ESTÁTICA de 3 cards sobre paper.
 * Fonte visual: "S10 Depoimentos Desktop 1920.dc.html" + Mobile 375.
 * (Rebuild do CC: a 1ª entrega trouxe um slider dark de card único que
 * não existe na comp — FAIL bloqueante do gate W3, item 1.)
 *
 * L1: NUNCA inventar nome/cargo/foto/citação — os 3 cards renderizam os
 * placeholders [CONFIRMAR] do JSON (reviews.quote/name/role), com
 * data-confirm para o modo final (W6) omitir a seção sem depoimento real.
 * Cores dos placeholders = as da comp (quote steel, nome iron).
 * Aspas: Archivo 900 64px blaze — 1 por card, conforme a comp aprovada.
 * Avatar: círculo blueprint 52px sem texto (o rótulo da comp é template
 * var sem string oficial — nada a inventar).
 * Server Component puro: seção 100% estática (sem motion próprio).
 */

type CopyField = { value: string; confirm?: boolean };

const CARD_COUNT = 3;

export default async function Reviews() {
  const t = await getTranslations("reviews");
  const quote = t.raw("quote") as CopyField;
  const name = t.raw("name") as CopyField;
  const role = t.raw("role") as CopyField;

  // W6 modo final: sem depoimento REAL a seção inteira é omitida (§6-W6).
  if (OMIT_UNCONFIRMED && (quote.confirm || name.confirm || role.confirm)) {
    return null;
  }

  return (
    <section id="depoimentos" className={styles.root}>
      <p className={`eyebrow ${styles.eyebrow}`}>{t("sectionLabel")}</p>

      <div className={styles.head}>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.notice}>{t("notice")}</p>
      </div>

      <ul className={styles.grid}>
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <li key={i} className={styles.card}>
            <span className={styles.quoteMark} aria-hidden="true">
              {t("quoteMark")}
            </span>
            <blockquote
              className={styles.quote}
              data-confirm={quote.confirm ? "true" : undefined}
            >
              {quote.value}
            </blockquote>
            <div className={styles.person}>
              <span className={styles.avatar} aria-hidden="true" />
              <span className={styles.personMeta}>
                <span
                  className={styles.name}
                  data-confirm={name.confirm ? "true" : undefined}
                >
                  {name.value}
                </span>
                <span
                  className={styles.role}
                  data-confirm={role.confirm ? "true" : undefined}
                >
                  {role.value}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
