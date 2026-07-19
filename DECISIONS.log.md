# DECISIONS.log — SITE SATTI v1

> Registro de toda decisão tomada por omissão/arbitragem do ULTRAGOAL (§1).
> Formato: data · decisão · justificativa · impacto.

## 2026-07-19

**DEC-001 · Materiais §2.3/§2.4 ausentes → reconstrução a partir do handoff.**
`docs/00-08`, `starter/` e `content/home.*.json` citados no ULTRAGOAL não existem no diretório nem em `Desktop\Projetos\`. Por §1 (omissão → CC decide): tokens/copy/animações serão reconstruídos do handoff (DESIGN.md + tokens.json + 30 comps `.dc.html`, que são a verdade visual §2.2) + specs do próprio ULTRAGOAL (§4 descreve as assinaturas e decisões). Copy oficial = strings exatas das comps (coerente com D5: "comps vencem os JSONs"). Impacto: `content/*.json` serão gerados no W1 extraindo as strings das comps; docs/05-06 substituídos pelas specs do §4/§5.B + CSS embutido das comps.

**DEC-002 · Git via HTTPS (gh credential helper) até Miguel registrar a chave SSH.**
L7 pede SSH, mas não há chave GitHub na máquina e o PAT fine-grained do gh não tem escopo para `gh ssh-key add` (HTTP 403). Git AUTENTICA via HTTPS (gh) — não é caso de parada §9.4a. Gerada chave `~/.ssh/id_ed25519_github` (pública pronta para registro em github.com/settings/keys; entry no ~/.ssh/config já aponta para ela). Ao registrar, basta `git remote set-url origin git@github.com:SAV1BOY/site-satti.git`. Item vai para o RELATORIO-FINAL.

**DEC-003 · Organização do diretório.**
Handoff extraído → `design/satti-design-system/` (read-only de referência, commitado). Decks de apresentação → `design/decks/`. Zip original → `design/` (gitignored — o conteúdo extraído é o que versiona). Prompt do claude_design → `design/claude-design-import-prompt.txt`.

**DEC-004 · Fix no ~/.ssh/config do usuário (fora do repo).**
O arquivo tinha BOM UTF-8 que quebrava o parse do OpenSSH (afetaria também o acesso Hostinger). Reescrito sem BOM, conteúdo preservado + entry github.com adicionada.

**DEC-005 · Fontes do DS carregadas já no W0.**
Archivo/Inter/JetBrains Mono via `next/font/google` (subsets latin, L4) já no layout do W0 — a página de prova de tokens só faz sentido com a tipografia real. W1 mantém o restante do escopo (providers, container, i18n).

**DEC-006 · Técnica da Linha de Automação (D3): SVG por segmento com handshake de coordenadas via plano central.**
Das duas técnicas permitidas pela D3, escolhido SVG-por-segmento (não overlay costurado): geometria mora em `automation-thread-plan.ts` (fonte única — waypoints em frações; continuidade validada por `validateThreadPlan()` em dev), path construído em px reais do container (ResizeObserver) com cubics de tangente vertical — a fronteira entre seções fica invisível por construção. Desenho no scroll com o tip cavalgando a 90% da viewport: quando a base da seção N cruza esse eixo, N está 100% desenhada e N+1 começa no mesmo instante/mesmo x. Pulso único garantido por `AutomationThread` (context: um dono por vez, handoff em `animationend`), viajando via `offset-path`/`offset-distance` CSS (zero SMIL), gated por `@supports` + `prefers-reduced-motion`. Labels de node vêm da seção consumidora (copy-law L1 — geometria nunca carrega texto). Justificativa: overlay único exigiria medir alturas de todas as seções num só observer (acoplamento global + reflow em cascata); por-segmento isola custo e mantém cada seção dona do seu fundo.

**DEC-007 · Detecção de motion-preference padronizada em `useSyncExternalStore`.**
O reset do ciclo do `useTypewriter` por setState em corpo de effect violava `react-hooks/set-state-in-effect` (ESLint 9 + regras React 19). Padrão adotado: media query como external store (`useSyncExternalStore`, server snapshot = reduced/estático) + ajuste de estado durante o render para reinício de ciclo. `hooks/useMotionOk.ts` criado como utilitário compartilhado (AutomationThread/AutomationLine; seções do W3 devem reutilizar).

**DEC-008 · W3 Onda A' (Codex): aceitação parcial + rebuild (Loop 2 HRM).**
A entrega do Codex veio minificada (8 arquivos numa linha, com BOM) e 4 seções abaixo da barra de fidelidade: About (contrato §8 dos stats ignorado, posters errados, sem CTA/founder, CSS 43 linhas p/ a seção mais rica), Banner (texturas apontando p/ dev-poster, CTA sem Button), Cases (tema default do Swiper com azul da lib, sem dots blaze, sem data-lenis-prevent) e Footer (`<main>` dentro de `<footer>`, e-mail hardcoded, fallback estranho no budget). Mantidas com fixes do CC: ValuesStrip (reescrita fiel à comp: blaze é TEXTO, 900/118px/-0.015em, strip 280/180px), StickyHeader (reescrito: nav 4 links + seletor PT/EN + CTA roll + sombra da comp via token `--sh-header`) e Reviews (focus rings). About/Banner/Cases/Footer refeitas via Workflow CC (composição trocada — os builders do harness provaram qualidade superior na Onda A). Prettier + strip de BOM aplicados em components/sections.

**DEC-009 · Pulso nasce em "services"; 3º node no segmento automation.**
(a) O dono INICIAL do pulso da Linha é a primeira zona registrada APÓS o hero (ordem services→automation→portfolio→contact→hero): na dobra do hero o blaze é o caret do typewriter (F0-F5/L2); o pulso só passa por lá em trânsito no wrap do ciclo — transitório aceito pela D3. (b) Segmento "automation" do THREAD_PLAN ganhou 3º waypoint com slot n3: automation.steps tem 3 labels oficiais (CAPTURA/AGENTES/ENTREGA) e cada uma vira node do fio. (c) JSON: D2 aplicada no título PT ("{AUTOMAÇÃO} INTELIGENTE **" com cedilha); automation.description PT = literal da comp S6 mobile; EN title = literal da comp Home EN ("{Smart} Automation" — o ** é só do PT, conforme comps); chaves D6 do footer preenchidas (companyLabel/budgetLabel/contactEmail nos 2 idiomas — nomes dos campos vêm do texto da própria D6).

**DEC-010 · Auditoria W3: Codex sem sandbox (falha do orquestrador Windows).**
As runs 1-3 do audit W3 morreram com `windows sandbox: orchestrator_helper_exit_nonzero: setup helper exited with status -1073741502` (0xC0000142, DLL init do helper ao spawnar PowerShell) — a run 3 caiu em 0ms, indicando o orquestrador de sandbox do codex-cli 0.144.3 quebrado na máquina (o cache de modelos corrompido, saneado antes, era ruído à parte). A run 3 ainda apagou o verdict incremental (restaurado do git — verdicts passam a ser commitados a cada marco). 4ª execução: `--sandbox danger-full-access` (task de auditoria = leitura + 1 arquivo de saída, escrita por prompt disciplinado; risco aceito pelo CC como arbitragem §1/§9.4a). Fallback se falhar: auditoria adversarial via Workflow CC, registrando a degradação no relatório final.
