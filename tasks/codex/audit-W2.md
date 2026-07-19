# [CODEX] AUDIT W2 — Núcleo UI (utilitários + AutomationLine D3 + playground)

Papel: auditor de gate (ULTRAGOAL §5.C / §7).
Modo: auditoria ESTÁTICA por leitura de fonte. NÃO rode npm/build/tsc/lint (o CC já rodou: os 3 verdes). NÃO faça nenhuma operação git. NÃO edite nenhum arquivo além do veredito.

## Escopo auditado
- `components/ui/` — Marquee, FillText, Button, PulseCircle, WorkCard, AutomationLine(+.module.css), AutomationThread, automation-thread-plan.ts
- `hooks/useTypewriter.ts`, `hooks/useMotionOk.ts`
- `app/[locale]/dev/ui/` — page.tsx, demos.tsx, page.module.css
- `public/img/dev-poster.webp` (placeholder blueprint, budget)

## Fontes da verdade
- ULTRAGOAL.md §4 (D1, D3), §6-W2, §3 (leis), §7 (checklist)
- `design/satti-design-system/project/SATTI DS.dc.html` (folha do DS: botões, tipografia)
- Comps: S1+S2 (typewriter/caret), S3 Var A (marquee), S5 (fill-text, diagrama), S7 (work-card)
- `design/satti-design-system/project/outputs/design-md/satti/` (DESIGN.md + tokens.json)
- `app/styles/tokens.css` (tokens travados W0/W1)

## Checklist (PASS/FAIL por item, com evidência arquivo:linha)

1. **Specs dos utilitários (§6-W2)**: Marquee CSS-only com cópia aria-hidden e loop -50%; useTypewriter ciclo type 90ms/hold 1400ms/delete 45ms; FillText clip-path por progresso via IO+rAF; Button roll com texto duplicado + `cubic-bezier(0.76,0,0.24,1)` 450ms (DS) + variantes primary/secondary/dark-ghost; PulseCircle 3 anéis 100/68/42% + 10 nodes (5+3+2) + linhas + pulso 2s alternate delay 0.15s×i; WorkCard glow blaze blur(90px) opac 0.8 (único brilho do sistema, L9) + vídeo só hover/in-view `preload="none"`.
2. **Paleta exata**: zero hex literal em componente (`#[0-9A-Fa-f]` fora de var()); tons dark usam D1 (`--c-line-dark`/`--c-hairline-dark`).
3. **Blaze-law (L2)** no playground: por viewport/dobra, no máx. 1 elemento blaze (caret do typewriter; pulso da Linha; marcador 8×8 do eyebrow NÃO conta).
4. **Circuit (L3)**: `--c-circuit` só em uso funcional (linhas do diagrama PulseCircle, focus ring). Nunca CTA/decoração.
5. **Copy-law (L1)**: playground só usa strings do `content/home.*.json` ou rótulos estruturais mono `[ … ]`. Nenhum texto editorial inventado.
6. **Motion (L10/L5)**: só transform/opacity (exceções documentadas e aceitas: clip-path no FillText = mecanismo da assinatura; stroke-dasharray/offset + offset-distance na AutomationLine = mecanismo D3); easing `var(--ease)` ou os do DS; TODA animação dentro de `@media (prefers-reduced-motion: no-preference)` ou gated por JS matchMedia; fallback estático correto em cada peça.
7. **D3 — Linha de Automação (item mais importante)**:
   a. Contrato de continuidade: plano central (`automation-thread-plan.ts`) com saída x == entrada x entre zonas adjacentes + `validateThreadPlan()`;
   b. Tangentes verticais nas fronteiras (cubics com controles verticais);
   c. Pulso ÚNICO no site inteiro (AutomationThread: um dono por vez, handoff animationend, wrap);
   d. Pulso via `offset-path`/`offset-distance` CSS — ZERO SMIL/animateMotion;
   e. Stroke 1.5px `--c-line` claro / `--c-line-dark` escuro;
   f. Reduced-motion: linha 100% desenhada, nodes visíveis, SEM pulso;
   g. Desenho no scroll via IO + rAF, sem scroll listener.
8. **Budget (L4)**: `public/img/dev-poster.webp` dentro do razoável para placeholder (≤ 50 KB).
9. **A11y**: duplicatas/decorativos aria-hidden (marquee copy, button label 2, fill layer, AutomationLine wrapper); labels acessíveis onde interativo; alvos ≥ 44px no Button.
10. **Código (L11)**: TS strict sem `any`; `"use client"` apenas onde há estado/efeito (Marquee, PulseCircle e Button devem permanecer Server Components); nenhum objeto de hook com refs passado como prop; imports limpos.

## Saída
Escrever `audits/W2-verdict.md` no MESMO formato do `audits/W1-verdict.md`: tabela item → PASS/FAIL → evidência (arquivo:linha), veredito final X/10, seção "FAILs acionáveis" com correção proposta por FAIL.
