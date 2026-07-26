# RELATÓRIO FINAL — SITE SATTI v2 · paridade estrutural

> ULTRAGOAL v2 · gerado em 2026-07-26. O v1 (`RELATORIO-FINAL.md`) segue válido para o que
> ele entregou; este cobre o v2, cujo alvo era outro: **fazer o site ficar praticamente
> idêntico ao modelo estrutural em estrutura, geometria e coreografia**, mudando paleta,
> copy e assets.

---

## 1 · O que estava errado e o que mudou

A auditoria do próprio projeto (`CHATs WEB/AUDITORIA-FIDELIDADE-SATTI-vs-awsmd.md`) já tinha
medido: paleta 9,8/10 · tipografia 10/10 · estrutura 9,5/10 · **funcional 7,5/10**, e concluído
que *"a distância entre 7,5 e 10 na coluna funcional não se fecha no Claude Design — fecha-se
no build"*. Duas causas concretas:

1. **O site estava visualmente vazio.** Os 22 rasters de `public/` eram todos placeholders
   blueprint de 1,4–5,5 KB (2–5 % do budget). Zero arquivos `.mp4`.
2. **A coreografia medida nunca tinha sido implementada.** Os docs que a descrevem
   (`09-MOTION-SPEC.md`, `04-REFERENCE-AWSMD.md`) não existiam quando o v1 foi construído.

O v2 fechou as duas. O número que definia a wave: **a seção de automação do modelo ocupa
30,2 % da altura da página e a nossa ocupava 9,7 %** — 3,5× mais curta.

### Perfil de altura por seção, medido (`npm run parity:dom`)

| seção | antes | agora | modelo | Δ |
|---|---|---|---|---|
| hero | 8,0 % | **8,2 %** | 9,3 % | −1,1 |
| values + services | 23,1 % | **8,9 %** | 7,9 % | +1,0 |
| about | 18,4 % | **10,4 %** | 8,8 % | +1,6 |
| **automation** | **9,7 %** | **30,4 %** | **30,2 %** | **+0,2** |
| portfolio | 20,6 % | **22,9 %** | 23,7 % | −0,8 |
| banner | 8,0 % | **5,7 %** | 5,3 % | +0,4 |
| cases | 7,0 % | **7,9 %** | 7,9 % | 0,0 |
| reviews | 6,4 % | **5,7 %** | 7,0 % | −1,3 |

Pior desvio: **1,6 pontos percentuais** (tolerância ±4). Altura do documento 14.800 → 14.584 px
(modelo: 13.195). **4/4 gates de paridade passam**, incluindo pin budget, ritmo claro/escuro e
o teto de 3 loops rAF (eram 10).

---

## 2 · URLs e status

| O quê | Estado |
|---|---|
| **Produção** | <https://site-satti.vercel.app> — READY, HTTP 200 |
| Repositório | <https://github.com/SAV1BOY/site-satti> (`main`, tag `v2.0.0`) |
| `sattiai.com` / `www` | **adicionados e aliasados** na Vercel · DNS ainda não aponta |
| Modo | `draft` — assets do modelo visíveis para revisão, página `noindex` |
| Rotas | `/` (pt-BR) · `/en` · `/sitemap.xml` · `/robots.txt` · `/manifest.webmanifest` · OG |

---

## 3 · Cutover de domínio — o único passo manual, e a ordem importa

**Faça o passo 1 ANTES do passo 2.** Se o DNS apontar com o site ainda em `draft`, o domínio da
marca serviria assets marcados para troca. Isso não é mais possível por acidente: uma guarda de
host no `proxy.ts` responde **503 com a instrução** para `sattiai.com` e `www.sattiai.com`
enquanto o modo não for `final` (testado: `localhost` → 200, `sattiai.com` → 503). A guarda
existe porque o domínio já está aliasado esperando só o DNS, e nesse cenário nenhum build
acontece e nenhuma env muda — então a checagem tinha de ser por host, em tempo de request.

### Passo 1 · Vercel → Settings → Environment Variables (Production) + redeploy

| Var | Valor | Efeito |
|---|---|---|
| `NEXT_PUBLIC_CONTENT_MODE` | `final` | libera o domínio; assets do modelo saem (ver §5) |
| `NEXT_PUBLIC_SITE_URL` | `https://sattiai.com` | canonical/hreflang/OG/sitemap no domínio próprio |

### Passo 2 · Cloudflare → DNS de `sattiai.com`, **nuvem CINZA (DNS only, sem proxy)**

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `sattiai.com` (apex / @) | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

A Vercel verifica sozinha e emite o certificado.

---

## 4 · Números finais (medidos, não estimados)

### Lighthouse mobile, contra a produção real, 3 runs

| Categoria | Mediana | Alvo | |
|---|---|---|---|
| **Accessibility** | **100** | ≥ 95 | ✅ |
| **Best Practices** | **100** | — | ✅ |
| **Performance** | **88** | ≥ 90 | ❌ **falta 2** |
| SEO (modo `draft`) | 61 | — | por desenho — ver abaixo |
| SEO (modo `final`) | **92** | ≥ 95 | ❌ falta 3 · o resto é artefato de teste |

FCP 1,4 s · **LCP 2,7 s** · TBT 352 ms · **CLS 0,000** · SI 2,0 s.

**O SEO 61 em `draft` é comportamento correto, não falha.** Eu fiz o modo de revisão ser
`noindex` (robots.txt + meta) exatamente porque ele serve assets de terceiro. Medido em modo
`final`: **61 → 92**, e as duas auditorias restantes eram (a) `canonical` inválido, que é
artefato de testar em `localhost` com o canonical apontando para o domínio, e (b) um
`label-content-name-mismatch` que **foi corrigido** depois dessa medição. Em `final` no domínio
próprio o SEO deve ficar em ~100.

**A Performance em 88 é uma falha real do DoD §0.5 e eu não vou arredondar.** O que sei:

- O gargalo é **render delay**, não bytes. Com o cache de imagem quente, o LCP tem 84 % em
  render delay e 1 % em load time — o poster do hero são 5,7 KB servidos em AVIF.
- **A variância da medição é maior que o gap.** Runs do mesmo build em máquina limpa deram
  76–88. Duas causas identificadas e removidas durante a investigação: 17 processos node órfãos
  dos agentes de workflow comendo CPU (uma medição de TBT 1.340 ms veio daí, e eu quase a
  reportei como regressão), e o transform de imagem sob demanda do `next start` local — medido
  em **388 ms frio contra 10 ms quente**, que na Vercel é cache de edge.
- **Três hipóteses minhas foram derrubadas por medição**, e vale registrar para quem continuar:
  o download do poster (era latência de transform), a intro cobrindo o hero (desliguei e medi:
  73/72/82 sem ela contra 72/82/82 com — igual ou pior), e `experimental.inlineCss` (mediana
  caiu de 88 para 84,5 e trouxe CLS 0,012 de volta; revertido).
- **O que ganhou de verdade:** `content-visibility` + `contain-intrinsic-size` nas 5 seções
  altas levou CLS de 0,012 a **0** e o Speed Index de 4,6 s a 2,7 s; Swiper sob demanda
  (`next/dynamic` via wrapper client, porque `ssr: false` não é permitido em Server Component)
  levou a mediana de 74 para 82.
- **Lever ainda não explorado:** TBT ~350 ms vem de Script Evaluation na hidratação das ilhas
  do hero. Os overlays já não custam nada — verifiquei, eles não estão no DOM até abrir.

### Outros números

| Métrica | Resultado |
|---|---|
| Payload de fio, acima da dobra, mobile 375 DPR2 | **447 KiB** (meta do MANIFEST: 405) |
| Idem, desktop 1920 | **1.438 KiB** (meta: 1,51 MB) |
| Requests de mídia no mobile | **0** (hero gated a `min-width: 768px`) |
| Budgets de asset (`npm run budgets`) | 52 assets, **0 violações** |
| Assets em `public/` | 53 arquivos, 5,4 MB |
| Vazamento de terceiro em `final` (`npm run thirdparty`) | **nenhum possível** |
| reduced-motion, scroll parado | **maxDiff 0,0000 nas 10 seções**, 0 vídeos, Lenis não monta |
| Headers de segurança | HSTS preload · nosniff · Referrer-Policy · Permissions-Policy · CSP com `frame-ancestors`/`frame-src`/`media-src`/`img-src` |
| Chaves de copy | 239 PT / 239 EN, **espelhamento exato** |

---

## 5 · O que acontece quando você liga o modo `final`

O `draft` mostra o site com os assets do modelo estrutural para você avaliar a paridade. O
`final` os remove. **Vídeo de terceiro é omitido; imagem de terceiro cai no placeholder
blueprint** — regra uniforme, e ela existe porque a primeira versão do meu próprio modelo tinha
um furo: um poster marcado como "diferido" renderizaria o frame do modelo em produção
(DEC-017b).

Consequência honesta: **em `final`, hoje, o site volta a parecer vazio nas mídias.** As tabelas
completas de o-que-produzir estão em `docs/report-sections.md`, geradas do estado real por
`node scripts/gen-report.mjs` — geradas, e não escritas à mão, porque tabelas manuais
dessincronizam na primeira wave seguinte e o relatório passa a mentir.

Resumo do que destrava cada coisa:

| Grupo | Quantos | O que você precisa produzir |
|---|---|---|
| Vídeos | 9 slots + showreel | gravações SATTI; comandos ffmpeg 2-pass prontos por slot no `docs/report-sections.md` |
| Imagens de serviço | 3 | A7 do `docs/06-ASSETS-PIPELINE.md` |
| Mosaico da Automação | 12 | capturas de telas de produtos SATTI |
| Phones + mão | 3 | mockups + a foto da sua mão com o CallAudit aberto |
| Portfólio + cases | 9 | screenshots REAIS (nunca gerados — L6) |
| Texturas do banner | 2 | ou geradas proceduralmente, e aí saem da lista de terceiros |
| `[CONFIRMAR]` de copy | **36 campos** em 9 seções | ver a tabela completa em `docs/report-sections.md` |

**Dois grupos nunca entraram, nem em preview** (DEC-017), e a razão não é direito autoral de
composição: os **4 avatares de depoimento** são fotos de pessoas reais identificáveis que no
site da SATTI apareceriam como suas clientes, e os **selos de plataforma de review** afirmariam
uma avaliação que a SATTI não tem. Os **10 logos de cliente** do modelo também não: são marcas
vivas de empresas que não são suas clientes. No lugar deles: avatar blueprint, o slot de prova
social usando `hero.eyebrow`, e o marquee de logos com células de hairline e a legenda
`[SOMENTE com autorização]`.

---

## 6 · Decisões e reversões deste v2

Registradas em `DECISIONS.log.md`, DEC-015 a DEC-021. As que mudam o que você vê:

- **V2-D4 · a lei L2 ("máx. 1 elemento blaze por dobra") foi revogada** a seu pedido, em favor
  da paridade. Sobreviveu a metade que importa: **texto sobre band é sempre iron, nunca
  branco** — medido, iron sobre blaze dá 5,39:1 e passa AA; ink-on-dark dá 3,05:1 e reprova.
- **A faixa de posicionamento é TEXTO blaze de 231px sobre paper, não um bloco de cor.** Minha
  descrição original na pergunta que te fiz estava imprecisa: o CSS do modelo é `color` sem
  `background`. Implementada com `data-variant="text|band"` — trocar é um atributo.
- **O banner voltou a ser CLARO** (o v1 o pôs em graphite e registrou como divergência
  intencional; o modelo usa painel claro com raio de 130 px).
- **Os cards de serviço passaram a ser preenchidos por imagem** com texto claro, raio 7 px, com
  o tint SATTI virando underlay — a paleta por card sobrevive e é o fallback do modo `final`.
- **O portfólio toca vídeo por IntersectionObserver (threshold 0,35), não no hover** — o
  `09-MOTION-SPEC.md` mediu que é assim no modelo, e é posterior aos docs que diziam hover.
- **O pill de nav continua persistente** (no modelo ele sai com o scroll): divergência de uma
  propriedade em troca de navegação numa página de 14 mil px.
- **Não adotamos GSAP.** O grep dos bundles do modelo provou que **ScrollTrigger não está lá**
  (`scrub:` = 0, `pin:` = 0; o único hit é o stub de plugin-ausente do gsap-core) e que toda a
  coreografia de scroll deles é hand-rolled. Adotá-lo custaria ~30 KB gzip mais um `refresh()`
  forçando layout em ~12 triggers no init — a margem inteira do TBT.

### 12 erros no meu próprio spec pack, corrigidos antes de virarem código (DEC-021)

O `design/awsmd-ref/*.json` foi declarado fonte única das waves de seção. Uma leitura dos
bundles JS do modelo derrubou 12 afirmações dele, e quatro mudavam arquitetura: ScrollTrigger
não existe · nada é pinado (o que expôs o rail de 220vh do `ServicesDeck` como a maior violação
de paridade do v1, marcando 2,62) · o parallax de 3 colunas do mosaico e o da mão **não
existem** (a parede é estática e a mão é `position: sticky` — o diferencial medido era o
primeiro plano segurando) · e o fill-text deles é estático, o que **inverteu** uma instrução
anterior: o `clip-path` scrub da SATTI é melhoria, não erro.

---

## 7 · Como verificar tudo você mesmo

```bash
npm run verify        # build + typecheck + lint + budgets + thirdparty
npm run parity:dom    # 4 gates de paridade contra o modelo (~2 s)
npm run parity        # captura frame a frame + diff de distribuição (~5 min)
npm run parity:reduced
node scripts/gen-report.mjs > docs/report-sections.md
node scripts/smoke-prod.mjs https://site-satti.vercel.app
```

**Uma armadilha, que eu caí nela:** nunca rode `next build` com um `next start` servindo o mesmo
`.next`. Um chunk passa a responder 500 com MIME `text/plain`, a hidratação morre, nenhum client
component renderiza — e você mede uma página quebrada acreditando que otimizou. Eu comemorei 358
KiB de payload assim, e só percebi porque fui checar se os vídeos ainda tocavam.

---

## 8 · Estado do DoD

| # | Item | |
|---|---|---|
| 1 | 11 seções + 3 overlays, PT-BR + `/en` espelho | ✅ |
| 2 | Paridade verificada por harness em todos os breakpoints | ✅ 4/4 gates |
| 3 | Form funcionando com os 4 estados do DS | ✅ (degrada sem env) |
| 4 | Imagens no budget + slots de vídeo com poster e markup final | ✅ 52 assets, 0 violações |
| 5 | build/tsc/lint verdes + Lighthouse ≥ 90/95/95 | ⚠️ **A11y 100 e BP 100; Perf 88** |
| 6 | Deploy de produção ativo, domínio adicionado, DNS instruído | ✅ |
| 7 | Este relatório | ✅ |

**6 de 7.** O item 5 falha em Performance por 2 pontos, com a variância da medição maior que o
gap e o lever restante identificado (TBT de hidratação das ilhas do hero). Não vou registrar
como verde o que medi em 88.
