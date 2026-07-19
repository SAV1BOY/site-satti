import Image from "next/image";
import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import ServicesDeck from "./ServicesDeck";
import styles from "./Services.module.css";

/**
 * Services (S4) — Server Component (L11).
 * Comps: "S4 Servicos Desktop 1920.dc.html" · "S4 Servicos Mobile 375.dc.html".
 *
 * - Seção clara (paper), id="servicos" (alvo da âncora do hero/menu).
 * - Eyebrow services.sectionLabel ("01 — Serviços", numeração D5) +
 *   título services.title — copy 100% via next-intl (L1).
 * - 3 cards com tints F0–F5 (--tint-blaze/--tint-blue/--tint-slate —
 *   tints, NÃO acento; NENHUM blaze estático na S4: o blaze da dobra
 *   é o pulso da Linha passando — L2).
 * - Imagens A7 nos paths FINAIS do MANIFEST
 *   (/img/services/{agents,products,data}.webp, placeholders já em
 *   disco) via next/image fill + sizes reais (L4); respiração
 *   scale 1→1.2 4s alternate só com motion ok (CSS em no-preference).
 *   alt="" + wrapper aria-hidden: ilustração decorativa — não há
 *   chave de alt no JSON e a L1 proíbe inventar copy (título/descrição
 *   oficiais ficam adjacentes no card).
 * - Coreografia "cards sobrepostos no scroll" (Atlas 03): stack com
 *   offset 40px → fila com sobreposição -40px, no ServicesDeck
 *   (client, IO + rAF, só transform — L10). Mobile e reduced-motion:
 *   pilha/fila estática das comps (L5).
 * - Linha de Automação (D3): zone="services" tone="light" como
 *   PRIMEIRO filho da <section> (position: relative), conteúdo em
 *   wrapper z-index:1. Sem nodeLabels: a comp S4 só tem círculos,
 *   nenhuma string de node (L1).
 */

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  /** JSON traz um 4º slot null — filtrado antes de renderizar. */
  tags: ReadonlyArray<string | null>;
  arrow: string;
}

/** Paths FINAIS do MANIFEST (A7 ×3), na ordem dos services.items. */
const CARD_IMAGES = [
  "/img/services/agents.webp",
  "/img/services/products.webp",
  "/img/services/data.webp",
] as const;

/** L4: card ≈ (100vw − 2×gutter + 80px)/3 no desktop; full-bleed − padding no mobile. */
const IMAGE_SIZES = "(min-width: 1024px) 28vw, calc(100vw - 80px)";

export default async function Services() {
  const t = await getTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <section id="servicos" className={styles.section}>
      <AutomationLine zone="services" tone="light" />

      <div className={styles.inner}>
        <span className={`eyebrow ${styles.kicker}`}>{t("sectionLabel")}</span>
        <h2 className={styles.title}>{t("title")}</h2>

        <ServicesDeck>
          {items.map((item, i) => (
            <article
              key={item.title}
              className={styles.card}
              data-deck-card=""
            >
              <div className={styles.media} aria-hidden="true">
                <Image
                  src={CARD_IMAGES[i] ?? CARD_IMAGES[0]}
                  alt=""
                  fill
                  sizes={IMAGE_SIZES}
                  className={styles.mediaImg}
                />
              </div>

              <div className={styles.heading}>
                <p className={styles.number}>{item.number}</p>
                <div className={styles.titleRow}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.arrow} aria-hidden="true">
                    {item.arrow}
                  </span>
                </div>
              </div>

              <p className={styles.desc}>{item.description}</p>

              <ul className={styles.tags}>
                {item.tags
                  .filter(
                    (tag): tag is string =>
                      typeof tag === "string" && tag.length > 0,
                  )
                  .map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </ServicesDeck>
      </div>
    </section>
  );
}
