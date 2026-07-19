/* W0 · página de prova dos tokens — substituída pelas seções em W1–W3 */

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

export default function Home() {
  return (
    <main
      style={{
        background: "var(--c-paper)",
        color: "var(--c-iron)",
        minHeight: "100vh",
        padding: "var(--sp-2xl) var(--gutter)",
        fontFamily: "var(--ff-body)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}>
        <span
          aria-hidden
          style={{ width: 8, height: 8, background: "var(--c-blaze)", display: "inline-block" }}
        />
        <span
          style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "0.875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--c-steel)",
          }}
        >
          W0 · Bootstrap
        </span>
      </div>

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
        SATTI
      </h1>

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
