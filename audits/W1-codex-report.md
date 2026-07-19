# W1.1 — relatório de extração de copy e i18n

## Escopo concluído

- Copy PT-BR extraída das 14 fontes HTML desktop que representam as 15 comps S1–S11 e O1–O3 (S1+S2 compartilham um arquivo), usando somente a Var A de S3.
- Copy EN extraída de `Home EN Desktop 1920.dc.html`.
- Andaime de revisão descartado: asides Specs, placeholders de assets, `data-screen-label` e badges de motion.
- Overlays EN sem comp própria traduzidos e marcados com `machine_translated: true` nos nós `menu`, `contact` e `language`.
- Numeração canônica D5 aplicada às seções e ao menu nos dois idiomas; `What clients say` foi corrigido de 04 para 05.
- Infra `next-intl` criada sem integração em `app/`: locale padrão `pt-BR`, prefixo somente quando necessário e `/en` para inglês.

## Auditoria mecânica

- JSONs válidos: sim.
- Caminhos-folha por idioma: 271.
- Árvores e índices de arrays idênticos: sim (271 × 271, zero diferenças).
- Ocorrências de `[CONFIRMAR]`: 26 em PT-BR; 20 em EN.
- `git diff --check`: sem erros.
- Build/dev não executados e dependências não instaladas, conforme restrição da tarefa.
- O guia local de Next.js em `node_modules/next/dist/docs/` não estava disponível nesta worktree. Embora o Next.js 16 prefira `proxy.ts`, foi mantido `middleware.ts` por exigência explícita do handoff W1.

## Marcadores `[CONFIRMAR]` encontrados

### PT-BR

- `[CONFIRMAR fonte real]`
- `[CONFIRMAR]` (valores das quatro métricas de Sobre; tags/valores pendentes de Portfólio e Cases)
- `[CONFIRMAR label da métrica 01]`
- `[CONFIRMAR label da métrica 02]`
- `[CONFIRMAR label da métrica 03]`
- `[CONFIRMAR label da métrica 04]`
- `[CONFIRMAR 6º projeto público]`
- `[CONFIRMAR — copy do banner a definir]` — com o rascunho steel preservado em `draft`
- `[CONFIRMAR depoimento]`
- `[CONFIRMAR nome]`
- `[CONFIRMAR cargo · empresa]`
- `[CONFIRMAR mensagem de erro]`
- `[CONFIRMAR handle LinkedIn]`
- `[CONFIRMAR handle Instagram]`
- `© [CONFIRMAR ano] SATTI`

### EN

- `[CONFIRMAR]` (hero, métricas, tag e métricas de cases)
- `[CONFIRMAR 6th public project]`
- `[CONFIRMAR — banner copy TBD]` — com o rascunho steel preservado em `draft`
- `[CONFIRMAR quote]`
- `[CONFIRMAR name]`
- `[CONFIRMAR role · company]`
- `LinkedIn [CONFIRMAR]`
- `Instagram [CONFIRMAR]`
- Marcadores traduzidos de overlays, todos dentro de nós com `machine_translated: true`: `[CONFIRMAR LinkedIn handle]`, `[CONFIRMAR Instagram handle]` e `[CONFIRMAR error message]`.
