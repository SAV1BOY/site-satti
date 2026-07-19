# [CODEX] AUDIT W3 — CONTINUAÇÃO (itens 2-11 + recheck S10)

Papel: auditor de gate. Modo: auditoria ESTÁTICA. NÃO rode npm/build/tsc/lint. NÃO faça git. Só edite `audits/W3-verdict.md`.

Contexto: duas execuções anteriores desta auditoria morreram por erro de sandbox. O `audits/W3-verdict.md` atual já contém o item 1 (Fidelidade §7.1) COMPLETO — NÃO refaça os sub-itens que já estão julgados. O FAIL bloqueante do item 1 (S10 Reviews) FOI CORRIGIDO: a seção foi refeita do zero fiel à comp (grade estática 3 cards paper — `components/sections/reviews/Reviews.tsx` + `.module.css`; ReviewsClient.tsx deletado).

## Sua tarefa (nesta ordem, escrevendo o verdict INCREMENTALMENTE após cada item)
1. **Recheck S10 apenas**: re-julgue a nova `components/sections/reviews/` contra `S10 Depoimentos Desktop 1920.dc.html` + `S10 Depoimentos Mobile 375.dc.html`. Atualize o item 1 do verdict: se S10 agora passa, item 1 vira PASS (mantenha a evidência existente das outras seções e acrescente a evidência nova da S10).
2. **Itens 2-11 do checklist original** (`tasks/codex/audit-W3.md` — leia lá as definições completas): paleta (2), blaze-law por viewport (3), circuit (4), copy-law (5), motion (6), Linha D3 (7), budgets/§8 (8), a11y (9), código L11 (10), i18n espelho (11). Grave o verdict após CADA item.
3. Ao final: veredito X/11, "FAILs acionáveis" (com severidade bloqueante/cosmético e correção proposta) e bloco "Divergências aceitas" (DEC-006..009 e cabeçalhos de CSS Modules).

Dica de resiliência: prefira POUCOS comandos de shell grandes (greps agregados) a muitos pequenos; leia arquivos inteiros de uma vez.
