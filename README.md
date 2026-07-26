# SITE SATTI

Site institucional da SATTI (IA & Automação) — `sattiai.com`.
Next.js 16 · App Router · React 19 · TypeScript strict · Tailwind v4 · next-intl · Vercel.

Uma página, 11 seções + 3 overlays, PT-BR (sem prefixo) e `/en` como espelho 1:1.
Produção: <https://site-satti.vercel.app>

---

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

## Verificar antes de qualquer merge

```bash
npm run verify       # build + typecheck + lint + budgets + thirdparty
```

Ou individualmente:

| Comando | O que garante |
|---|---|
| `npm run build` | build de produção |
| `npm run typecheck` | `tsc --noEmit` (TS strict) |
| `npm run lint` | ESLint 9 + regras React 19 |
| `npm run budgets` | nenhum asset estoura o `MANIFEST.md` (lei L4) |
| `npm run thirdparty` | nenhum asset de terceiro pode vazar para o modo `final` (V2-D2) |
| `node scripts/smoke-prod.mjs <url>` | smoke de produção (PT/EN, overlays, form, reduced-motion) |

## Estrutura

```
app/
  [locale]/          layout · page · opengraph-image     (rotas / e /en)
  actions/           submitBrief (Server Action: Zod → Resend → webhook n8n)
  styles/            tokens.css · animations.css
  globals.css        @theme inline (tokens expostos ao Tailwind) + base
components/
  sections/          hero values services about automation
                     portfolio banner cases reviews footer header
  overlays/          menu (O1) · contact (O2) · language (O3) + OverlayProvider
  providers/         LenisProvider (scroll) · CursorProvider (cursor do DS)
  ui/                Button FillText Marquee PulseCircle WorkCard
                     AutomationLine + AutomationThread + automation-thread-plan
content/             home.pt-BR.json · home.en.json   (chaves espelhadas)
hooks/               useMotionOk · useTypewriter
i18n/                routing · request                  (next-intl)
lib/                 content-mode · site-url · third-party (+ declaração)
scripts/             check-budgets · check-thirdparty · smoke-prod · gen-*
design/              handoff do DS (30 comps) + awsmd-ref (medidas do modelo)
public/              mídia — contrato em MANIFEST.md
proxy.ts             middleware do next-intl (nome do Next 16)
```

## Documentos de projeto

| Arquivo | O que é |
|---|---|
| `ULTRAGOAL.md` | goal do v1 (cumprido) — leis L1–L12, decisões de gate D1–D6 |
| `DECISIONS.log.md` | toda decisão de arbitragem (DEC-001…) — inclui a seção do v2 |
| `MANIFEST.md` | contrato de assets: path, dimensão, budget, flag de terceiro |
| `RELATORIO-FINAL.md` | entrega do v1 (URLs, DNS, `[CONFIRMAR]`, envs) |
| `AGENTS.md` | aviso: este Next tem breaking changes — ler `node_modules/next/dist/docs/` |
| `design/awsmd-ref/*.json` | geometria e coreografia do modelo estrutural, **só medidas** |

## Leis que o código respeita

- **Copy nunca é inventada.** Existe oficial → literal; sem versão final → `[CONFIRMAR]` com o rascunho em steel. Nunca texto editorial do modelo passando por oficial.
- **Nenhum hex literal em componente** — sempre `var(--c-*)`.
- **Só `transform` e `opacity`** animam; easing global `--ease`; scroll via rAF `{passive:true}` ou IntersectionObserver.
- **Toda animação tem fallback estático** em `prefers-reduced-motion: reduce`.
- **Budgets de mídia são gate**, não sugestão (`npm run budgets`).
- `circuit` (`#2F6BFF`) só em link, linha de diagrama e focus ring — nunca CTA, nunca decoração.
- Assets do modelo estrutural entram só em preview, marcados, e saem no modo `final` (`npm run thirdparty`).

## Env

Nenhuma env é obrigatória: tudo degrada com log claro. Ver `.env.example`.

| Var | Sem ela |
|---|---|
| `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` + `CONTACT_TO_EMAIL` | form não envia e-mail; lead vai para os logs do server |
| `N8N_LEAD_WEBHOOK_URL` | sem WhatsApp via Evolution API |
| `NEXT_PUBLIC_CONTENT_MODE` | default `draft` (mostra `[CONFIRMAR]`); `final` = modo do domínio público |
| `NEXT_PUBLIC_SITE_URL` | base = URL de produção da Vercel |
| `OPENAI_API_KEY` | imagens geradas caem no placeholder blueprint |
