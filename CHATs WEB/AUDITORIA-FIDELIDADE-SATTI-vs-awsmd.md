# Auditoria de Fidelidade — MVP SATTI Design × awsmd.com

> Base: 31 telas `.dc.html` do pacote SATTI_Design_System vs. o AWSMD Site Experience Atlas (621 linhas, 107 evidências). Análise por leitura de fonte (pixel/código), não por screenshot.

## Veredito em uma linha

| Eixo | Nota | Resumo |
|---|---|---|
| **Fidelidade de paleta** | **9,8/10** | 9 tokens oficiais corretos; extras são derivações disciplinadas dos tints, não deriva |
| **Fidelidade de tipografia** | **10/10** | Archivo + Inter + JetBrains Mono, pesos certos, 31/31 telas, grafia de marca respeitada |
| **Semelhança estrutural c/ awsmd** | **9,5/10** | 11 seções na ordem do Atlas + ritmo claro/escuro + placeholders nas posições/dimensões exatas |
| **Semelhança funcional c/ awsmd (protótipo)** | **7,5/10** | Estrutura e estados-chave presentes; falta runtime (scroll-driven, vídeo real, Swiper, Lenis) — que é trabalho de BUILD |
| **Prontidão para virar o site awsmd-like** | **alta** | Nenhuma lacuna estrutural; o que falta é implementação em Next.js, já prevista no roadmap |

**Conclusão:** como *protótipo de design*, está pronto e fiel. A distância entre 7,5 e 10 na coluna funcional **não se fecha no Claude Design — fecha-se no build** (Next.js + Lenis + Swiper + vídeo real). O MVP não "falhou" em nada; ele é um protótipo de altíssima fidelidade, e protótipo não roda animação scroll-driven nem reproduz vídeo de verdade por natureza.

---

## Mapa seção-a-seção: MVP × Atlas awsmd

Legenda: ✅ presente e fiel · 🟡 presente como estático/anotação (vira runtime no build) · ⬜ ausente por decisão (PRD) · ❌ ausente por lacuna

| # | Seção awsmd (Atlas) | SATTI tem? | Estrutura | Vídeo/Mídia | Animação | Observação |
|---|---|---|---|---|---|---|
| 00 | Header fixo + nav + menu + idioma + painel | ✅ | ✅ pixel-fiel (barra ~1858×66) | — | 🟡 header 2 estados (ghost→blaze) anotado | Overlays O1/O2/O3 existem como telas |
| 01 | Hero vídeo + H1 + typing + badge + scroll-cue | ✅ | ✅ 3 linhas, caret retângulo | 🟡 slot A1 (vídeo real no build) | ✅ caret-blink + cue-ping = CSS real | Showreel Vimeo ⬜ (decisão SATTI: só se houver real) |
| 02 | Faixa posicionamento (marquee azul) | ✅ | ✅ Var A (paper) oficial + Var B (circuit) arquivada | — | ✅ `@keyframes marquee` 20s real | Decisão de blaze raro respeitada |
| 03 | Services — 3 cards sobrepostos + scaler | ✅ | ✅ 604×653, sobreposição ~40px, tints | 🟡 A7 (3 imgs) | ✅ `s4-zoom` (scale 1→1.2) + hover handlers reais | Copy oficial aplicada |
| 04 | About — fill-text + 4 stat-vídeos + diagrama + logos | ✅ | ✅ completo | 🟡 A2–A5 (4 vídeos) + LG1–6 logos | 🟡 fill-text + `node-pulse` + `logos-marquee` 24s | Diagrama 10 nodes / raios 100·68·42% confirmado na config |
| 05 | {SMART} Development dark — phones + mosaico 3×4 + mão | ✅ | ✅ graphite, mosaico (mobile 2-col) | 🟡 PH-L/R, SC1–10, A6, A9 | ✅ `floatL/floatR` (6s, fases ±) real | Linha de Automação atravessa (assinatura SATTI > awsmd) |
| 06 | Portfolio — 6 cards + glow hover | ✅ | ✅ 6 work-cards 720px (520 mobile) | 🟡 WK-1–6 (3 viram vídeo real) | ✅ **glow blaze blur(90px) + hover handlers REAIS** | 5 cases reais + 6º [CONFIRMAR] |
| 07 | Banner Data Science (texturas inline) | ✅ | ✅ statement 4 linhas | 🟡 A8 ×2 texturas inline | — (estático no Atlas também) | Statement [CONFIRMAR] + rascunho cinza |
| 08 | Latest Cases — Swiper + busca | ✅ | ✅ slider 1-col + dots + prev/next | 🟡 S9-IMG-1–5 | 🟡 scroll-snap (Swiper real no build) | Busca ⬜ (PRD removeu de propósito) |
| 09 | Reviews — Swiper 4 depoimentos | ✅ | ✅ carrossel + aspas + dots | 🟡 AVATAR-1–3 | 🟡 controles | **100% [CONFIRMAR]** — nada inventado (correto) |
| 10 | Footer parallax + form | ✅ | ✅ hat + form 4 estados de input | — | 🟡 parallax anotado | Form nativo (vs Google Forms do awsmd) = melhoria |

**Cobertura estrutural: 10/10 seções mapeadas. Lacunas reais (❌): zero.** As únicas ausências são por decisão consciente (showreel, busca) ou são runtime de build (próxima seção).

---

## A diferença entre 7,5 e 10 funcional: o que é "estático no protótipo" e vira "vivo no build"

O awsmd é fiel porque **roda no navegador**: Lenis dá o scroll pesado, vídeos tocam, Swiper desliza, animações disparam por posição de scroll. Um protótipo de design (`.dc.html` no Claude Design) **não é um app** — ele representa telas. Isso explica 100% da distância. O que está como 🟡 não está "faltando"; está **especificado e aguardando implementação**:

| Função awsmd | Estado no MVP | O que falta (= tarefa de build) |
|---|---|---|
| Smooth scroll (Lenis) | anotado nas specs | `LenisProvider` em Next.js (já no starter do projeto) |
| Vídeo hero + stat-cards + portfólio tocando | slots placeholder com dimensões | produzir mídia (pipeline GPT→VEO→ffmpeg) + `<video>` real |
| Animações scroll-driven (fill-text, parallax, linha desenhando) | keyframes CSS + anotação | conectar a `IntersectionObserver`/scroll progress no React |
| Swiper (cases + reviews) | grid/scroll-snap estático + dots | instanciar Swiper real (dep. já no projeto) |
| Cursor custom (mouse-follower) | — | `CursorProvider` (planejado na arquitetura) |
| Hover de vídeo no portfólio | **glow já é hover real**; vídeo é placeholder | trocar placeholder por `<video>` play-on-hover |
| Typewriter | caret pisca (CSS real) | hook `useTypewriter` (já existe no starter) cicla as palavras |

**Tradução:** o protótipo entregou tudo que um protótipo pode entregar — e mais (vários hovers e marquees já são CSS/handlers reais, não mocks). O resto é exatamente o escopo das fases F1–F3 do roadmap de build.

---

## O que já está MELHOR que o awsmd (correções do estudo embutidas)

1. **Form nativo** (Resend + n8n) no lugar do `/brief → Google Forms` da referência.
2. **Linha de Automação** como fio condutor do site inteiro — o awsmd só tem a `dev-line` numa seção; é assinatura SATTI superior.
3. **Copy nunca inventada** — disciplina de `[CONFIRMAR]` que a referência não tem (e métricas reais como meta).
4. **Acessibilidade** — contraste AA validado (error #B43A2F 5.51:1, success #15794B 5.11:1), reduced-motion em tudo, foco visível. O Atlas aponta que o awsmd usa `alt="logo"` genérico e px fixo.
5. **Performance por design** — budgets de mídia definidos (o awsmd carrega 10,6 MB de vídeo autoplay; o SATTI tem teto de 1,2 MB no hero e play-on-hover no portfólio).
6. **Um só app, sem CMS** (o awsmd usa 2 apps Next + Strapi para 4 reviews).

---

## Lacunas reais a registrar (pequenas, e nenhuma estrutural)

| Item | Severidade | Nota |
|---|---|---|
| Home EN só em desktop (sem mobile-EN, sem overlays /en) | baixa | Decisão consciente do gate F5: no build, next-intl gera /en do mesmo componente responsivo. Gerar agora seria descartado. |
| Var B (circuit) ocupa 2 telas | nenhuma | Arquivada por decisão; não vai pro código. |
| Vídeos/imagens são placeholders | esperada | Por design — o decisor produz a mídia própria. |
| `[CONFIRMAR]`: 8 itens (badge hero, 4 métricas, 6º case, banner, métricas cases, depoimentos, handles) | esperada | Dependem de dados reais do Miguel, não de design. |

---

## Recomendação

**Aprovar o protótipo como fechado.** Ele é fiel à paleta, à tipografia e — estruturalmente — ao awsmd, com várias melhorias deliberadas. A nota funcional 7,5 não indica trabalho mal-feito: indica que **a metade viva da fidelidade awsmd mora no código**, e o protótipo não tem como expressá-la. 

**Próximo passo para fechar a distância até 10:** abrir o build em Next.js a partir do `08-ROADMAP.md` (F0→F6), onde Lenis, Swiper, os hooks de animação e os `<video>` reais transformam os 🟡 em ✅. É lá — e só lá — que o site fica "praticamente com as mesmas funções e funcionalidades do awsmd". O protótipo é o blueprint correto e completo para essa construção.
