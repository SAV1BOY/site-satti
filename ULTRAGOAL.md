# ULTRAGOAL — SITE SATTI v1 · BUILD COMPLETO (do zero ao deploy)

> **Para: Claude Code (Fable 5) — engenheiro-chefe.** Leia este documento inteiro antes do primeiro comando.
> **Diretório de trabalho:** `C:\Users\migue\Desktop\Projetos\SITE SATTI`
> **Braço direito:** Codex CLI (GPT 5.6 Sol) — auditor + gerador de imagens + engenheiro paralelo, acionado por você via CLI.
> **Decisor:** Miguel. Ele só é interrompido pelos casos do §9. Todo o resto é autonomia sua.

---

## §0 · MISSÃO E CONDIÇÃO DE TÉRMINO

Construir e deployar o site institucional da SATTI (sattiai.com): Next.js 16 + App Router, **espelho estrutural e coreográfico 1:1 do awsmd.com** com **pele, copy e assets 100% SATTI** ("Blueprint Industrial"), reproduzindo **pixel-perfect** as 30 telas aprovadas do handoff do Claude Design (S1–S11 + O1–O3, desktop 1920 / mobile 375, PT + espelho /en).

**Este goal só termina quando TODOS forem verdadeiros:**

1. Home completa (11 seções + 3 overlays), PT-BR default + `/en` espelho 1:1.
2. Fidelidade visual ao handoff verificada por auditoria do Codex (§7) em todos os breakpoints.
3. Form de contato funcionando (Server Action + Resend + webhook n8n), com os 4 estados de input do DS.
4. Todas as imagens estáticas geradas e dentro de budget; todos os slots de vídeo com poster + markup final (vídeos em si são deferidos — §8).
5. `npm run build` + `npx tsc --noEmit` + `npm run lint` verdes; Lighthouse mobile ≥ 90/95/95 (Perf/A11y/SEO).
6. Deploy de produção na Vercel ativo (URL `.vercel.app`), domínio `sattiai.com` adicionado no projeto Vercel, instruções de DNS impressas no relatório final.
7. `RELATORIO-FINAL.md` entregue no formato do §10, com a lista de `[CONFIRMAR]` pendentes do Miguel.

Não pare antes disso. Não pare depois disso.

---

## §1 · CADEIA DE COMANDO E AUTONOMIA

| Ator | Papel | Autoridade |
|---|---|---|
| **Fable (você, Claude Code)** | Engenheiro-chefe: arquitetura, animações-assinatura, seções complexas, integrações, deploy, orquestração do Codex | Decide tudo que este GOAL não fixa. Registra cada decisão em `DECISIONS.log.md` |
| **Codex (GPT 5.6 Sol)** | Auditor de todo gate (§7) · gerador de imagens (§5.B) · engenheiro paralelo nas tarefas de menor risco (W3-A', W6) | Executa tasks que você emite. Veredito de auditoria é PASS/FAIL por item — você corrige FAILs, mas divergência de interpretação quem arbitra é você + este GOAL |
| **Miguel** | Decisor | Só entra nos casos do §9 |

**Autonomia total:** criar repo, instalar dependências, commitar, abrir PRs, mergear, deployar, adicionar domínio na Vercel, configurar envs disponíveis. Você tem acesso às CLIs: `git` (SSH), `gh`, `vercel`, `codex`, `node/npm`, `ffmpeg`. **Supabase CLI existe mas a v1 NÃO usa banco — não criar projeto Supabase.** Nunca pergunte permissão para algo já autorizado neste GOAL.

**Arbitragem:** conflito técnico → decide este GOAL; omissão do GOAL → decide você (registre no log); **leis (§3) e decisões de gate (§4) nunca são reabertas** — nem por você, nem pelo Codex.

---

## §2 · FONTES DA VERDADE (ordem de precedência)

1. **Este ULTRAGOAL** (inclui as decisões de gate resolvidas — §4).
2. **Handoff Claude Design** — `SATTI_Design_System-handoff.zip` na raiz do diretório (ou já extraído). Conteúdo: `satti-design-system/project/` com as 30 telas `.dc.html`, a folha `SATTI DS.dc.html`, `Home EN Desktop 1920.dc.html`, o `CLAUDE.md` do DS e `outputs/design-md/satti/` (DESIGN.md + tokens.json extraídos). **É a verdade visual pixel-perfect** — leia o HTML/CSS na fonte, não renderize screenshot.
3. **Docs do repo:** `CLAUDE.md`, `AGENTS.md`, `docs/00-ORCHESTRATION.md` … `docs/08-ROADMAP.md`.
4. **Starter + conteúdo:** `starter/` (tokens.css, animations.css, Marquee, FillText, useTypewriter, WorkCard, LenisProvider) e `content/home.pt-BR.json` / `home.en.json`.
5. **awsmd.com** — apenas referência de estrutura/ritmo/técnica (teardown em `docs/04`). **Lei de IP (§3-L6) vale integralmente.**

Se handoff e docs divergirem em algo visual, **o handoff vence** (é posterior e aprovado em gate). Se divergirem em algo de engenharia (perf, a11y, arquitetura), **os docs vencem**. As correções do §4 vencem ambos.

---

## §3 · LEIS INEGOCIÁVEIS

- **L1 · Copy-law:** copy nunca é inventada. (1) existe oficial → literal; (2) sem versão final → `[CONFIRMAR]` com o rascunho do projeto em steel `#6E7480`; (3) jamais texto editorial do modelo passando por oficial. Vale para PT e EN. Depoimentos (S10): NUNCA inventar nome, cargo, foto ou citação.
- **L2 · Blaze-law:** `#FF4D00` é raro e caro — **máx. 1 elemento blaze de destaque por viewport/dobra**, sempre com texto `#15171B` (preto) sobre ele, nunca branco. Marcador-eyebrow 8×8 não conta. O pulso da Linha de Automação conta como o blaze da dobra em que estiver.
- **L3 · Circuit funcional:** `#2F6BFF` só em links, linhas de diagrama e focus ring. Nunca CTA, nunca decoração.
- **L4 · Budgets de mídia (PR rejeitado se falhar):** hero vídeo ≤ 1,2 MB · stat-cards ≤ 200 KB · phone ≤ 250 KB · portfólio ≤ 1 MB cada com `preload="none"` + play só no hover/in-view · imagens AVIF/WebP via `next/image` com `sizes` reais · fonts `subsets:["latin"]`. Load inicial da home ≤ 3 MB (sem vídeos lazy).
- **L5 · Reduced-motion:** toda animação dentro de `@media (prefers-reduced-motion: no-preference)` ou com fallback estático (marquee pausado, palavra fixa no typewriter, Linha 100% desenhada sem pulso, poster no lugar de vídeo). Estado reduced-motion = estado das comps do handoff.
- **L6 · IP:** proibido copiar do awsmd: textos, mídia, logos de clientes deles, fontes Freigeist/TT Commons, ID de analytics. Estrutura/ritmo/técnica sim; conteúdo, jamais.
- **L7 · Git:** SSH sempre (`git@github.com:SAV1BOY/site-satti.git`). Commits convencionais em PT-BR. Branches `cc/<task>` e `codex/<task>`; nunca o mesmo arquivo editado pelos dois na mesma fase; merge só com build verde.
- **L8 · Métricas reais ou nada:** todo número (stats S5, métricas S9) fica `[CONFIRMAR]` até o Miguel cravar.
- **L9 · Profundidade = hairline 1px `#E3E6EB` + tint + glow.** Sem drop-shadow em cards. Único brilho de cor do sistema: glow blaze blur(90px) opac. 0.8 dos work-cards.
- **L10 · Animação:** só `transform` e `opacity`; easing `cubic-bezier(0,0,.4,.97)`; scroll via rAF + `{passive:true}` / IntersectionObserver. As 11 assinaturas seguem `docs/05-ANIMATIONS.md` — implementar a partir delas, não reinventar.
- **L11 · Código:** TS strict, Server Components por padrão, `"use client"` só onde há estado/efeito; nunca passar objeto de hook com refs como prop (React 19/Compiler); `params`/`searchParams` são Promise no Next 16 — sempre `await`.
- **L12 · Tipografia:** Archivo (display, caps, tracking negativo), Inter (body), JetBrains Mono (eyebrows/tags/métricas, caps +0.08em). Exceção única do mono-caps: grafia oficial de marcas (n8n, Next.js, Supabase, Evolution API, Claude / GPT, Python, PostgreSQL, Vercel).

---

## §4 · DECISÕES DE GATE — RESOLVIDAS (aplicar como lei, não reabrir)

Estas são as 6 decisões do gate final de design + as decisões travadas nas fases F0–F5 do Claude Design. Estão **fechadas**:

**D1 — Tokens de linha no escuro.** Adicionar ao `tokens.css`: `--c-line-dark: #1E2127` (separadores/hairlines sobre graphite) e `--c-hairline-dark: #2A2D34` (bordas de card/célula sobre graphite). Aposentar os cinzas ad hoc `#2E333B` e `#3A3F47` das comps — mapear ambos para os 2 tokens novos (nodes/bordas → `--c-hairline-dark`). Nenhum hex literal no código: tudo `var(--c-*)`.

**D2 — S6 corrigida.** Título desktop e mobile: **"{AUTOMAÇÃO} INTELIGENTE \*\*"** com cedilha correta; chaves `{}` e `**` em **steel** nos dois breakpoints (nunca blaze — o blaze do viewport da S6 é o CTA "Ver portfólio" pill blaze; o segundo CTA é ghost hairline).

**D3 — Linha de Automação = fio contínuo (prioridade máxima de marca).** Não são réguas retas por seção. Implementar `components/ui/AutomationLine.tsx` + orquestrador `AutomationThread` com **contrato de continuidade**: a linha atravessa hero → serviços → automação → portfólio → contato como UM fio visualmente ininterrupto (eixo X de saída de cada seção = eixo X de entrada da seguinte; sem gaps, sem resets). Curvas e nodes (círculo + label mono) nos pontos de interesse, ecoando um workflow n8n. Técnica: SVG por segmento com handshake de coordenadas OU overlay costurado — você escolhe; o critério de aceite é o resultado visual de fio único. Desenho no scroll: `stroke-dasharray/offset` por progresso (IO + rAF). **Pulso: UM único dot blaze no site inteiro**, viajando via `offset-path`/`offset-distance` (nada de SMIL — as comps usam `animateMotion` só como aproximação de preview), atravessando as fronteiras de seção; nas seções onde o pulso está, ele é o blaze da dobra (L2). Reduced-motion: linha 100% desenhada, sem pulso. Stroke 1.5px `--c-line` no claro / `--c-line-dark` no escuro.

**D4 — S7 ≠ S9.** S7 Portfólio = grid de 6 work-cards (glow blaze no hover, vídeo só no hover). S9 CasesSlider = **3 cases curados com métrica antes→depois** (Swiper), eyebrow "04 — Cases em detalhe". Métricas ficam `[CONFIRMAR]` (L8). Sem busca na v1.

**D5 — Numeração canônica de seções (comps vencem os JSONs).** `01 — Serviços · 02 — Sobre · 03 — Portfólio · 04 — Cases em detalhe · 05 — Quem já trabalhou com a gente · 06 — Contato`. Menu O1 numera 01–06 igual. **Atualizar `content/home.pt-BR.json` e `home.en.json`** para esta numeração e para as strings exatas das comps aprovadas (EN = espelho traduzido com os MESMOS números; corrigir o "04 — What clients say" da comp EN para 05).

**D6 — S11 Footer completo.** Form nativo com os 5 campos (nome, e-mail, empresa opcional, mensagem, faixa de investimento opcional) e os 4 estados de input do DS (default/focus `#2F6BFF` ring/erro `#B43A2F`/sucesso `#15794B` — feedback só texto+borda+ícone). E-mail `contato@sattiai.com`. Copyright dinâmico: `© SATTI ${new Date().getFullYear()}. Todos os direitos reservados.` (resolve o `[CONFIRMAR ano]` para sempre). Mensagem de erro do form = a oficial do JSON ("Não foi possível enviar. Tente de novo ou escreva para contato@sattiai.com."). Parallax hat conforme `docs/05 §10`. Sociais: GitHub `SAV1BOY` oficial; LinkedIn/Instagram permanecem `[CONFIRMAR]` (ver política de modo em §6-W6).

**Decisões F0–F5 já travadas (manter):** ValuesStrip oficial = **Var A (paper)** com "resultado mensurável" em blaze — Var B (circuit) ARQUIVADA, não vai pro código. Header 2 estados: sobre o hero o CTA "Falar com a SATTI" é ghost/hairline; ao sair do hero (~80% da altura) o header ativa e o CTA preenche blaze (transição .4s `--ease`). Caret do typewriter = o elemento blaze do viewport do hero. Feedback tokens `--c-error #B43A2F` / `--c-success #15794B`. Tints S4: `#FFE9DE / #E4EBFF / #ECEEF2` (são tints, não acento — nenhum blaze estático na S4; o blaze da S4 é o pulso da Linha passando). O2 mobile = tela cheia. Dots do S9 mobile = blaze no ativo.

**Lei de tradução comp → código (obrigatória).** As `.dc.html` carregam andaime de revisão que NÃO entra no Next: `padding-right: 348px` das seções (existia só para a aside de specs) → usar o `--gutter` real; `min-height:100vh` por seção → só Hero, Banner e Footer são full-viewport, o resto flui; todo hex literal → `var(--c-*)`; asides "Specs", placeholders rotulados `[ A1 · … ]`, `data-screen-label`, badges "motion on/off" → descartar; SMIL `animateMotion` → `offset-path`/rAF (D3). Recriar o visual, não portar o DOM do protótipo.

---

## §5 · PROTOCOLO DE DELEGAÇÃO — VOCÊ ⇄ CODEX (CLI)

### A) Formato de invocação

Toda task para o Codex vive em arquivo (`tasks/codex/W<k>-<slug>.md`) — auditável e reexecutável. Invocação padrão (adapte flags à instalação local; verifique com `codex --help`):

```bash
codex exec --full-auto --cd "C:\Users\migue\Desktop\Projetos\SITE SATTI" "$(cat tasks/codex/W3A-values.md)"
```

Formato do arquivo de task:

```
[CODEX] W<k>.<n> — <título>
Papel: engenheiro paralelo | auditor | gerador de imagens
Objetivo: ...
Arquivos a tocar (EXCLUSIVOS SEUS nesta fase): ...
Arquivos PROIBIDOS (área do CC nesta fase): ...
Spec: ULTRAGOAL §<x> · docs/<arquivo> §<seção> · handoff <tela>.dc.html
Branch: codex/<slug>
Aceite: [ ] build verde [ ] tsc verde [ ] reduced-motion [ ] budget [ ] ...
Saída: PR + resumo em audits/W<k>-codex-report.md
```

### B) Pipeline de imagens (Codex + GPT Image)

Você cria `scripts/gen-image.mjs` (Node): recebe `--prompt`, `--size`, `--out`; chama a API de imagens da OpenAI (modelo de imagem configurado no ambiente — gpt-image / Image 2) com `OPENAI_API_KEY` do ambiente; salva PNG; pós-processa com `sharp` → WebP dentro do budget; grava no path de destino EXATO. Você também cria `scripts/check-budgets.mjs` (falha se qualquer asset estourar a tabela do `docs/06 §1`).

O Codex executa a geração (task W5) com os prompts do `docs/06 §§2–6` **adaptados à paleta travada** (paper `#F7F8FA`, graphite, blaze `#FF4D00`, circuit `#2F6BFF`). **Fallback sem chave/sem API:** placeholders blueprint do DS (fundo `#ECEEF2`, grade 1px, cruz central, rótulo mono `[ A1 · 16:9 ]`) nas dimensões finais — nunca bloquear o build por asset.

**Escopo de imagem da v1 (estáticos):**
- A7 ×3 — cards de serviço 4:5 → `public/img/services/{agents,products,data}.webp` (≤180 KB cada)
- A8 ×2 — texturas do banner 1:1 → `public/img/texture-{1,2}.webp` (≤120 KB)
- Posters A1–A6 — 1º frame de cada vídeo futuro (mesmos prompts de imagem do docs/06) → `public/media/*-poster.webp` nos paths do MANIFEST (o site nasce "completo" visualmente antes dos vídeos)
- A9 — placeholder blueprint (foto real do Miguel entra depois)
- Portfólio P1–P3 + screenshots — **REAIS, nunca gerados** (L6/credibilidade): placeholders blueprint até o Miguel gravar
- `og-image` 1200×630 — via código (`opengraph-image.tsx`), identidade Blueprint, não via GPT

### C) Auditoria (papel principal do Codex)

Ao fim de CADA workflow W1–W8 você emite a task de auditoria; o Codex devolve `audits/W<k>-verdict.md` com **PASS/FAIL por item do checklist §7** + evidência (arquivo:linha, medida, screenshot de build se aplicável). FAIL → você corrige → re-audita **só os itens FAIL**. Um workflow só fecha com veredito 100% PASS. Loop HRM em tudo: **PLANEJAR → EXECUTAR → JULGAR (§7) → CORRIGIR → PASS → avançar.**

---

## §6 · WORKFLOWS (W0 → W8)

> Aceite global de todo W: build + tsc + lint verdes · reduced-motion ok · budgets ok · veredito Codex PASS.

### W0 · Bootstrap (CC) — dia 1
1. Inventariar o diretório; extrair o handoff para `design/satti-design-system/` (commitado, read-only de referência); mover specs para `docs/`, starter para os lugares do `CLAUDE.md §4`.
2. `npx create-next-app@latest . --typescript --tailwind --eslint --app` · `npm i lenis swiper next-intl resend zod` (+ dev: `sharp`).
3. `git init` → remote SSH `git@github.com:SAV1BOY/site-satti.git` (criar com `gh repo create SAV1BOY/site-satti --private` se não existir).
4. Tokens: `app/styles/tokens.css` a partir do starter **+ D1** (`--c-line-dark`, `--c-hairline-dark`) + feedback tokens + tints S4. `animations.css` importado no layout.
5. `vercel link` → primeiro deploy preview no ar no dia 1.
**Aceite:** preview Vercel renderizando página com tokens; repo no GitHub.

### W1 · Fundação (CC | Codex: i18n)
CC: `next/font/google` (Archivo variable, Inter, JetBrains Mono, `subsets:["latin"]`), `LenisProvider`, `CursorProvider` (dot 8px + anel 36px, lerp, estados `data-cursor`, off em touch/reduced-motion), layout base + container 1440/gutter, `.eyebrow`, `.section-dark`.
Codex: `next-intl` (pt-BR default sem prefixo, `/en`), JSONs carregando, **chaves espelhadas + numeração D5 aplicada nos dois JSONs**.
**Aceite:** scroll suave; texto vindo do JSON nos 2 idiomas; eyebrows 01–06 corretos.

### W2 · Núcleo UI (CC)
Marquee (CSS-only, cópia `aria-hidden`) · useTypewriter · FillText (clip-path por progresso) · Button "roll" (texto duplicado + círculo/seta, `cubic-bezier(0.76,0,0.24,1)` 450ms conforme DS) · PulseCircle (3 anéis 100/68/42%, 10 nodes mono, linhas circuit, pulso 2s alternate delay .15s×i — discreto) · WorkCard (glow blur 90 + vídeo hover) · **AutomationLine/AutomationThread (D3 — a peça mais importante do W2)**.
Playground temporário `/dev/ui` (remover no W8).
**Aceite:** todos os utilitários no playground; AutomationLine demonstrando 2 segmentos costurados + pulso único cruzando a fronteira.

### W3 · Seções — duas ondas paralelas
**Onda A (CC):** S1+S2 Hero (vídeo bg com poster A1, H1 3 linhas + typewriter VENDER·ATENDER·OPERAR·CRESCER, caret blaze, scroll cue; badge só se houver prova real — senão modo-final omite) · S4 Serviços (3 cards ~604×653 sobrepostos, tints, tags grafia oficial, imagem scale 1→1.2 4s alternate) · S6 Automação (dark, D2 aplicada, phones float 6s ±3s, mosaico 3×4 com coluna central, Linha com pulso) · S7 Portfólio (6 work-cards, 5 nomes reais: CallAudit · Expediting Tracker · Portal Comercial · Funil quiz · Pipeline de reels LS Interbank; 6º `[CONFIRMAR]`).
**Onda A' (Codex, mesmos dias, arquivos disjuntos):** StickyHeader (2 estados, hambúrguer→O1) · S3 ValuesStrip Var A · S5 Sobre (fill-text 3 statements, 4 stat-cards mono gigante `[CONFIRMAR]` + slot de vídeo no canto, diagrama PulseCircle, marquee de logos placeholder `[SOMENTE com autorização]`) · S8 Banner (statement `[CONFIRMAR]` com rascunho em steel + 2 texturas A8 inline) · S9 CasesSlider (D4) · S10 Depoimentos (`[CONFIRMAR]` literal, aspas SVG, prev/next) · S11 Footer estático (D6, sem action ainda).
**Aceite:** home completa navegável com placeholders; ritmo claro/escuro do Atlas preservado (S6 dark → S7 claro → S8 dark); Linha contínua atravessando as 5 zonas.

### W4 · Overlays + Form (CC | Codex: a11y pass)
O1 menu fullscreen graphite (nav numerada 01–06, e-mail, sociais, tagline) · O2 painel lateral direito com blur (mobile = tela cheia) · O3 seletor PT→EN. Server Action `submitBrief`: Zod → Resend (`CONTACT_FROM_EMAIL`→`CONTACT_TO_EMAIL`) → POST `N8N_LEAD_WEBHOOK_URL` (n8n → Evolution API → WhatsApp do Miguel) → estados de toast; honeypot + rate-limit simples por IP. **Env ausente ≠ bloqueio:** degradar com log claro + item no relatório final.
Codex: passe de a11y (foco visível circuit, alts reais, hierarquia de headings, contraste AA, um `<h1>`).
**Aceite:** form envia (ou degrada graciosamente) com os 4 estados; overlays pixel-fiéis; teclado navega tudo.

### W5 · Imagens (Codex executa · CC revisa)
Gerar o escopo do §5.B via `scripts/gen-image.mjs`, comprimir, validar com `check-budgets.mjs`, colocar nos paths exatos do `MANIFEST.md`, atualizar os JSONs. Todo `<video>` já nasce com markup final (`muted playsInline loop autoplay` p/ A1–A6, `preload="none"` + hover p/ portfólio) apontando para o path definitivo + poster — **quando o Miguel soltar o .mp4 no path, zero mudança de código** (§8).
**Aceite:** zero placeholder cinza nas imagens estáticas; budgets 100%; `data-asset` em cada slot de vídeo.

### W6 · Conteúdo final + modo de publicação (Codex | CC revisa)
Sincronizar PT↔EN (mesmas chaves, numeração D5, strings das comps). Implementar `NEXT_PUBLIC_CONTENT_MODE`:
- **`draft` (default nos previews):** `[CONFIRMAR]` visíveis em steel — é o modo de revisão do Miguel.
- **`final` (produção com domínio):** elemento sem copy oficial é **omitido com elegância** — badge do hero some, stats S5 só renderizam valores confirmados, métricas S9 idem, S10 não renderiza sem depoimento real, sociais mostram só GitHub. Nada de "[CONFIRMAR]" público.
**Aceite:** flip de um env muda o comportamento; EN é espelho fiel; grep por texto inventado = zero.

### W7 · Perf / SEO / A11y (CC | Codex: QA final)
JSON-LD `Organization` · `opengraph-image.tsx` + OG/Twitter completos · `sitemap.ts` + `robots.ts` + `manifest.ts` · `hreflang` pt-BR/en · headers de segurança no `next.config.ts` (HSTS preload, nosniff, Referrer-Policy, Permissions-Policy, CSP frame-ancestors 'none') · Vercel Analytics · remover `/dev/ui`. Codex roda Lighthouse (mobile) e devolve números.
**Aceite:** ≥ 90/95/95 · load inicial ≤ 3 MB · headers presentes no response real do preview.

### W8 · Deploy final + relatório (CC)
`vercel --prod` → smoke test na URL de produção (200, form, /en, overlays, reduced-motion via emulação). `vercel domains add sattiai.com` + `www.sattiai.com` (www → redirect apex). Imprimir no relatório os registros DNS exatos (Cloudflare, **DNS only/nuvem cinza**): apex `A 76.76.21.21`, `www CNAME cname.vercel-dns.com` — apontar é o único passo manual do Miguel. Gerar `RELATORIO-FINAL.md` (§10). Tag `v1.0.0`.

---

## §7 · CHECKLIST DE AUDITORIA (o Codex julga TODO gate por isto — PASS = 100%)

1. **Fidelidade ao handoff:** layout, proporções, spacing (8/12/16/24/48/88/120), radius (12 funcional / 28 editorial / pill), tipografia (tabela do DESIGN.md) batem com a `.dc.html` correspondente em 1920 e 375.
2. **Paleta exata:** só tokens; zero hex literal em componente; dark = `#0F1115`; hairlines dark = D1.
3. **Blaze-law (L2)** por viewport em cada breakpoint — contar de verdade.
4. **Circuit só funcional (L3).**
5. **Copy-law (L1):** diff contra JSONs oficiais + strings das comps; nenhum texto inventado; `[CONFIRMAR]` em steel no modo draft.
6. **Motion:** 11 assinaturas conforme `docs/05`; só transform/opacity; `--ease`; reduced-motion cobre tudo.
7. **Linha de Automação (D3):** continuidade visual sem gaps entre as 5 zonas; pulso único; offset-path (não SMIL).
8. **Budgets (L4)** via `check-budgets.mjs` + tamanho do load inicial.
9. **A11y:** foco visível, alts descritivos, headings sem pulo, AA, alvos ≥44px, `data-lenis-prevent` onde há scroll interno.
10. **Código:** L11; sem `any` gratuito; Server Components por padrão; build/tsc/lint verdes.
11. **SEO/segurança (W7+):** JSON-LD, og:image, sitemap, robots, hreflang, headers.
12. **i18n:** chaves espelhadas; /en 1:1; numeração D5 nos dois idiomas.

---

## §8 · VÍDEOS (DEFERIDOS) — CONTRATO DE INTEGRAÇÃO

O Miguel gera depois (GPT→VEO→ffmpeg, `docs/06`) e grava os reais do portfólio. O código **nunca bloqueia em vídeo**. Contrato: cada slot já deployado com poster + markup final + path definitivo do MANIFEST (`public/media/hero.mp4`, `stats/*.mp4`, `phone.mp4`, `portfolio-{1,2,3}.mp4`). Quando o arquivo aparecer no path (novo commit), o vídeo simplesmente passa a tocar. Deixar no relatório final a tabela "onde soltar cada arquivo" + os comandos ffmpeg de compressão prontos.

---

## §9 · ÚNICAS PARADAS PERMITIDAS (interromper o Miguel)

1. **Nunca por env ausente** (Resend, n8n, OPENAI_API_KEY): degradar + listar no relatório.
2. **Nunca por `[CONFIRMAR]`**: o modo draft/final (W6) resolve; listar no relatório.
3. **DNS Cloudflare:** passo manual dele — só instruir.
4. **Pare somente se:** (a) alguma CLI essencial não autentica de jeito nenhum (git/vercel) após 3 tentativas com abordagens diferentes; (b) uma lei do §3 tornar impossível cumprir uma decisão do §4 (conflito real — descreva e proponha 2 saídas); (c) risco de perda de dados.

---

## §10 · DEFINITION OF DONE + RELATÓRIO FINAL

DoD = os 7 itens do §0. `RELATORIO-FINAL.md` contém:
1. URLs (produção Vercel + preview) e status do domínio na Vercel.
2. **Instruções DNS Cloudflare** (registros exatos, nuvem cinza).
3. Tabela de `[CONFIRMAR]` pendentes (badge hero, 4 stats, 6º case, statement S8, métricas S9, depoimentos S10, handles sociais, logos autorizadas) — o que destrava o modo `final`.
4. Tabela de vídeos a entregar (§8) + comandos ffmpeg.
5. Envs configuradas × faltantes (com o efeito de cada falta).
6. Números finais: Lighthouse, peso do load, contagem de auditorias PASS.
7. `DECISIONS.log.md` anexado (toda decisão que você tomou por omissão do GOAL).

---

## APÊNDICE A · Comandos de referência

```bash
# Codex — task paralela
codex exec --full-auto --cd "C:\Users\migue\Desktop\Projetos\SITE SATTI" "$(cat tasks/codex/W5-images.md)"
# Codex — auditoria de gate
codex exec --full-auto "$(cat tasks/codex/audit-W3.md)"   # devolve audits/W3-verdict.md
# Imagens
node scripts/gen-image.mjs --prompt-file prompts/A7-agents.txt --size 1200x1500 --out public/img/services/agents.webp --budget 180
node scripts/check-budgets.mjs
# Deploy
vercel link && vercel && vercel --prod
vercel domains add sattiai.com && vercel domains add www.sattiai.com
```
(Shell: exemplos em bash — no Windows, rodar via Git Bash ou adaptar a PowerShell. Flags do `codex` podem variar por versão: confirme com `codex --help` e mantenha o equivalente de aprovação automática + working dir.)

## APÊNDICE B · Env vars

| Var | Uso | Sem ela |
|---|---|---|
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | e-mail do form | form loga + só n8n (ou toast de erro elegante) |
| `N8N_LEAD_WEBHOOK_URL` | WhatsApp via Evolution | só e-mail |
| `OPENAI_API_KEY` | geração de imagens (Codex) | placeholders blueprint |
| `NEXT_PUBLIC_CONTENT_MODE` | `draft` \| `final` | default `draft` |

## APÊNDICE C · Mapa handoff → build

| Comp (.dc.html) | Componente(s) |
|---|---|
| S1+S2 Hero | `sections/Hero` + StickyHeader (estado topo) |
| S3 Var A | `sections/ValuesStrip` (Var B: não portar) |
| S4/S5 | `sections/Services`, `sections/About` (+PulseCircle) |
| S6 | `sections/Automation` (+AutomationLine, phones, mosaico) |
| S7/S8 | `sections/Portfolio` (WorkCard) · `sections/Banner` |
| S9/S10/S11 | `sections/CasesSlider` · `sections/Reviews` · `sections/Footer` (+form) |
| O1/O2/O3 | `overlays/Menu` · `overlays/Contact` · `overlays/Language` |
| SATTI DS + outputs/design-md | `tokens.css` + conferência de tipografia/componentes |
| Home EN 1920 | validação do espelho `/en` |

---

**Início imediato: W0.1 — inventário do diretório e extração do handoff. Vá.**
