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
