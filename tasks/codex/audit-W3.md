# [CODEX] AUDIT W3 — Home completa (11 seções + StickyHeader + Linha D3 integrada)

Papel: auditor de gate (ULTRAGOAL §5.C / §7).
Modo: auditoria ESTÁTICA por leitura de fonte. NÃO rode npm/build/tsc/lint (CC rodou: 3 verdes; SSG prerender ok). NÃO faça git. Só escreva o veredito.

## Escopo
- `app/[locale]/page.tsx` (montagem) + `components/sections/**` (11 seções + header) + `components/ui/**` (mudanças novas: AutomationThread INITIAL_OWNER, plano com n3, PulseCircle labels/cores) + `content/home.{pt-BR,en}.json` (mudanças D2/D6/description)
- Contexto das decisões: `DECISIONS.log.md` DEC-006..009 (leia antes — divergências ali documentadas são decisões de chefia, não FAILs; ex.: pulso inicial em services, labels de node vindos das seções)

## Fontes da verdade
ULTRAGOAL.md §3/§4/§6-W3/§7 · comps `design/satti-design-system/project/*.dc.html` (desktop 1920 + mobile 375 de CADA seção + Home EN 1920 p/ o espelho) · `CHATs WEB/AUDITORIA-FIDELIDADE-SATTI-vs-awsmd.md` (medidas Atlas) · `outputs/design-md/satti/DESIGN.md` · `MANIFEST.md` (§8)

## Checklist (PASS/FAIL por item, evidência arquivo:linha; sub-itens por seção quando fizer sentido)

1. **Fidelidade ao handoff (§7.1)** — POR SEÇÃO (S1+S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, header): layout, proporções, spacing (8/12/16/24/48/88/120), radius, tipografia (tabela DESIGN.md) vs comp desktop 1920 E mobile 375. Aponte cada divergência com medida esperada×encontrada. Divergências já documentadas em DEC-008/009 ou nos cabeçalhos dos CSS Modules = registrar como "aceita", não FAIL.
2. **Paleta exata (§7.2)**: zero hex literal em componente; dark #0F1115 via token; hairlines dark = D1. color-mix() só com tokens é aceito (DEC da S4).
3. **Blaze-law L2 (§7.3)** por viewport em 1920 e 375 — contar de verdade, seção a seção (caret hero · S3 texto blaze · S4 sem blaze estático · S5 CTA · S6 CTA pill · S7 glow hover/claim único · S8 CTA · S9 dot ativo · footer?). Pulso da Linha = blaze da dobra em trânsito (D3/DEC-009a).
4. **Circuit L3 (§7.4)**: só links, linhas de diagrama (PulseCircle conforme comp), focus rings.
5. **Copy-law L1 (§7.5)**: diff das strings renderizadas vs JSONs vs comps; nenhum texto inventado; [CONFIRMAR] em steel com data-confirm; numeração D5 (01-06) nos eyebrows/menus dos DOIS idiomas.
6. **Motion (§7.6)**: assinaturas conforme comps (typewriter 90/1400/45 · fill-text · deck S4 · floats S6 6s±3s · glow S7 · marquees 20s/24s · header 2 estados .4s · hat parallax); só transform/opacity (exceções sancionadas: clip-path FillText, stroke-dash/offset-distance AutomationLine); var(--ease); reduced-motion cobre TUDO (gate CSS ou useMotionOk).
7. **Linha de Automação D3 (§7.7)**: 5 zonas presentes (hero→services→automation→portfolio→contact) como PRIMEIRO filho das sections corretas; continuidade do plano (handshake x; validateThreadPlan); pulso ÚNICO (AutomationThread, dono inicial services por DEC-009a); offset-path (zero SMIL); stroke 1.5 tokens por tom; reduced = linha 100% sem pulso; nodes com labels oficiais onde a comp tem.
8. **Budgets L4 (§7.8)**: imagens via next/image com sizes reais; placeholders blueprint pequenos; slots de vídeo com preload correto (§8: autoplay motion-gated p/ hero/stats/phone; preload="none"+hover p/ portfólio) + data-asset + poster do MANIFEST.
9. **A11y (§7.9)**: um único h1 (hero); headings sem pulo por seção; foco visível circuit em TODO interativo; alvos ≥44px; alts/aria-hidden corretos; data-lenis-prevent no slider S9; landmarks válidos (main único, footer, header, nav).
10. **Código L11 (§7.10)**: TS strict sem any; Server Components por padrão ("use client" só nas islands); params await; refs nunca como prop de hook-objeto.
11. **i18n (§7.12)**: /en espelho 1:1 (mesma estrutura, numeração D5, strings da comp Home EN); chaves espelhadas nos 2 JSONs; PulseCircle recebe methodNodes traduzidos.

## Saída
`audits/W3-verdict.md` no formato do W1/W2: tabela item→PASS/FAIL→evidência; veredito final X/11; "FAILs acionáveis" com correção proposta e severidade (bloqueante vs cosmético). Liste também "Divergências aceitas" (registradas em DEC/CSS) num bloco separado.

IMPORTANTE (resiliência): escreva o `audits/W3-verdict.md` INCREMENTALMENTE — grave o arquivo após concluir CADA item do checklist (append/atualização), não só no final. Uma execução anterior desta auditoria foi morta por erro de sandbox aos ~26min e perdeu todo o trabalho. Prefira poucos comandos de shell grandes a muitos pequenos.
