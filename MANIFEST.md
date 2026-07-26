# MANIFEST v2 — contrato de assets de mídia

> Contrato §8 do ULTRAGOAL + revisão do **ULTRAGOAL v2** (paridade estrutural).
> Paths definitivos. O markup de cada slot nasce final apontando para o path + poster;
> quando o arquivo aparecer no path (novo commit), ele passa a tocar/renderizar **sem
> mudança de código**.
>
> **Dimensões:** a coluna "render" é o tamanho em CSS a 1920 px (medido do modelo, ver
> `design/awsmd-ref/awsmd-geometry.json`); a coluna "arquivo" é `render × 2` para retina.
> O v1 tinha dimensões que não correspondiam ao render real (serviços declarados 1200×1500
> para um slot de 604×653; portfólio 1280×800 para cards de 720 px de altura; o mosaico de
> 12 telas não existia no manifesto) — corrigido aqui.
>
> **Coluna `3P`:** asset de terceiro (V2-D2). `sim` = entra em preview marcado e é
> omitido/substituído em `NEXT_PUBLIC_CONTENT_MODE=final`; `não` = original SATTI ou
> placeholder blueprint. `scripts/check-thirdparty.mjs` falha o build se um asset `3P`
> puder ser servido em `final`. Dois grupos ficam fora **até em preview** (DEC-017):
> avatares de depoimento e selos de plataforma de review.

---

## 1 · Vídeo

| Slot | Path | Poster | render | budget | 3P | Origem |
|---|---|---|---|---|---|---|
| A1 · Hero (fundo do card) | `public/media/hero.mp4` | `public/media/hero-poster.webp` | 1896×1056 | ≤ 1,2 MB | sim | 988 KB — cabe sem re-encode |
| A2–A5 · Stat-cards (Sobre) | `public/media/stats/stat-{1..4}.mp4` | `public/media/stats/stat-{1..4}-poster.webp` | 150×150 | ≤ 200 KB cada | sim | 29–153 KB — cabem sem re-encode |
| A6 · Vídeo vertical (Automação) | `public/media/phone.mp4` | `public/media/phone-poster.webp` | 348×741 | ≤ 250 KB | sim | 203 KB — cabe sem re-encode |
| P1–P3 · Portfólio | `public/media/portfolio-{1,2,3}.mp4` | `public/media/portfolio-{1,2,3}-poster.webp` | ~700×720 | ≤ 1 MB cada | sim | 5,97 / 3,14 / 1,29 MB — **re-encode obrigatório** |
| SR · Showreel (Hero) | `public/media/showreel.mp4` | `public/media/showreel-poster.webp` | 405×230 | ≤ 1,5 MB | não | **DEFERIDO** — o Miguel grava. Sem o arquivo, `final` omite o player |

**Markup por classe de slot:**
- A1, A2–A5, A6 → `muted playsInline loop autoplay` + `poster` + `data-asset`
- P1–P3 → `preload="none"` + `poster` + `data-asset`, `src` atribuído no primeiro play; play/pause por **IntersectionObserver `threshold 0.35`** (DEC-018c — não é hover)
- SR → `preload="none"`, play sob clique no botão de 88 px; selo de 156 px girando 10 s

**Posters de vídeo.** Regra: **o poster é extraído do `.mp4` JÁ CODIFICADO**, nunca do arquivo de origem — assim `poster ≡ frame 0` e não existe o "pop" visual no instante em que o vídeo começa a tocar.

| Poster | arquivo | budget |
|---|---|---|
| `media/hero-poster.webp` | 1600×900 | ≤ 120 KB |
| `media/stats/stat-{1..4}-poster.webp` | 320×320 | ≤ 24 KB cada |
| `media/phone-poster.webp` | 384×832 | ≤ 40 KB |
| `media/showreel-poster.webp` | 810×460 | ≤ 120 KB |

Os posters de P1–P3 **não têm entrada própria**: o slot visual é o mesmo de `img/portfolio/shot-{1,2,3}.webp` (o `CasesSlider` já consumia exatamente esses 3 arquivos para os mesmos 3 cases). Slots unificados — 3 assets e 3 linhas de budget a menos.

Dimensões enxugadas em relação ao v1, que superdimensionava: stat poster era 640×640/≤100 KB para um slot de 150 px (2,1× maior que o necessário); phone poster era 750×1500 para um slot de 112 px (6,7×); hero poster era 1920×1080/≤200 KB, e cortar para 1600×900/≤120 KB tira ~80 KB do **elemento de LCP**.

---

## 2 · Imagens por seção

### Serviços (S4) — card preenchido por imagem, texto claro por cima (DEC-018b)

| Asset | Path | render | arquivo | budget | 3P |
|---|---|---|---|---|---|
| A7a · Agentes de IA & Automações | `public/img/services/agents.webp` | 604×653 | 1208×1306 | ≤ 180 KB | sim |
| A7b · Produtos Web & SaaS | `public/img/services/products.webp` | 604×653 | 1208×1306 | ≤ 180 KB | sim |
| A7c · Dados & Integrações | `public/img/services/data.webp` | 604×653 | 1208×1306 | ≤ 180 KB | sim |

O tint da SATTI (`--tint-blaze` / `--tint-blue` / `--tint-slate`) fica como underlay atrás da imagem — a paleta por card sobrevive à troca de composição. Alpha **preservado** na conversão (cada card tem o seu tint por baixo, então não pode haver `flatten`).

⚠️ A fonte de `data.webp` (`web-dev.png`) tem só **534×544** — metade da resolução das outras duas (1068×1142). Chegar a 1208×1306 exige upscale de 1,91× com `lanczos3` + `sharpen`; espere suavidade visível em DPR2 nesse card específico. É o primeiro dos três a substituir por asset SATTI real.

### Automação (S6) — a seção mais longa (3.758 px)

| Asset | Path | render | arquivo | budget | 3P |
|---|---|---|---|---|---|
| PH-L · Phone esquerdo | `public/img/automation/phone-left.webp` | 337×550 | 674×1100 | ≤ 250 KB | sim |
| PH-R · Phone direito | `public/img/automation/phone-right.webp` | 378×618 | 756×1236 | ≤ 250 KB | sim |
| A9 · Recorte da mão (alpha) | `public/img/automation/hand.webp` | 1870 largura | 1920×1241 | ≤ 400 KB | sim |
| SC01–SC12 · Mosaico | `public/img/automation/screen-{01..12}.webp` | 365×770 | 730×1540 | ≤ 120 KB cada | sim |

A mão **precisa** de canal alpha (`sharp … .webp({ alphaQuality })`) — ela é sobreposta ao vídeo central e o recorte é o efeito. `pointer-events: none` no wrapper para não interceptar hovers do mosaico. A fonte tem 2880×1862 (mais folga do que o render de 1870 px pede), então a conversão é downscale — sem perda.

7 das 12 telas do mosaico têm alpha; a célula é graphite, então a conversão faz `flatten({ background: "#0F1115" })` antes do resize.

### Portfólio (S7) — 6 cards de 720 px, 2 colunas com stagger

| Asset | Path | render | arquivo | budget | 3P |
|---|---|---|---|---|---|
| P1–P3 · Cards com vídeo (poster) | `public/img/portfolio/shot-{1,2,3}.webp` | ~700×720 | 1400×1440 | ≤ 250 KB cada | sim |
| P4–P6 · Cards só imagem | `public/img/portfolio/shot-{4,5,6}.webp` | ~700×720 | 1400×1440 | ≤ 250 KB cada | sim |

### Banner (S8) — texturas **inline no fluxo do texto**

| Asset | Path | render | arquivo | budget | 3P |
|---|---|---|---|---|---|
| A8 ×2 · Texturas | `public/img/texture-{1,2}.webp` | 215×81 | 476×180 | ≤ 40 KB cada | sim |

O v1 declarava 900×900 / ≤120 KB — errado por uma ordem de grandeza: o slot real é uma "palavra visual" de 215×81 com `width: 2.46875em` e `border-radius: .4583em`.

### Cases (S9)

| Asset | Path | render | arquivo | budget | 3P |
|---|---|---|---|---|---|
| C1–C3 · Thumbs | `public/img/cases/thumb-{1,2,3}.webp` | 372×240 | 744×480 | ≤ 120 KB cada | sim |

### Depoimentos (S10)

| Asset | Path | render | arquivo | budget | 3P |
|---|---|---|---|---|---|
| RV1–RV4 · Avatares | `public/img/reviews/avatar-{1..4}.webp` | 78×78 | 156×156 | ≤ 20 KB cada | **não** |

**Placeholder blueprint até haver depoimento autorizado.** Os avatares do modelo são pessoas reais identificáveis e não entram nem em preview (DEC-017). Em `final` a S10 inteira continua omitida (DEC-012) enquanto não houver depoimento real.

### Marca e UI

| Asset | Path | arquivo | budget | 3P | Origem |
|---|---|---|---|---|---|
| Favicon | `app/favicon.ico` | 32×32 + 16×16 | ≤ 15 KB | não | `Site/BRANDING/logo-factory/out/F4_system_gold/*_favicon.png` |
| Ícone PWA | `app/icon.svg` | vetor | ≤ 8 KB | não | `out/F1_TE/*.svg` |
| Apple touch | `app/apple-icon.png` | 180×180 | ≤ 20 KB | não | `out/F4_system_gold/` |
| Ícone PWA 192/512 | `public/icon-{192,512}.png` | 192² / 512² | ≤ 8 / 24 KB | não | mesmo SVG |
| OG image | via código `app/[locale]/opengraph-image.tsx` | 1200×630 | — | não | já existe |

**Fonte da marca:** `Site/BRANDING/logo-factory/out/F1_TE/F1_TEv17.svg` (1.030 B, `viewBox 0 0 1024 1024`). Escolhido entre os 20 variantes F1_TE porque (a) é o **único com render de 32 px validado** em `_qa/F1_TEv17_32px.png`, e legibilidade em favicon é o critério que decide; (b) margens 222/222/222/222 = **21,7 % de padding em todos os lados**, o que satisfaz a safe zone de ícone maskable do Android sem re-arte; (c) cobertura de blaze 0,0521, a mais próxima da faixa da blaze-law (v18/v19 têm 0,0000, v06 tem 0,1146). A composição usa exatamente os tokens do DS: tile iron, dois polígonos paper formando o S partido, três polígonos blaze (dois ganchos + nó hexagonal central) e um corte iron de 24,11 px no hexágono.

**Não vira arquivo:**
- **Marca no header/rodapé/menu** → componente `components/ui/SattiMark.tsx` com os polígonos inline, `fill="currentColor"` nos paper e `var(--c-blaze)` nos blaze. Zero request, zero CLS, e o mesmo componente serve iron no header claro e paper no rodapé escuro — o problema de "duas variantes de logo" desaparece em vez de custar dois arquivos.
- **Selo click-to-play** → SVG inline first-party (texto em JetBrains Mono sobre path circular + ponto blaze, ~700 B).
- **Setas e ícone de play** → `<path>` inline; a SATTI já renderiza setas como glifo `→`.
- **`app/favicon.ico`** (25,9 KB de resíduo do create-next-app) → **apagar**: `app/icon.svg` + `app/icon.png` cobrem todo browser atual e o Next emite os links sozinho.
- **`img/founder.webp`** → **apagado**. Nenhuma das duas comps S5 tem o slot A9 e o arquivo não era referenciado por componente nenhum (`About.tsx:38` documenta a ausência). Era asset órfão.

**Ganho colateral:** `Site/BRANDING/logo-factory/assets/fonts/Archivo-Variable.ttf` fecha o defeito aceito em `opengraph-image.tsx:37` (`fontFamily: "sans-serif"` porque "Archivo não embarca no edge sem fetch externo"). A rota de OG é gerada no build, onde `fs` existe — a fonte entra em `assets/fonts/` (fora de `public/`, nunca servida) e o card social passa a sair com a tipografia certa a custo zero para o cliente.

---

## 3 · Logos de cliente (marquee da S5)

**Nenhum logo de terceiro entra**, em nenhum modo (L6 permanece integral neste ponto). O marquee renderiza as células com hairline (`288×202`, `border: 1px var(--c-line)`, `border-left: none` na adjacente) e a legenda `about.logosNotice` = `[SOMENTE com autorização]`. Logos reais (System Digital, LS Interbank, Quick Soft) entram só com autorização por escrito de cada uma.

---

## 4 · Regras

1. Todo slot de vídeo leva `data-asset="<path>"`.
2. Todo asset com `3P = sim` leva `data-third-party="<id>"` no elemento renderizado e uma entrada em `public/assets-manifest.json`.
3. `node scripts/check-budgets.mjs` falha o build se qualquer asset **existente** estourar o budget. Arquivo ausente = deferido (`—`), não é falha.
4. `node scripts/check-thirdparty.mjs --mode final` falha se qualquer asset `3P` puder ser servido em `final`.
5. **Load inicial da home ≤ 3 MB** sem vídeos lazy (L4) **e Lighthouse mobile Perf ≥ 90**.

   O `hero.mp4` de 1,2 MB é a maior ameaça isolada: o Lighthouse mobile simula ~1,6 Mbps ≈ 200 KB/s, então 1,2 MB = **6 s de link saturado** — e o LCP já era 3,0 s no v1 com 4 KiB de imagem. Por isso o hero vídeo é **gated a `(min-width: 768px)`** e leva `preload="none"`; no mobile só o poster carrega.

   | cenário | acima da dobra |
   |---|---|
   | mobile 375 DPR2 | bundle ~377 KiB + `hero-poster` a 750w AVIF ~28 KB = **≈ 405 KiB** |
   | desktop 1920 DPR1 | bundle ~377 KiB + `hero-poster` a 1600w ~95 KB + `hero.mp4` 1,07 MB = **≈ 1,51 MB** |

   Folga para o teto de 3 MB: 2,6 MB no mobile. O scroll completo com tudo disparado é ≈4,5 MB — não é número de load inicial (o Lighthouse não rola a página), mas é o custo real de um visitante e é o que os `preload="none"` + IO existem para diluir.

6. `next/image` com `sizes` reais em todo raster; `priority` **apenas** no `hero-poster`. Nada de `sizes="100vw"` por inércia.
7. `preload="none"` em **todo** `<video>`; os de stat-card e phone montam por IntersectionObserver, não na hidratação (hoje os 4 stat-cards existem no DOM desde o SSR, 4 conexões especulativas muito abaixo da dobra).
8. `content-visibility: auto` na S4 e na S6 — a S4 anima 3 imagens de 1020 px em `scale(1)→1.2` para sempre (grátis com placeholder de 5 KB, overdraw contínuo de GPU com render real), e a S6 tem 12 imagens + a mão num único passo de scroll.
7. Conversão sempre via `sharp` (WebP), nunca commitar PNG/JPG de origem em `public/`.
8. `Site/` permanece fora do git — é material de referência, não fonte do build (DEC-016).
