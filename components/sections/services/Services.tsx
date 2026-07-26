import Image from "next/image";
import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import ServicesDeck from "./ServicesDeck";
import styles from "./Services.module.css";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";

/**
 * Services (S4) — Server Component (L11).
 * Geometria: design/awsmd-ref/awsmd-geometry.json → services.
 *
 * v2 · CARD PREENCHIDO POR IMAGEM (DEC-018b — reversão consciente do v1).
 * O v1 tinha cards TINTADOS com texto escuro e uma janela de imagem de
 * 454×196 no topo ("Tints S4"). O modelo usa o card cheio de imagem com
 * texto CLARO por cima, raio 7px e um gradiente inferior de legibilidade.
 * Paridade vence, e o tint da SATTI não se perde: virou UNDERLAY atrás da
 * imagem, o que preserva a paleta por card E é o fallback exato para
 * quando o modo `final` trocar a imagem pelo blueprint.
 *
 * Estrutura do card, na ordem de empilhamento:
 *   underlay (tint) → imagem (cover, center bottom, respiro 4s) → scrim →
 *   corpo (padding 25: título no topo, e a 240px dele o número, a
 *   descrição e a régua de tags).
 *
 * O SCRIM É ESTRUTURAL, NÃO DECORATIVO — sem ele o texto claro sobre
 * imagem não passa AA, e contraste é gate. São duas camadas, e as duas
 * têm conta fechada contra a PIOR hipótese (imagem branca):
 *   · piso uniforme de 58 % de graphite → título de 48px a 4,29:1
 *     (exigência de texto grande: 3:1);
 *   · faixa inferior de 60 % da altura somando 72 % sobre o piso
 *     (= 88 % efetivos) → número, descrição e tags a ~9–12:1.
 * É por isso que o número saiu de cima do título e foi para o bloco de
 * baixo: 11px de mono no topo do card precisaria de ~59 % de véu só para
 * ele, e escurecer o card inteiro por causa de uma legenda é pior do que
 * mover a legenda. A ordem de leitura não muda (número → título é a mesma
 * informação que título → número num card com um único assunto).
 *
 * Leis:
 * - L1: copy 100 % via next-intl (números, títulos, descrições, tags e a
 *   seta são todos do content/home.pt-BR.json).
 * - L4: `sizes` real do card (1/3 da largura útil no desktop).
 * - L5/L10: o respiro scale 1→1.2 (--dur-scaler) só existe dentro de
 *   no-preference; reduced-motion = imagem parada, fila final.
 * - V2-D2: as 3 imagens passam por `resolveAsset()` e são marcadas com
 *   `thirdPartyAttrs()` — em `final` a decisão é do lib/third-party.ts.
 * - D3: a Linha de Automação é o PRIMEIRO filho da <section>
 *   (position: relative), conteúdo em wrapper z-index:1.
 *
 * Sem coreografia de pin: o rail de 220vh do v1 foi removido (DEC-021 §2 —
 * era a maior violação de paridade do build) e não volta. O ServicesDeck
 * abre os cards pela PASSAGEM NATURAL da seção.
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

/** L4: spec item.flex = 0 0 33.3333% → 1/3 da largura útil no desktop. */
const IMAGE_SIZES = "(min-width: 1024px) 34vw, 100vw";

export default async function Services() {
  const t = await getTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <section
      id="servicos"
      className={styles.section}
      data-section="services"
      data-tone="light"
    >
      <AutomationLine zone="services" tone="light" />

      <div className={styles.inner}>
        <span className={`eyebrow ${styles.kicker}`}>{t("sectionLabel")}</span>
        <h2 className={styles.title}>{t("title")}</h2>

        <ServicesDeck>
          {items.map((item, index) => {
            const src = CARD_IMAGES[index] ?? CARD_IMAGES[0];
            const image = resolveAsset(src);

            return (
              <div key={item.title} className={styles.item} data-deck-card="">
                <article className={styles.card}>
                  {/* Imagem cobrindo o card. O tint fica no .card (underlay) e
                      aparece sozinho quando o modo final não renderiza a
                      imagem. Decorativa: alt="" + wrapper aria-hidden — não há
                      chave de alt no JSON e a L1 proíbe inventar copy. */}
                  <div
                    className={styles.media}
                    data-asset={src}
                    {...thirdPartyAttrs(src)}
                    aria-hidden="true"
                  >
                    {image.render ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes={IMAGE_SIZES}
                        className={styles.mediaImg}
                      />
                    ) : null}
                  </div>

                  {/* Legibilidade — estrutural (ver cabeçalho). */}
                  <div className={styles.scrim} aria-hidden="true" />

                  <div className={styles.body}>
                    <h3 className={styles.cardTitle}>
                      {item.title}
                      <span className={styles.arrow} aria-hidden="true">
                        {item.arrow}
                      </span>
                    </h3>

                    <div className={styles.foot}>
                      <p className={styles.number}>{item.number}</p>
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
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </ServicesDeck>
      </div>
    </section>
  );
}
