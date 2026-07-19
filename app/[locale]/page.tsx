/* W1 · página de prova — tokens + copy vinda do JSON (substituída pelas seções em W3) */

import { getTranslations, setRequestLocale } from "next-intl/server";

const CORE_TOKENS = [
  ["paper", "--c-paper"],
  ["iron", "--c-iron"],
  ["graphite", "--c-graphite"],
  ["steel", "--c-steel"],
  ["blaze", "--c-blaze"],
  ["circuit", "--c-circuit"],
  ["blaze-soft", "--c-blaze-soft"],
  ["line", "--c-line"],
  ["ink-on-dark", "--c-ink-on-dark"],
  ["line-dark", "--c-line-dark"],
  ["hairline-dark", "--c-hairline-dark"],
  ["error", "--c-error"],
  ["success", "--c-success"],
] as const;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menu");
  const items = t.raw("items") as string[];

  return (
    <main
      style={{
        background: "var(--c-paper)",
        color: "var(--c-iron)",
        minHeight: "100vh",
        padding: "var(--sp-2xl) var(--gutter)",
      }}
    >
      <span className="eyebrow">W1 · Fundação</span>

      <h1
        style={{
          fontFamily: "var(--ff-display)",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "clamp(4rem, 12vw, 10.5rem)",
          lineHeight: 0.92,
          letterSpacing: "-0.02em",
          margin: "var(--sp-lg) 0",
        }}
      >
        {t("brand")}
      </h1>

      <nav
        aria-label="seções"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--sp-md)",
          borderTop: "1px solid var(--c-line)",
          padding: "var(--sp-md) 0",
        }}
      >
        {items.map((item) => (
          <span key={item} className="eyebrow">
            {item}
          </span>
        ))}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--c-line)",
          paddingTop: "var(--sp-md)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "var(--sp-xs)",
        }}
      >
        {CORE_TOKENS.map(([name, cssVar]) => (
          <div
            key={name}
            style={{
              border: "1px solid var(--c-line)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
            }}
          >
            <div style={{ height: 64, background: `var(${cssVar})` }} />
            <div
              style={{
                fontFamily: "var(--ff-mono)",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--c-steel)",
                padding: "var(--sp-2xs) var(--sp-xs)",
              }}
            >
              {name}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
