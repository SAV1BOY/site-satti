# GOAL — CLAUDE IN CHROME · CLAUDE DESIGN: SITE SATTI (sattiai.com)

> **Agente:** Claude in Chrome operando o **Claude Design** (modelo **Fable**).
> **Decisor:** Miguel (revisa e aprova cada fase). **Orquestrador:** Claude chat.
> Este goal é AUTOCONTIDO: tudo o que você precisa está aqui. Não invente fora dele.

---

## 0 · MISSÃO

Criar no Claude Design o **design completo do site da SATTI**: primeiro o **Design System** (Fase 0), depois **cada página, estado e subpágina** (Fases 1–5), tela a tela, em desktop 1920 e mobile 375. A coreografia, as proporções e o ritmo vêm de um estudo formal de referência (o "Atlas", resumido na §4 — medidas reais, pixel a pixel); a **pele é 100% SATTI** (paleta, tipografia, conteúdo e metáforas próprias). Toda mídia é **placeholder técnico especificado** (§3): o decisor substituirá por imagens/vídeos próprios depois — desenhe os slots com as dimensões exatas e rótulos, nunca com conteúdo final inventado.

**Sentimento-alvo de cada tela:** precisão de engenharia que pulsa — confiança pela sobriedade (paper/grafite), energia pelo acento raro (blaze), racionalidade no detalhe (hairlines, mono, azul só funcional).

---

## 1 · DNA SATTI (lei visual — copie como tokens do projeto no Claude Design)

**Marca:** SATTI — estúdio de IA & automação (Nova Lima/MG). Posicionamento: "Construímos máquinas digitais que trabalham por você". Engenharia pragmática, números reais, zero hype. Públicos: decisor PME BR (confiança rápida) + técnico internacional.

**Paleta (exata, sem variações):**

| Token | Hex | Papel |
|---|---|---|
| `--c-paper` | `#F7F8FA` | fundo base (papel técnico frio) |
| `--c-iron` | `#15171B` | texto principal / ink |
| `--c-graphite` | `#0F1115` | fundo das seções dark (Automação, Banner) |
| `--c-steel` | `#6E7480` | texto secundário, eyebrows |
| `--c-blaze` | `#FF4D00` | **acento primário — RARO: máx. 1 elemento por viewport** (CTA, pulso, hover, destaque) |
| `--c-circuit` | `#2F6BFF` | **somente funcional**: links, linhas de diagrama, dados, focus ring — nunca decorativo dominante |
| `--c-blaze-soft` | `#FFE9DE` | tint de fundo p/ cards/hover |
| `--c-line` | `#E3E6EB` | hairlines, bordas, grades técnicas |
| `--c-ink-on-dark` | `#F4F5F7` | texto sobre graphite |

Regras de cor: 60% paper/neutros · 30% iron/graphite · 10% blaze. Blaze SEMPRE com texto preto sobre ele (WCAG AA). Steel sobre paper só ≥16px (abaixo, usar iron). Proibido: roxo/lilás, gradientes "IA mágica", sparkles ✨, cérebros, hexágonos decorativos, verde-neon.

**Tipografia:** Display = **Archivo** (caixa alta no hero, width condensed ~80%; títulos de seção width 100–110%) · Body/UI = **Inter** · Técnica = **JetBrains Mono** (eyebrows numerados `01 — Serviços`, tags de tecnologia, métricas, labels de diagrama; uppercase, tracking +0.08em). Escala: body 1rem; eyebrow 0.875rem; statement `clamp(2.5rem,7.5vw,5.25rem)`; display `clamp(3rem,13vw,10.5rem)`, line-height 0.92.

**Forma e movimento:** radius cards 28px; pills 999px; container 1440px, gutter `clamp(16px,4vw,64px)`; hairlines 1px `--c-line` como linguagem de desenho técnico; sombras quase zero (profundidade = hairlines + tints + glow blaze nos work-cards); easing único `cubic-bezier(0,0,.4,.97)`; micro .4s, reveals .8–1.2s. Anotar motion nos frames como specs (o Claude Design entrega telas; o motion vira anotação lateral por seção).

**Elemento-assinatura:** a **Linha de Automação** — um path SVG contínuo (stroke `--c-line` 1.5px) atravessando as seções como esteira/fiação, com **um pulso blaze** viajando e **nodes** (círculos com label mono) nos pontos de interesse — eco visual de um workflow n8n. Desenhe-a costurando hero → serviços → automação → portfólio → footer.

---

## 2 · REGRA DE MESCLA (Atlas × SATTI) — propriedade intelectual

O Atlas fornece **estrutura, medidas, ritmo e técnica**. É PROIBIDO copiar da referência: textos/copy (use a copy SATTI da §4), qualquer imagem/vídeo deles (use placeholders §3), logos de clientes deles (Uber, Intel, Oracle…), as fontes Freigeist/TT Commons (DEMO sem licença — use Archivo), o lilás/azul deles (use o mapeamento abaixo).

**Mapeamento de cor (referência → SATTI):** base branca → `--c-paper` · ink #2e2f30 → `--c-iron` · eyebrow #999 → `--c-steel` em mono · acento índigo #4541f1 → `--c-blaze` · faixa azul #2ca8fe → ver §4.S3 (duas variações p/ decisão) · dark Development rgb(13,15,17) → `--c-graphite` · glow azul dos cards → `--c-blaze` opacidade .8 blur 90px · rodapé azul-cinza → `--c-paper` com hairlines (footer SATTI é claro sobre graphite envolvente, ver §4.S11).

---

## 3 · SISTEMA DE PLACEHOLDERS DE MÍDIA (dimensões EXATAS — o decisor troca depois)

Desenhe cada slot como retângulo `#ECEEF2` com grade blueprint sutil, cruz central, e label em JetBrains Mono: `[ID · proporção · budget]`. Nunca preencher com foto/render inventado.

| ID | Slot | Proporção / natural | Render aprox. (1920) | Budget |
|---|---|---|---|---|
| A1 | Vídeo bg hero | 16:9 · 1920×1080 | full-bleed com margem 12px | ≤1,2 MB |
| A2–A5 | 4 stat-cards (vídeo) | 1:1 · 480×480 | ~150×150 dentro do card | ≤200 KB cada |
| A6 | Phone UI seção Automação | 9:19 · ~460×996 | ~348×741 (coluna central) | ≤250 KB |
| A7 | 3 imagens cards de serviço | 4:5 · 1200×1500 | ~604×653 por card | ≤180 KB |
| A8 | 2 texturas inline do banner | ~238×90 | ~215×81 (altura 1em no texto) | ≤120 KB |
| A9 | Mão + phone (PNG recortado) | ~1870px de largura | sobreposta à coluna central | ≤400 KB |
| PH-L | Phone esquerdo flutuante | 640×1044 | ~337×550 | ≤250 KB |
| PH-R | Phone direito flutuante | 640×1047 | ~378×618 | ≤250 KB |
| SC1–SC12 | 12 telas do mosaico (3 fileiras × 4) | 640×1353 | ~365×770 cada | WebP |
| P1–P3 | 3 previews de portfólio (vídeo real) | 16:9 / 4:5 | cards ~720px alt. | ≤1 MB cada |
| P4–P6 | 3 imagens de portfólio | WebP | idem | — |
| LG1–LG6 | Logos de clientes (marquee) | SVG mono | altura ~28px | [SOMENTE com autorização] |

---

## 4 · ESTRUTURA COMPLETA — SPEC POR SEÇÃO (Home, 11 seções, na ordem)

Copy oficial PT-BR abaixo (en espelhado na Fase 5). Itens `[CONFIRMAR]` permanecem como texto literal cinza no design.

**S1 · StickyHeader** — barra paper arredondada ~1858×66px, fixa a 20px do topo / 31px das laterais. Logo SATTI à esquerda (use wordmark texto "SATTI" Archivo bold; slot de logo final) · nav: Serviços, Sobre, Portfólio, Contato (hover "roll": texto duplicado sobe) · seletor PT/EN · CTA pill blaze "Falar com a SATTI" (texto iron) · hambúrguer.

**S2 · Hero** — full-viewport 1920×1080. Placeholder A1 full-bleed com margem 12px e radius sutil. H1 display Archivo caps 3 linhas: "CONSTRUÍMOS" / "MÁQUINAS DE" / typewriter **VENDER · ATENDER · OPERAR · CRESCER** com caret retangular. Badge de prova `[CONFIRMAR fonte real]` discreto. Nav âncora secundária (Home · Serviços · Sobre · Portfólio). Scroll-cue com anel pulsante. NÃO incluir botão de showreel (só existe se houver showreel real).

**S3 · ValuesStrip** — faixa full-bleed ~280px com marquee display: "IA aplicada · automação real · resultado mensurável" (duplicado, 20s linear). **Gerar 2 variações p/ decisão do decisor:** (a) fundo paper, texto iron outline/sólido com UM termo em blaze — recomendada pela regra do blaze raro; (b) fundo `--c-circuit`, texto paper — mapeamento literal da referência.

**S4 · 01 — Serviços** — eyebrow mono `01 — Serviços` + lead: "Time enxuto de engenharia que projeta, constrói e opera agentes de IA, automações e produtos digitais de ponta a ponta." 3 cards ~604×653 com leve sobreposição horizontal, radius 28, cada um com fundo tonal próprio (1: `--c-blaze-soft`; 2: `#E4EBFF`; 3: `#ECEEF2`), imagem A7, título, texto e tags mono em pills hairline:
1. **Agentes de IA & Automações** — "Agentes que atendem, qualificam e executam — integrados ao seu WhatsApp e às suas ferramentas." Tags: n8n · Evolution API · Claude / GPT · Python.
2. **Produtos Web & SaaS** — "Do zero ao deploy: produtos rápidos, bonitos e medíveis, com arquitetura que aguenta crescer." Tags: Next.js · Supabase · PostgreSQL · Vercel.
3. **Dados & Integrações** — "Planilhas viram sistemas. Sistemas conversam entre si. Decisão passa a nascer de dado." Tags: Dashboards · ETL · APIs · Automação de planilhas.

**S5 · 02 — Sobre** — eyebrow `02 — Sobre` + título "Engenharia que se prova" + CTA "Falar com a SATTI" (micro-interação círculo+seta). Slider fade de 3 statements em fill-text (base 32% → preenche no scroll): os 3 statements do JSON ("Estratégia sólida…", "Processo ágil…", "Ideia boa é ideia testada…"). Bloco "Alguns números": 4 stat-cards (radius 28, fundo `#F2F0F0`-equivalente paper-tint) com vídeo A2–A5 no canto e número gigante em JetBrains Mono + label Inter: `[CONFIRMAR]` projetos entregues · `[CONFIRMAR]` automações em produção · `[CONFIRMAR]` horas/mês economizadas · `[CONFIRMAR]` mensagens processadas. Diagrama circular: 3 anéis concêntricos (100/68/42%) com 10 nodes pulsantes e labels mono: Discovery, Dados, Agentes, Automação, Produto, Integrações, Métricas, Iteração, Deploy, Suporte (linhas do diagrama em `--c-circuit` 1px — uso funcional). Marquee de logos LG1–LG6 `[SOMENTE com autorização]`.

**S6 · Automação (dark)** — fundo `--c-graphite`, ~3758px de narrativa. Abertura: display branco gigante "{AUTOMAÇÃO} INTELIGENTE **" + texto "Tornar sua operação imbatível é engenharia. Levamos isso (a) a sério e (b) com criatividade." + 2 CTAs ("Ver portfólio" pill blaze · "Falar com a gente" ghost hairline). Phones PH-L/PH-R flutuando (float 6s, fases alternadas ±3s). Mosaico: 3 fileiras × 4 slots SC1–SC12 (~365×770), coluna central com A6 (phone vídeo) + A9 (mão) sobreposta. **Linha de Automação** percorrendo a seção com pulso blaze e nodes mono. Hover dos slots: label do projeto aparece (opacidade 0→1).

**S7 · 03 — Portfólio** — eyebrow `03 — Portfólio` + fill-text lead "Produto bom encurta caminho: menos clique, mais resultado." + título "Nada de soluções de prateleira" + CTA "Agendar conversa". Grade de 6 work-cards ~720px (radius 28): CallAudit (P1 vídeo) · Expediting Tracker (P4) · Portal Comercial — System Digital (P2 vídeo) · Funil quiz — proteção patrimonial (P5) · Pipeline de reels — LS Interbank (P3 vídeo) · `[CONFIRMAR 6º projeto]` (P6). Hover: mídia scale 1.05 + **glow blaze** (blur 90px) subindo de baixo + info-pill paper com título e seta.

**S8 · Banner (dark)** — painel `--c-graphite` radius grande, statement display 4 linhas: "Número bom / não mente: / dado + IA = / crescimento com método" com as 2 texturas A8 inline no fluxo do texto (altura 1em, radius 8px).

**S9 · CasesSlider** — fundo iron/graphite com círculos decorativos sutis. Título "Cases em destaque". Swiper de 3 cards (placeholder de capa + título + resumo curto dos 3 destaques: CallAudit, Portal Comercial, Pipeline de Reels). Controles prev/next pill hairline. Sem campo de busca na v1.

**S10 · 04 — Depoimentos** — eyebrow `04 — O que dizem os clientes`. Carrossel: aspas SVG, retrato circular (placeholder), nome, cargo, controles prev/next. Conteúdo: `[CONFIRMAR depoimento real autorizado]` ×2–4. Nunca inventar depoimento.

**S11 · Footer** — "hat" paper radius 0 0 28px com parallax de entrada. Título "Vamos construir a sua máquina?" + texto "Conte o que trava a sua operação. A primeira conversa já sai com um plano." **Form nativo** (nome, e-mail, empresa opcional, "O que você quer automatizar?", faixa de investimento opcional) + botão blaze "Enviar briefing" + estados de sucesso/erro do JSON. "Prefere e-mail? contato@sattiai.com". Colunas: Social (GitHub SAV1BOY · LinkedIn `[CONFIRMAR]` · Instagram `[CONFIRMAR]`) · Serviços (âncoras) · Navegação. "© SATTI 2026. Todos os direitos reservados." + back-to-top.

**Estados/overlays obrigatórios (telas separadas):** (O1) Menu fullscreen graphite: navegação numerada 01–06 em display, e-mail, sociais, tagline; (O2) Painel de contato lateral direito (metade esquerda com blur): título "Conte o que trava a sua operação", mesmos campos do form, botão blaze; (O3) Seletor de idioma expandido PT→EN.

**Subpáginas:** `/en` = espelho 1:1 da Home com a copy EN (Fase 5). Páginas de case individuais e blog = **v2, fora deste goal** (anotar link "Ver todos os cases" como âncora p/ contato na v1).

---

## 5 · WORKFLOW DE EXECUÇÃO (HRM — hierárquico, com gates; nunca pular fase)

**Loop por fase:** PLANEJAR (listar telas e decisões da fase) → EXECUTAR (gerar no Claude Design) → JULGAR (checklist §6, nota 0–10 por critério) → CORRIGIR (refazer só o que falhou) → repetir até PASS (≥8 em todos) → apresentar ao decisor → só então avançar.

- **F0 · Design System (1 tela):** página "SATTI DS" no Claude Design com: paleta nomeada com hex; type scale (display/statement/h2/body/eyebrow) nas 3 famílias; botões (pill blaze primário, ghost hairline, estado hover "roll", focus ring `--c-circuit` 2px); tags mono; card base radius 28; stat-card; work-card com glow; inputs do form (default/focus/erro/sucesso); hairlines e grade; a Linha de Automação (amostra de path + node + pulso); placeholder padrão de mídia. **Gate:** decisor aprova o DS antes de qualquer página.
- **F1 · Header + Hero + ValuesStrip (S1–S3):** desktop 1920 e mobile 375. Inclui as 2 variações da S3.
- **F2 · Seções claras (S4–S5):** Serviços + Sobre completos.
- **F3 · Bloco dark (S6–S8):** Automação + Portfólio + Banner (portfólio é claro entre os darks — manter o ritmo claro/escuro do Atlas).
- **F4 · Cauda (S9–S11) + overlays (O1–O3).**
- **F5 · Mobile completo + /en:** todas as telas em 375px (hero display ~14.6vw, cards empilhados, mosaico 2 colunas, work-cards 520px) e o espelho EN.

**Anotações obrigatórias por tela (camada lateral de specs):** keyframes equivalentes (marquee 20s linear; float 6s ease-in-out ±3s de fase; typewriter 90ms/char + hold 1.4s; pulse anel; fill-text por progresso de scroll; glow hover .4s), comportamento de cada controle (âncoras, painel, idioma), e fallback `prefers-reduced-motion` (marquee pausado, palavra fixa, linha estática, poster no lugar de vídeo).

## 6 · CHECKLIST GOLD/SOTA (auto-judge por tela — PASS = ≥8/10 em TODOS)

1. **Paleta exata** — só os 9 hex da §1; zero cor inventada; dark = `#0F1115`, não preto puro.
2. **Blaze raro** — máx. 1 elemento blaze por viewport; nunca texto blaze pequeno sobre paper.
3. **Azul funcional** — `#2F6BFF` só em links/diagrama/focus; jamais bloco decorativo (exceto variação b da S3).
4. **Tipografia fiel** — Archivo display caps / Inter body / JetBrains Mono em TODO eyebrow, tag, métrica e label; nada de serifa/fonte extra.
5. **Hierarquia e ritmo** — proporções e ordem da §4 respeitadas (alturas relativas do Atlas); um `<h1>` conceitual por página.
6. **Contraste AA** — iron sobre paper; `#F4F5F7` sobre graphite; texto preto sobre blaze; steel só ≥16px.
7. **Placeholders disciplinados** — todo slot de mídia com ID/proporção/budget legível; zero imagem inventada; zero conteúdo da referência.
8. **Copy oficial** — exatamente a copy da §4 (com `[CONFIRMAR]` literais); zero copy da referência; zero métrica inventada.
9. **Assinaturas presentes** — Linha de Automação costurando as seções; hairlines; glow blaze nos work-cards; micro-interação "roll" nos botões.
10. **Responsivo + motion specs** — versão 375px coerente e anotações de animação/reduced-motion presentes.

Se qualquer critério <8: corrigir e re-julgar ANTES de mostrar ao decisor. Registrar 1 linha por iteração (tela · critério reprovado · correção).

## 7 · ENTREGÁVEIS E DEFINITION OF DONE

- [ ] Tela "SATTI DS" aprovada pelo decisor (F0)
- [ ] 11 seções da Home em desktop 1920 (S1–S11) + 3 overlays (O1–O3)
- [ ] 2 variações da ValuesStrip apresentadas
- [ ] Mobile 375 de todas as telas + espelho `/en`
- [ ] Specs de motion/reduced-motion anotadas em toda tela
- [ ] Tabela final de placeholders usados (ID → tela → posição) p/ o decisor produzir a mídia
- [ ] Log do auto-judge (iterações até PASS) — nenhuma tela publicada com critério <8
- [ ] Screenshots/links de todas as telas organizados por fase para revisão do decisor

> **Resumo executivo para o agente:** estrutura e ritmo vêm do Atlas; pele, voz e alma vêm da SATTI. Blaze é raro e caro. Mídia é placeholder rotulado. Nenhuma tela avança sem passar no checklist. O decisor aprova fase a fase.
