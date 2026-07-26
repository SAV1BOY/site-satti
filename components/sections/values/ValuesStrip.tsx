import { getTranslations } from "next-intl/server";
import Marquee from "@/components/ui/Marquee";
import styles from "./ValuesStrip.module.css";

/**
 * ValuesStrip (S3) — faixa de posicionamento. Server Component (L11).
 *
 * ── O que a faixa É (decisão do Miguel nesta wave) ──────────────────────────
 * No modelo isto NÃO é um bloco de cor: é `font: 500 231px/1.21` na cor de
 * acento **sem `background`** — texto gigante sobre o fundo da página. Os
 * "280 px de faixa" que o atlas mediu são a ALTURA DE LINHA desse texto
 * (231 × 1,21 = 279,5). Por isso este componente não crava altura: a altura
 * cai do line-height, como no modelo.
 *
 * `data-variant` na raiz existe para o Miguel trocar com um atributo:
 *   • "text" (default, paridade real) — texto em `--c-band` sobre paper;
 *   • "band" — faixa preenchida em `--c-band` com texto `--c-band-ink`
 *     (= iron; **nunca branco** — a metade da L2 que sobreviveu à DEC-015).
 *
 * ── Marquee ────────────────────────────────────────────────────────────────
 * É a ÚNICA chamada de marquee do site com `pauseOffscreen={false}`: a faixa
 * tem de estar em meio-curso quando entra na viewport, logo roda desde o load
 * (o `content-visibility: auto` das outras pularia o tick e ela apareceria
 * sempre no mesmo ponto do ciclo). Duração pelo token `--dur-band` (20 s),
 * aplicada em CSS — ver ValuesStrip.module.css.
 *
 * Sem margem por desenho: no modelo a faixa encosta no hero e o empurra para
 * fora da viewport. Qualquer margem aqui abriria uma respiração que o modelo
 * não tem.
 *
 * L1: os itens são literais de `content/home.*.json` (values.items), incluindo
 * os separadores "·" — nada de texto novo.
 */
export default async function ValuesStrip() {
  const t = await getTranslations("values");
  const items = t.raw("items") as string[];

  return (
    <section
      className={styles.root}
      data-section="values"
      data-tone="light"
      data-variant="text"
    >
      {/* gap em `em`: resolve contra a font-size da faixa, então o espaçamento
          acompanha o texto em todos os breakpoints. 0,28em é o espaçamento
          entre cópias do modelo (padding-inline 0,14em de cada lado). */}
      <Marquee gap="0.28em" pauseOffscreen={false} className={styles.marquee}>
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className={styles.word}>
            {item}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
