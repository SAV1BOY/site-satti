import { getTranslations } from "next-intl/server";
import Marquee from "@/components/ui/Marquee";
import styles from "./ValuesStrip.module.css";

/**
 * ValuesStrip (S3 · Var A paper) — tira full-bleed com marquee 20s.
 * Fonte visual: "S3 ValuesStrip Var A (paper).dc.html" (+ Mobile 375).
 * Var B (circuit) está ARQUIVADA (§4) — não portar.
 *
 * "resultado mensurável" é TEXTO blaze — o elemento blaze da dobra (L2);
 * separadores "·" em steel; demais itens iron. O item blaze é o de índice
 * 4 na comp (arrays PT/EN são espelhados 1:1 — auditado no W1).
 */
const BLAZE_INDEX = 4;
const SEPARATOR = "·";

export default async function ValuesStrip() {
  const t = await getTranslations("values");
  const items = t.raw("items") as string[];

  return (
    <section
      className={styles.root}
      data-section="values"
      data-tone="light"
    >
      <Marquee speed={20} gap="56px">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={
              item === SEPARATOR
                ? styles.sep
                : i === BLAZE_INDEX
                  ? styles.blaze
                  : styles.item
            }
          >
            {item}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
