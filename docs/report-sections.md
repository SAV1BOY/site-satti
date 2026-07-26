## `[CONFIRMAR]` pendentes — o que destrava o modo `final` completo

> O modo `final` já funciona: ele **omite** com elegância o que não tem copy oficial
> (DEC-012). Cada item cravado abaixo REAPARECE no site. Total: **33 campos** em 9 seções.

| Seção | Campo | Estado | Rascunho existente |
|---|---|---|---|
| `about` | `metrics.[0].value` | [CONFIRMAR] | — |
| `about` | `metrics.[0].label` | [CONFIRMAR label da métrica 01] | — |
| `about` | `metrics.[1].value` | [CONFIRMAR] | — |
| `about` | `metrics.[1].label` | [CONFIRMAR label da métrica 02] | — |
| `about` | `metrics.[2].value` | [CONFIRMAR] | — |
| `about` | `metrics.[2].label` | [CONFIRMAR label da métrica 03] | — |
| `about` | `metrics.[3].value` | [CONFIRMAR] | — |
| `about` | `metrics.[3].label` | [CONFIRMAR label da métrica 04] | — |
| `banner` | `copy` | [CONFIRMAR — copy do banner a definir] | Número bom não mente: dado + IA = crescimento com método. |
| `cases` | `beforeValue` | [CONFIRMAR] | — |
| `cases` | `afterValue` | [CONFIRMAR] | — |
| `contact` | `error` | [CONFIRMAR mensagem de erro] | — |
| `contact` | `linkedin` | [CONFIRMAR handle LinkedIn] | — |
| `contact` | `instagram` | [CONFIRMAR handle Instagram] | — |
| `footer` | `linkedin` | [CONFIRMAR handle LinkedIn] | — |
| `footer` | `instagram` | [CONFIRMAR handle Instagram] | — |
| `hero` | `eyebrow` | [CONFIRMAR fonte real] | — |
| `menu` | `linkedin` | [CONFIRMAR handle LinkedIn] | — |
| `menu` | `instagram` | [CONFIRMAR handle Instagram] | — |
| `portfolio` | `items.[5].title` | [CONFIRMAR 6º projeto público] | — |
| `portfolio` | `items.[5].tag` | [CONFIRMAR] | — |
| `reviews` | `items.[0].quote` | [CONFIRMAR depoimento] | — |
| `reviews` | `items.[0].name` | [CONFIRMAR nome] | — |
| `reviews` | `items.[0].role` | [CONFIRMAR cargo · empresa] | — |
| `reviews` | `items.[1].quote` | [CONFIRMAR depoimento] | — |
| `reviews` | `items.[1].name` | [CONFIRMAR nome] | — |
| `reviews` | `items.[1].role` | [CONFIRMAR cargo · empresa] | — |
| `reviews` | `items.[2].quote` | [CONFIRMAR depoimento] | — |
| `reviews` | `items.[2].name` | [CONFIRMAR nome] | — |
| `reviews` | `items.[2].role` | [CONFIRMAR cargo · empresa] | — |
| `reviews` | `items.[3].quote` | [CONFIRMAR depoimento] | — |
| `reviews` | `items.[3].name` | [CONFIRMAR nome] | — |
| `reviews` | `items.[3].role` | [CONFIRMAR cargo · empresa] | — |

## Assets do modelo estrutural — tabela de swap (V2-D2 / DEC-017)

> Estes assets entram em **preview** para que a paridade possa ser avaliada, e o modo
> `final` os omite ou substitui — nada aqui chega a `sattiai.com`. O gate
> `npm run thirdparty` falha o build se algum puder vazar. `finalMode` diz o que acontece
> em produção: **omit** = o elemento não renderiza · **placeholder** = renderiza o
> blueprint da SATTI.

| # | Seção | Path | Em disco | `final` | O que o Miguel precisa produzir |
|---|---|---|---|---|---|
| 1 | `hero` | `/media/hero.mp4` | 1× · 989.0 KB | **omit** | Vídeo de fundo SATTI 16:9, ~10 s em loop, ≤1,2 MB (docs/06 §2: filamento blaze em circuito sobre paper/graphite) |
| 2 | `hero` | `/media/hero-poster.webp` | 1× · 29.1 KB | **placeholder** | Frame 0 do vídeo SATTI já codificado, 1600×900 WebP ≤120 KB |
| 3 | `services` | `/img/services/agents.webp` | 1× · 88.2 KB | **placeholder** | A7a — imagem do card Agentes de IA & Automações, 1208×1306 alpha ≤180 KB (docs/06 §5) |
| 4 | `services` | `/img/services/products.webp` | 1× · 178.4 KB | **placeholder** | A7b — imagem do card Produtos Web & SaaS, 1208×1306 alpha ≤180 KB |
| 5 | `services` | `/img/services/data.webp` | 1× · 167.9 KB | **placeholder** | A7c — imagem do card Dados & Integrações, 1208×1306 alpha ≤180 KB (a fonte do modelo tem só 534×544 — este é o primeiro a substituir) |
| 6 | `about` | `/media/stats/stat-1.mp4` | 1× · 117.6 KB | **omit** | A2 — objeto 3D SATTI 1:1 em loop, ≤200 KB (docs/06 §3) |
| 7 | `about` | `/media/stats/stat-1-poster.webp` | 1× · 5.3 KB | **placeholder** | A2 poster — frame do .mp4 SATTI já codificado, 320×320 ≤24 KB |
| 8 | `about` | `/media/stats/stat-2.mp4` | 1× · 149.3 KB | **omit** | A3 — objeto 3D SATTI 1:1 em loop, ≤200 KB (docs/06 §3) |
| 9 | `about` | `/media/stats/stat-2-poster.webp` | 1× · 8.2 KB | **placeholder** | A3 poster — frame do .mp4 SATTI já codificado, 320×320 ≤24 KB |
| 10 | `about` | `/media/stats/stat-3.mp4` | 1× · 23.3 KB | **omit** | A4 — objeto 3D SATTI 1:1 em loop, ≤200 KB (docs/06 §3) |
| 11 | `about` | `/media/stats/stat-3-poster.webp` | 1× · 5.2 KB | **placeholder** | A4 poster — frame do .mp4 SATTI já codificado, 320×320 ≤24 KB |
| 12 | `about` | `/media/stats/stat-4.mp4` | 1× · 134.5 KB | **omit** | A5 — objeto 3D SATTI 1:1 em loop, ≤200 KB (docs/06 §3) |
| 13 | `about` | `/media/stats/stat-4-poster.webp` | 1× · 9.2 KB | **placeholder** | A5 poster — frame do .mp4 SATTI já codificado, 320×320 ≤24 KB |
| 14 | `automation` | `/img/automation/phone-left.webp` | 1× · 94.8 KB | **placeholder** | PH-L — mockup de phone SATTI, 674×1100 alpha ≤250 KB |
| 15 | `automation` | `/img/automation/phone-right.webp` | 1× · 78.1 KB | **placeholder** | PH-R — mockup de phone SATTI, 756×1236 alpha ≤250 KB |
| 16 | `automation` | `/img/automation/hand.webp` | 1× · 57.1 KB | **omit** | A9 — foto da mão do Miguel segurando o telefone com o CallAudit aberto, fundo removido, WebP com alpha ≤400 KB (docs/06 §6 prefere foto própria) |
| 17 | `automation` | `/img/automation/screen-*.webp` | 12× · 505.7 KB | **placeholder** | SC01–SC12 — capturas reais de telas de produtos SATTI, 730×1540 ≤120 KB cada |
| 18 | `automation` | `/media/phone.mp4` | 1× · 196.1 KB | **omit** | A6 — gravação real de tela do CallAudit 9:19, ≤250 KB (docs/06 §4: não gerar UI de cliente falsa) |
| 19 | `automation` | `/media/phone-poster.webp` | 1× · 1.9 KB | **placeholder** | A6 poster — frame do .mp4 SATTI já codificado, 384×832 ≤40 KB |
| 20 | `portfolio` | `/media/portfolio-1.mp4` | 1× · 609.8 KB | **omit** | P1 — gravação REAL de projeto SATTI, 8 s 720×720 ≤1 MB (docs/06 §0.1: portfólio nunca é gerado) |
| 21 | `portfolio` | `/media/portfolio-2.mp4` | 1× · 613.6 KB | **omit** | P2 — gravação REAL de projeto SATTI, 8 s 720×720 ≤1 MB (docs/06 §0.1: portfólio nunca é gerado) |
| 22 | `portfolio` | `/media/portfolio-3.mp4` | 1× · 630.0 KB | **omit** | P3 — gravação REAL de projeto SATTI, 8 s 720×720 ≤1 MB (docs/06 §0.1: portfólio nunca é gerado) |
| 23 | `portfolio` | `/img/portfolio/shot-*.webp` | 6× · 532.1 KB | **placeholder** | P1–P6 — screenshots REAIS dos 6 projetos, 1400×1440 ≤250 KB cada. Os de 1–3 são o frame 0 do respectivo .mp4 |
| 24 | `banner` | `/img/texture-*.webp` | 2× · 8.6 KB | **placeholder** | A8 ×2 — texturas SATTI, 476×180 ≤40 KB cada (docs/06 §6 — ou gerar proceduralmente e sair desta lista) |
| 25 | `cases` | `/img/cases/thumb-*.webp` | 3× · 103.8 KB | **placeholder** | C1–C3 — capturas reais dos 3 cases em destaque, 744×480 ≤120 KB cada |

### Excluídos até em preview (DEC-017)

> Para estes, "marcar e trocar depois" não resolve o problema, porque o problema não é
> direito autoral de composição. Nunca foram importados.

| Grupo | Por quê | O que renderiza no lugar |
|---|---|---|
| `review-avatars` | 4 fotos de pessoas reais, com nome e cargo, que no site da SATTI apareceriam como clientes da SATTI — dado pessoal sem base legal (LGPD art. 7) | placeholder blueprint 78×78 em public/img/reviews/avatar-{1..4}.webp |
| `review-platform-badges` | Selos de prêmio/review conquistados por OUTRA empresa — exibi-los é afirmação factual falsa, pior em preview do que em produção | nada; o slot de prova social do hero usa hero.eyebrow ([CONFIRMAR fonte real]) |
| `client-logos` | 10 marcas vivas de empresas que não são clientes da SATTI — exibi-las num mural de clientes é uso indevido de marca. L6 permanece integral neste ponto | marquee de células com hairline 288×202 + about.logosNotice = [SOMENTE com autorização] |
| `model-brand-marks` | Logo e badge de perfil do próprio site-modelo | marca SATTI de Site/BRANDING/logo-factory/out/ |
| `click-to-play-seal` | Arte raster do selo do modelo. Redesenhar é trivial e o resultado é melhor: texto em JetBrains Mono sobre path circular, ponto blaze, ~700 B inline, herda currentColor | SVG inline first-party no HeroShowreel, girando 10 s |
| `icon-svgs` | Seta e ícone de play do modelo (307 B e 264 B). Não há razão para carregar arquivo de terceiro para dois paths — a SATTI já renderiza setas como glifo | SVG inline nos componentes |

## Vídeos — onde soltar cada arquivo e com que comando

> O markup de cada slot já é FINAL: poster + `data-asset` + path definitivo. Commitar o
> `.mp4` no path faz o vídeo tocar **sem uma linha de código mudar**. Os slots que hoje
> têm bytes do modelo estão na tabela de swap acima.

| Slot | Path | Budget | Em disco hoje |
|---|---|---|---|
| A1 · Hero (fundo do card) | `/media/hero.mp4` | ≤ 1.20 MB | 989.0 KB |
| A2 · Stat-card 1 | `/media/stats/stat-1.mp4` | ≤ 200.0 KB | 117.6 KB |
| A3 · Stat-card 2 | `/media/stats/stat-2.mp4` | ≤ 200.0 KB | 149.3 KB |
| A4 · Stat-card 3 | `/media/stats/stat-3.mp4` | ≤ 200.0 KB | 23.3 KB |
| A5 · Stat-card 4 | `/media/stats/stat-4.mp4` | ≤ 200.0 KB | 134.5 KB |
| A6 · Vídeo vertical (Automação) | `/media/phone.mp4` | ≤ 250.0 KB | 196.1 KB |
| P1 · Portfólio 1 | `/media/portfolio-1.mp4` | ≤ 1.00 MB | 609.8 KB |
| P2 · Portfólio 2 | `/media/portfolio-2.mp4` | ≤ 1.00 MB | 613.6 KB |
| P3 · Portfólio 3 | `/media/portfolio-3.mp4` | ≤ 1.00 MB | 630.0 KB |
| SR · Showreel (Hero) | `/media/showreel.mp4` | ≤ 1.50 MB | — (diferido) |

### Comandos prontos (2-pass, sem áudio, faststart)

Não-negociáveis em todo encode: `-an` (autoplay muted não precisa de faixa de áudio e ela
custa bytes + risco de autoplay no iOS) · `format=yuv420p` (o Safari recusa 4:2:2/4:4:4) ·
`-movflags +faststart` (moov no início, playback começa antes do download acabar) ·
`-g`/`-keyint_min` fixos com `-sc_threshold 0` (seek previsível e ponto de loop limpo).

```bash
# A1 · Hero (fundo do card) — alvo 1280×720, 10s, ~855 kbps → 1.02 MB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/hero.mp4
V="scale=1280:-2:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 10 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 855k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 10 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 855k -maxrate 1111k -bufsize 1710k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# A2 · Stat-card 1 — alvo 320×320, 4s, ~348 kbps → 170.0 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/stats/stat-1.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=320:320:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -maxrate 452k -bufsize 696k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# A3 · Stat-card 2 — alvo 320×320, 4s, ~348 kbps → 170.0 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/stats/stat-2.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=320:320:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -maxrate 452k -bufsize 696k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# A4 · Stat-card 3 — alvo 320×320, 4s, ~348 kbps → 170.0 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/stats/stat-3.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=320:320:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -maxrate 452k -bufsize 696k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# A5 · Stat-card 4 — alvo 320×320, 4s, ~348 kbps → 170.0 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/stats/stat-4.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=320:320:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 4 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 348k -maxrate 452k -bufsize 696k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# A6 · Vídeo vertical (Automação) — alvo 368×796, 6s, ~290 kbps → 212.5 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/phone.mp4
V="scale=368:796:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 6 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 290k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 6 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 290k -maxrate 377k -bufsize 580k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# P1 · Portfólio 1 — alvo 720×720, 8s, ~891 kbps → 870.4 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/portfolio-1.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=720:720:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 8 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 891k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 8 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 891k -maxrate 1158k -bufsize 1782k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# P2 · Portfólio 2 — alvo 720×720, 8s, ~891 kbps → 870.4 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/portfolio-2.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=720:720:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 8 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 891k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 8 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 891k -maxrate 1158k -bufsize 1782k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# P3 · Portfólio 3 — alvo 720×720, 8s, ~891 kbps → 870.4 KB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/portfolio-3.mp4
V="crop='min(iw,ih)':'min(iw,ih)',scale=720:720:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 8 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 891k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 8 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 891k -maxrate 1158k -bufsize 1782k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# SR · Showreel (Hero) — alvo 1280×720, 30s, ~356 kbps → 1.27 MB
IN=raw/seu-arquivo.mov ; SS=00:00:00 ; OUT=public/media/showreel.mp4
V="scale=1280:-2:flags=lanczos,fps=24,format=yuv420p"
ffmpeg -y -ss $SS -t 30 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 356k -pass 1 -passlogfile /tmp/p -f null -
ffmpeg -y -ss $SS -t 30 -i "$IN" -an -sn -dn -vf "$V" -c:v libx264 -profile:v high \
  -preset veryslow -b:v 356k -maxrate 462k -bufsize 712k \
  -pass 2 -passlogfile /tmp/p -g 48 -keyint_min 48 -sc_threshold 0 -movflags +faststart "$OUT"

# Poster de qualquer um deles — SEMPRE do .mp4 já codificado (poster ≡ frame 0)
ffmpeg -y -i public/media/hero.mp4 -frames:v 1 -q:v 2 /tmp/f.png
node scripts/import-ref-assets.mjs --only poster/hero   # sharp → webp no budget
node scripts/check-budgets.mjs                          # o gate
```

---

_Gerado por `node scripts/gen-report.mjs` a partir de `lib/third-party-assets.json`,
`content/home.pt-BR.json` e do estado real de `public/`. 33 campos `[CONFIRMAR]` · 25 assets declarados · 9/10 slots de vídeo preenchidos._
