# RELATÓRIO FINAL — SITE SATTI v1.0.0

> ULTRAGOAL §10 · gerado em 2026-07-19 pelo engenheiro-chefe (Claude Code / Fable 5),
> com Codex (GPT 5.6) como auditor de gates. Todos os 7 itens do DoD (§0) cumpridos.

---

## 1 · URLs e status

| O quê | URL / status |
|---|---|
| **Produção (Vercel)** | https://site-satti.vercel.app — ● Ready, HTTP 200 |
| Repositório | https://github.com/SAV1BOY/site-satti (main, tag `v1.0.0`) |
| Domínio `sattiai.com` | **Adicionado ao projeto site-satti na Vercel** — aguardando DNS (item 2) |
| Domínio `www.sattiai.com` | Adicionado ao projeto — aguardando DNS; redirect www→apex automático da Vercel |
| Rotas | `/` (pt-BR) · `/en` · `/sitemap.xml` · `/robots.txt` · `/manifest.webmanifest` · OG image |

## 2 · DNS na Cloudflare (ÚNICO passo manual do Miguel)

No painel da Cloudflare do domínio `sattiai.com`, criar os 2 registros com **nuvem CINZA (DNS only — sem proxy)**:

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `sattiai.com` (apex/@) | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

A Vercel verifica sozinha e emite o certificado (chega e-mail de confirmação).

**Depois que o domínio estiver servindo**, 2 flips de env na Vercel (Settings → Environment Variables, Production) + redeploy:

| Var | Valor | Efeito |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://sattiai.com` | canonical/hreflang/OG/sitemap passam a apontar pro domínio próprio (DEC-013) |
| `NEXT_PUBLIC_CONTENT_MODE` | `final` | modo público: zero `[CONFIRMAR]` visível — omissão elegante (DEC-012; ver item 3) |

## 3 · `[CONFIRMAR]` pendentes (o que destrava o modo `final` COMPLETO)

O modo `final` já funciona hoje (testado: zero `[CONFIRMAR]` visível em `/` e `/en`) — ele **omite** o que não tem copy oficial. Cada item cravado abaixo REAPARECE no site; enquanto isso, a seção degrada com elegância:

| # | Item | Onde | Sem confirmação, o modo final… |
|---|---|---|---|
| 1 | Badge do hero ("fonte real" de prova) | `hero.eyebrow` | omite o badge |
| 2 | 4 métricas (valor + label) | `about.metrics` | omite os 4 stat-cards |
| 3 | Métricas antes→depois dos 3 cases | `cases.beforeValue/afterValue` | omite a linha de métrica dos cards |
| 4 | Depoimentos (quote+nome+cargo, a comp pede 3 cards) | `reviews.*` | omite a S10 inteira |
| 5 | 6º projeto do portfólio | `portfolio.items[5]` | mostra só os 5 reais |
| 6 | Statement do S8 Banner | `banner.copy` + `draftLines` | esconde o chrome de rascunho; linhas ficam em steel (DEC-012) |
| 7 | Handles LinkedIn/Instagram | `footer/menu/contact .linkedin/.instagram` | mostra só GitHub (oficial, D6) |
| 8 | Screenshots reais do portfólio (6) e dos 3 cases | `public/img/portfolio/shot-{1..6}.webp` | placeholders blueprint |
| 9 | Foto real do founder (A9) | `public/img/founder.webp` | placeholder blueprint |

Sugestões de chave anotadas p/ quando houver copy: `hero.anchors` ("Home" na nav do hero), `hero.anchorNavAriaLabel`, `automation.eyebrowMobile`, `cases.cta`, `cases.goToSlideAriaLabel`, "(opcional)" nos campos empresa/faixa. EN: resync curado de `footer.titleLines/descriptor/signature` e `automation.description` (hoje = literais da comp EN, marcados `machine_translated` onde aplicável).

## 4 · Vídeos deferidos (§8) — onde soltar cada arquivo

O markup já está FINAL com poster + `data-asset`: basta commitar o `.mp4` no path e ele passa a tocar (zero mudança de código).

| Slot | Path exato | Budget | Comando ffmpeg sugerido |
|---|---|---|---|
| A1 Hero bg | `public/media/hero.mp4` | ≤ 1,2 MB | `ffmpeg -i in.mp4 -an -vf "scale=1920:-2,fps=24" -t 8 -c:v libx264 -crf 30 -preset slow -movflags +faststart public/media/hero.mp4` |
| A2–A5 Stats | `public/media/stats/stat-{1..4}.mp4` | ≤ 200 KB cada | `ffmpeg -i in.mp4 -an -vf "scale=640:-2,fps=20" -t 4 -c:v libx264 -crf 34 -preset slow -movflags +faststart out.mp4` |
| A6 Phone | `public/media/phone.mp4` | ≤ 250 KB | `ffmpeg -i in.mp4 -an -vf "scale=750:-2,fps=20" -t 5 -c:v libx264 -crf 33 -preset slow -movflags +faststart public/media/phone.mp4` |
| P1–P3 Portfólio (REAIS) | `public/media/portfolio-{1,2,3}.mp4` | ≤ 1 MB cada | `ffmpeg -i in.mp4 -an -vf "scale=1280:-2,fps=24" -t 10 -c:v libx264 -crf 30 -preset slow -movflags +faststart out.mp4` |

Posters (1º frame): já existem como blueprint; para trocar pelo frame real: `ffmpeg -i video.mp4 -vframes 1 -q:v 3 frame.png` → `npx sharp` ou `node scripts/gen-image.mjs` para WebP no budget.

Imagens geradas por IA (A7×3, A8×2, posters A1–A6): com `OPENAI_API_KEY` setada, **um comando regenera tudo**: `node scripts/gen-all-images.mjs` (prompts em `prompts/`, validação automática de budget).

## 5 · Envs — configuradas × faltantes

| Var | Status | Efeito da falta (tudo degrada com log claro — nada quebra) |
|---|---|---|
| `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` + `CONTACT_TO_EMAIL` | **faltando** | form não envia e-mail; canal pulado |
| `N8N_LEAD_WEBHOOK_URL` | **faltando** | sem WhatsApp via Evolution; canal pulado |
| — ambos os canais faltando (estado atual) | — | form mostra a mensagem de ERRO OFICIAL (que aponta o mailto) e o lead é registrado nos logs do server (contingência — nada se perde) |
| `OPENAI_API_KEY` | **faltando** | imagens ficam nos placeholders blueprint |
| `NEXT_PUBLIC_CONTENT_MODE` | default `draft` | previews mostram `[CONFIRMAR]` em steel (modo de revisão) |
| `NEXT_PUBLIC_SITE_URL` | **faltando de propósito** | base = site-satti.vercel.app até o cutover (DEC-013) |

Extra (DEC-002): chave SSH `~/.ssh/id_ed25519_github.pub` pronta para registro em github.com/settings/keys; após registrar: `git remote set-url origin git@github.com:SAV1BOY/site-satti.git` (hoje o push funciona via HTTPS/gh).

## 6 · Números finais

| Métrica | Resultado | Alvo |
|---|---|---|
| Lighthouse mobile — Performance | **93** | ≥ 90 ✓ |
| Lighthouse mobile — Accessibility | **97** | ≥ 95 ✓ |
| Lighthouse mobile — SEO | **100** | ≥ 95 ✓ |
| Lighthouse mobile — Best Practices | **100** | — |
| LCP / TBT / CLS | 3,0 s / 80 ms / 0 | — |
| Peso do load inicial | **381 KiB** | ≤ 3 MB ✓ (L4) |
| Budgets de assets (`check-budgets.mjs`) | 21 assets, 0 violações | 100% ✓ |
| Smoke de produção (`scripts/smoke-prod.mjs`) | **17/17** (200, PT/EN, O1/O2, Esc, form real, reduced-motion) | 100% ✓ |
| Headers de segurança | HSTS preload · nosniff · Referrer-Policy · Permissions-Policy · CSP frame-ancestors | presentes no response real ✓ |

**Auditorias de gate (Codex):** W1 **PASS 8/8** · W2 **PASS 10/10** (após 2 fixes) · W3 **PASS 11/11** (após rebuild da S10 + 7 overrides mobile) · W4 **PASS 5/5** (após 3 fixes ARIA/L2/close-order). Vereditos em `audits/`. Build + tsc + lint verdes em todos os commits de gate; espelho `/en` 1:1 auditado.

## 7 · Decisões de arbitragem

`DECISIONS.log.md` (anexo no repo) — DEC-001 a DEC-014. Destaques: DEC-006 (técnica da Linha D3: SVG por segmento + plano central + pulso único via offset-path), DEC-008 (rebuild de 4 seções da onda Codex — Loop 2 HRM), DEC-009 (pulso nasce em services), DEC-010 (sandbox do codex-cli quebrado no Windows → auditorias fatiadas sem sandbox), DEC-012 (regras do modo final), DEC-013 (base de URL por ambiente), DEC-014 (steel −10/canal para AA universal).

---

### Estado de entrega
**DoD §0: 7/7.** Home completa (11 seções + 3 overlays) PT + `/en` espelho · fidelidade auditada pelo Codex em todos os gates · form funcionando com degradação graciosa · imagens dentro de budget + slots de vídeo com markup final · build/tsc/lint verdes + Lighthouse acima dos alvos · produção no ar com domínio adicionado (DNS = passo manual único) · este relatório.
