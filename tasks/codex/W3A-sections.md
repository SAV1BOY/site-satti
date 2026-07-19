# [CODEX] W3-A' — Seções: StickyHeader · S3 · S5 · S8 · S9 · S10 · S11

Papel: engenheiro paralelo (ULTRAGOAL §6-W3 Onda A').
Objetivo: implementar 7 seções pixel-fiéis às comps do handoff, em Next 16 + TS strict, prontas para o CC montar em `app/[locale]/page.tsx` (a montagem é do CC — NÃO toque na page).

## Arquivos EXCLUSIVOS SEUS nesta fase (crie as pastas)
- `components/sections/header/` — StickyHeader.tsx (+ .module.css + client children se precisar)
- `components/sections/values/` — ValuesStrip.tsx (Var A paper — Var B está ARQUIVADA, não portar)
- `components/sections/about/` — About.tsx (S5 Sobre)
- `components/sections/banner/` — Banner.tsx (S8)
- `components/sections/cases/` — CasesSlider.tsx (S9)
- `components/sections/reviews/` — Reviews.tsx (S10 Depoimentos)
- `components/sections/footer/` — Footer.tsx (S11 — SEM Server Action ainda; form estático com os 4 estados de input via CSS, action chega no W4)
- `audits/W3A-codex-report.md` (seu relatório final)

## Arquivos PROIBIDOS (área do CC nesta fase)
`app/**` (inclui page.tsx/layout.tsx), `components/sections/{hero,services,automation,portfolio}/`, `components/ui/**`, `components/providers/**`, `hooks/**`, `content/**`, `i18n/**`, configs da raiz. Se achar bug em área proibida, REPORTE no relatório — não corrija.

## Uso READ-ONLY permitido (importe, não edite)
`components/ui/*` (Button, Marquee, FillText, PulseCircle, AutomationLine…), `hooks/*`, tokens/globals, `content/home.*.json` via next-intl.

## Fontes da verdade (ordem)
1. ULTRAGOAL.md §3 (leis L1-L12), §4 (D1-D6 + decisões F0-F5 + lei de tradução comp→código)
2. Comps: `design/satti-design-system/project/S{3,5,8,9,10,11} * {Desktop 1920,Mobile 375}.dc.html` + `S1+S2 Hero *.dc.html` (estados do header) + `SATTI DS.dc.html`
3. Medidas: `CHATs WEB/AUDITORIA-FIDELIDADE-SATTI-vs-awsmd.md` (Atlas: header ~1858×66; diagrama S5 10 nodes raios 100/68/42% + logos-marquee 24s; marquee S3 20s; S9 Swiper 1-col sem busca; S10 4 depoimentos com aspas SVG + prev/next; footer parallax hat)
4. `design/satti-design-system/project/outputs/design-md/satti/DESIGN.md` (tipografia/spacing)

## Regras de arquitetura (obrigatórias)
- Server Component por padrão; `"use client"` SÓ em children com estado/efeito, em ARQUIVO SEPARADO dentro da pasta da seção (L11).
- Copy SEMPRE via next-intl (`getTranslations` no server / props para client children). Chaves em `content/home.pt-BR.json`: header, values, about, banner, cases, reviews, footer, menu. NUNCA texto hardcoded (L1). `[CONFIRMAR]` renderiza em steel `#6E7480` → use `var(--c-steel)` (campos com `{value, confirm: true}` no JSON).
- Zero hex literal — só `var(--c-*)` (tokens.css). Dark = D1 (`--c-line-dark` separadores, `--c-hairline-dark` bordas/nodes).
- Lei de tradução comp→código (§4): descartar padding-right 348px, min-height 100vh (só Banner S8 e Footer S11 são full-viewport nesta leva), asides Specs, placeholders `[ A1 · … ]`, data-screen-label, badges motion. Recriar o visual, não portar o DOM.
- Motion: L10 (transform/opacity, `var(--ease)`, IO+rAF, `{passive:true}`), L5 (tudo em `@media (prefers-reduced-motion: no-preference)` ou gated por `hooks/useMotionOk`). Reduced-motion = estado das comps.
- Profundidade L9: hairline 1px + tint; SEM drop-shadow.
- Blaze-law L2 por seção/dobra; Circuit L3 só funcional (links/focus/linhas de diagrama).
- Tipografia L12: Archivo display caps tracking neg · Inter body · JetBrains Mono eyebrows/tags/métricas caps +0.08em (exceção: grafia oficial de marcas).
- Imagens: `next/image` com `sizes` reais; assets ainda não existem → use os paths FINAIS do MANIFEST.md com poster placeholder `/img/dev-poster.webp` onde precisar de src (W5 troca). Slots de vídeo: markup final `muted playsInline loop` + `preload="none"` + `data-asset` + poster (§8).
- Âncoras: cada seção com `id` correspondente ao menu (services→ver menu JSON; use: sobre, cases, depoimentos, contato conforme numeração D5).

## Especificações por seção (decisões travadas §4)
- **StickyHeader**: 2 estados — sobre o hero CTA "Falar com a SATTI" ghost/hairline; ao sair do hero (~80% da altura do hero) header ativa (bg) e CTA preenche blaze, transição .4s var(--ease). Hambúrguer abre O1 (W4) — por ora renderize o botão com `aria-expanded={false}` e um handler noop client-safe (prop `onMenuOpen?`). Logo SATTI texto (sem asset de logo na v1).
- **S3 ValuesStrip**: Var A (paper) com "resultado mensurável" em blaze (é O elemento blaze da dobra). Use `components/ui/Marquee` (20s).
- **S5 About**: fill-text 3 statements (`components/ui/FillText`, chaves about.paragraphs); 4 stat-cards mono gigante `[CONFIRMAR]` em steel; slot de vídeo no canto (paths MANIFEST stats/*); diagrama `components/ui/PulseCircle`; marquee de logos → placeholder com aviso `about.logosNotice` (logos só com autorização — NÃO inventar logos).
- **S8 Banner**: dark, statement `[CONFIRMAR]` com rascunho em steel (banner.* no JSON) + 2 texturas A8 inline (paths MANIFEST texture-{1,2}, use dev-poster como src provisório se necessário) — full-viewport.
- **S9 CasesSlider**: D4 — 3 cases curados com métrica antes→depois (Swiper já instalado, 1 coluna, sem busca), eyebrow "04 — Cases em detalhe", métricas `[CONFIRMAR]` steel. Dots mobile: blaze no ativo. `data-lenis-prevent` se houver scroll interno.
- **S10 Reviews**: depoimentos `[CONFIRMAR]` literal do JSON (NUNCA inventar nome/cargo/foto/citação — L1), aspas SVG, prev/next acessíveis.
- **S11 Footer**: D6 — form nativo 5 campos (nome, e-mail, empresa opc., mensagem, faixa de investimento opc.) com os 4 estados de input do DS via CSS (default/focus ring `var(--c-circuit)`/erro `var(--c-error)`/sucesso `var(--c-success)` — feedback só texto+borda+ícone); e-mail contato@sattiai.com; copyright `© SATTI ${new Date().getFullYear()}…` (string do JSON com {year}); parallax hat (docs §4/comp); sociais: GitHub SAV1BOY + demais `[CONFIRMAR]`. Footer hospeda o fim da Linha: renderize `<AutomationLine zone="contact" tone="dark" />` como primeiro filho (section position:relative; conteúdo z-index 1; labels de node só se existirem na comp).

## Aceite (você mesmo confere antes de reportar)
[ ] 7 seções compilam TS strict (leitura estática — NÃO rode npm/npx; o CC roda build)
[ ] zero hex literal · zero copy inventada · chaves next-intl existem nos DOIS JSONs
[ ] reduced-motion coberto em toda animação
[ ] desktop 1920 + mobile 375 fiéis às comps (breakpoint ~768px)
[ ] relatório `audits/W3A-codex-report.md`: por seção — arquivos criados, chaves JSON usadas, decisões tomadas, pendências para o CC

NÃO faça operações git. NÃO rode npm/npx. Trabalhe direto nos arquivos.
