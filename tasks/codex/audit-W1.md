# [CODEX] AUDIT W1 — Fundação (tokens, providers, i18n)

Papel: auditor (§5.C do ULTRAGOAL)
Branch: codex/audit-w1 (worktree isolada, já em main atualizado)
Referências: ULTRAGOAL.md §3 (leis) · §4 (D1, D5, D6) · §7 (checklist) · handoff em design/satti-design-system/

## Sua tarefa
Auditar o estado atual do repo (workflows W0+W1) POR LEITURA DE FONTE e devolver `audits/W1-verdict.md` com PASS/FAIL POR ITEM + evidência (arquivo:linha). NÃO rode npm/build (sem node_modules nesta worktree — o CC já validou build/tsc/lint verdes). NÃO modifique nenhum arquivo além de `audits/W1-verdict.md`.

## Checklist (PASS = 100%)

1. **Paleta exata (§7.2):** `app/styles/tokens.css` bate com `design/satti-design-system/project/outputs/design-md/satti/tokens.json` + CLAUDE.md do DS: paper #F7F8FA · iron #15171B · graphite #0F1115 · steel #6E7480 · blaze #FF4D00 · circuit #2F6BFF · blaze-soft #FFE9DE · line #E3E6EB · ink-on-dark #F4F5F7 · error #B43A2F · success #15794B · D1: --c-line-dark #1E2127 e --c-hairline-dark #2A2D34 · tints #FFE9DE/#E4EBFF/#ECEEF2.
2. **Zero hex literal em componente:** grep por `#[0-9A-Fa-f]{3,8}` em `app/**/*.tsx` e `components/**/*.tsx` — tudo deve ser var(--c-*)/var(--ff-*)/var(--sp-*)/var(--r-*).
3. **i18n espelhado (§7.12):** `content/home.pt-BR.json` × `content/home.en.json` com árvore de chaves idêntica; numeração D5 nos DOIS idiomas (01 Serviços/Services … 06 Contato/Contact); EN de "What clients say" = 05.
4. **Copy-law (§7.5) por amostragem:** compare literalmente ≥ 12 strings do JSON PT contra as comps (S1+S2 Hero, S4, S6, O1 Menu, S11 Footer desktop) — zero texto inventado; [CONFIRMAR] preservados. Exceção legítima (D6, §4 vence comps): footer.form.error = "Não foi possível enviar. Tente de novo ou escreva para contato@sattiai.com." e footer.copyright = template com {year}.
5. **Código (§7.10 / L11):** TS strict; Server Components por padrão ("use client" APENAS em components/providers/*); `params` await como Promise (Next 16) em layout/page; sem `any`.
6. **Next 16:** `proxy.ts` na raiz (não middleware.ts) com createMiddleware(routing); plugin next-intl em next.config.ts; fontes next/font com subsets ["latin"] (L4).
7. **Motion base (L5/L10):** animations.css só transform/opacity; keyframes dentro de @media (prefers-reduced-motion: no-preference); --ease = cubic-bezier(0,0,.4,.97).
8. **Providers:** LenisProvider desliga em reduced-motion; CursorProvider desliga em touch (pointer: fine) e reduced-motion, usa só transform no loop.

## Saída
`audits/W1-verdict.md`: tabela item → PASS/FAIL → evidência; veredito final; lista de FAILs acionáveis se houver. Commit na branch codex/audit-w1 tocando SOMENTE esse arquivo.
