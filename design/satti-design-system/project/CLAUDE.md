# SATTI Design System — instruções do projeto

## Regra permanente de COPY (toda a SATTI)
Copy nunca é inventada. Ordem obrigatória para todo e qualquer texto:
1. Se existe no conteúdo oficial do projeto → aplicar **literal**.
2. Se não há versão final → marcar **[CONFIRMAR]** e exibir o rascunho do projeto/PRD como **sugestão em cinza visível** (token steel #6E7480, nunca iron/ink preto ou branco final).
3. **Jamais** texto editorial do modelo passando por oficial.

O texto sugerido provisório fica sempre visivelmente cinza (steel), nunca como copy final.

## Tokens do DS (fonte: "SATTI DS")
paper #F7F8FA · iron #15171B · graphite #0F1115 · steel #6E7480 · blaze #FF4D00 · circuit #2F6BFF · blaze-soft #FFE9DE · line #E3E6EB · ink-on-dark #F4F5F7 · error #B43A2F · success #15794B

- Tipografia: Display = Archivo (caps) · Body/UI = Inter · Técnica/mono = JetBrains Mono (uppercase, tracking +0.08em; exceção única = grafia oficial de marcas).
- Regra blaze: raro e caro — máx 1 elemento blaze de destaque por viewport/dobra, sempre com texto preto sobre ele. O marcador-eyebrow 8×8 não conta.
- Profundidade = hairlines 1px #E3E6EB + tints + glow; sombras quase zero.
- Estado base de captura = reduced-motion (animações estáticas, Linha de Automação 100% desenhada sem pulso).


## Handoff de Design → Build
Protótipo Claude Design → build Next.js + next-intl. 30 telas aprovadas (F2–F5). A partir daqui o código é a fonte da verdade: /en nasce do mesmo componente do PT, o responsivo nasce de um layout único com breakpoints, e a Var B (circuit) está ARQUIVADA (não vai pro código).

### Índice de telas (30 .dc.html)
- DESKTOP 1920 (14): S1+S2 Hero · S3 ValuesStrip Var A (paper) [oficial] · S3 Var B (circuit) [ARQUIVADA] · S4 Servicos · S5 Sobre · S6 Automacao · S7 Portfolio · S8 Banner · S9 CasesSlider · S10 Depoimentos · S11 Footer · O1 Menu Overlay · O2 Contato Overlay · O3 Idioma Overlay
- MOBILE 375 (14): S1+S2 Hero · S3 Var A · S3 Var B [ARQUIVADA] · S4 · S5 · S6 · S7 · S8 · S9 · S10 · S11 · O1 · O2 · O3
- EN (1): Home EN Desktop 1920 (espelho 1:1 do PT)
- SISTEMA: SATTI DS

### Checklist de [CONFIRMAR] (cravar antes/durante o build — mesmas posições no /en)
- [ ] HERO — texto do badge do vídeo A1
- [ ] S5 SOBRE — 4 métricas (projetos entregues / automações em produção / horas/mês economizadas / mensagens processadas): VALORES
- [ ] S7 WORK — 6º projeto público (5 cases já oficiais: CallAudit, Expediting Tracker, Portal Comercial, Funil quiz, Pipeline de reels–LS Interbank)
- [ ] S8 BANNER — statement oficial (rascunho cinza: “Número bom não mente: dado + IA = crescimento com método”)
- [ ] S9 CASES — métricas antes→depois dos 3 destaques
- [ ] S10 DEPOIMENTOS — 100% [CONFIRMAR]: quote + nome + cargo + foto de CADA depoimento (NUNCA inventar)
- [ ] S11 FOOTER — handle LinkedIn + handle Instagram (GitHub SAV1BOY já oficial)
- [ ] Logos de clientes — só com permissão por escrito

### Regra de copy (LEI)
1) existe oficial → literal; 2) sem versão final → [CONFIRMAR] + rascunho em cinza (steel #6E7480); 3) jamais texto editorial passando por oficial.

### Tokens travados
- Cores (9): paper #F7F8FA · iron #15171B · graphite #0F1115 · steel #6E7480 · blaze #FF4D00 · circuit #2F6BFF · blaze-soft #FFE9DE · line #E3E6EB · ink-on-dark #F4F5F7
- Feedback: error #B43A2F · success #15794B (só texto/borda/ícone)
- Tints S4: card1 #FFE9DE · card2 #E4EBFF · card3 #ECEEF2
- Tipo: Archivo (display) · Inter (body) · JetBrains Mono (eyebrows/tags/métricas)
- Grafia de marca: n8n · Next.js · Supabase · Evolution API · Claude / GPT · Python · PostgreSQL · Vercel
- Regras: 60/30/10 · blaze raro (1 destaque/viewport; marcador 8×8 não conta) · circuit só funcional · dots S9 mobile = blaze no ativo · O2 mobile = tela cheia.
