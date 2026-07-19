# MANIFEST — assets de mídia (contrato §8 do ULTRAGOAL)

> Paths definitivos. O markup dos slots de vídeo nasce final apontando para estes paths + poster;
> quando o arquivo `.mp4` aparecer no path (novo commit), o vídeo passa a tocar sem mudança de código.

## Vídeos (DEFERIDOS — Miguel entrega depois)

| Slot | Path | Poster | Budget | Markup |
|---|---|---|---|---|
| A1 · Hero bg | `public/media/hero.mp4` | `public/media/hero-poster.webp` | ≤ 1,2 MB | `muted playsInline loop autoplay` |
| A2–A5 · Stat-cards S5 | `public/media/stats/stat-{1..4}.mp4` | `public/media/stats/stat-{1..4}-poster.webp` | ≤ 200 KB cada | `muted playsInline loop autoplay` |
| A6 · Phone S6 | `public/media/phone.mp4` | `public/media/phone-poster.webp` | ≤ 250 KB | `muted playsInline loop autoplay` |
| P1–P3 · Portfólio (REAIS, nunca gerados) | `public/media/portfolio-{1,2,3}.mp4` | `public/media/portfolio-{1,2,3}-poster.webp` | ≤ 1 MB cada | `preload="none"` + play no hover/in-view |

## Imagens estáticas (W5 — geradas via gen-image.mjs, fallback placeholder blueprint)

| Asset | Path | Dimensão | Budget |
|---|---|---|---|
| A7 ×3 · Cards de serviço | `public/img/services/{agents,products,data}.webp` | 4:5 (1200×1500) | ≤ 180 KB cada |
| A8 ×2 · Texturas banner | `public/img/texture-{1,2}.webp` | 1:1 | ≤ 120 KB cada |
| A9 · Retrato (placeholder até foto real) | `public/img/founder.webp` | 4:5 | ≤ 200 KB |
| Screenshots portfólio (REAIS) | `public/img/portfolio/shot-{1..6}.webp` | 16:10 | ≤ 250 KB cada |
| OG image | via código `app/opengraph-image.tsx` | 1200×630 | — |

## Regras
- Todo slot de vídeo leva `data-asset="<path>"` (auditoria W5).
- `check-budgets.mjs` falha o build se qualquer asset estourar a tabela.
- Load inicial da home ≤ 3 MB (sem vídeos lazy) — L4.
