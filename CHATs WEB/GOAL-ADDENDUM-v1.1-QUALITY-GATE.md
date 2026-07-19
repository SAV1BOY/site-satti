# ADDENDUM v1.1 — GOLD-STANDARD QUALITY GATE · SATTI LOGO FACTORY

> **Para:** Codex · **Anexar ao** `GOAL-CODEX-LOGO-FACTORY.md` (v1 permanece válido; este adendo ALTERA o pipeline de aceitação e ORDENA a retomada).
> **Status:** geração pausada pelo decisor após revisão do lote F1-TA. Este documento define o padrão de qualidade obrigatório para retomar.

---

## 0 · DIAGNÓSTICO DO LOTE F1-TA (por que pausamos)

A revisão humana do primeiro lote confirmou que **paleta, flat, nó único e angularidade estão corretos** (o QA de pixel do GOAL v1 funcionou). O defeito está em **legibilidade da letra S**, que o QA de pixel não mede:

| Padrão de falha observado | Exemplos | Causa raiz |
|---|---|---|
| Caminho-labirinto que não lê como S | `TAv1_SI_s2` (lê como "G"/"4") | O modelo prioriza "continuous path" e abandona a letra |
| Linha fechando blocos retangulares (vira "tetromino") | `TAv2_SI_s2` | "line with bends" interpretado como contorno de blocos |
| Extensão horizontal que destrói a letra | `TAv8_*` | "horizontally extended proportion" sem teto de proporção |
| S quadrado que pode ler como dígito "5" | parte dos `TAv5/TAv6` | S digital sem terminais virados é ambíguo com 5 |

**Exemplos GOLD do próprio lote (manter como referência de barra):** `F1_TAv7_C1_SP_s1` (S chanfrado bold, nó deslocado — squint test perfeito), `F1_TAv6_C1_SI_s2` (nó central na esteira), `F1_TAv1_C1_SI_s1` (traço fino legível).

**Regra de ouro deste adendo:** uma imagem só é aprovada se **lê como a letra S em 1 segundo** (squint test). Tudo o mais é desperdício de curadoria.

---

## 1 · GOLD STANDARD — checklist de aceitação POR IMAGEM (símbolos)

Uma imagem é **GOLD (PASS)** somente se atender TODOS os critérios:

1. **S-legibilidade ≥ 8/10** — instantaneamente reconhecível como a letra S maiúscula (squint test de 1 segundo).
2. **Anti-5** — não confundível com o dígito 5 (terminais claramente virados: abertura superior-direita e inferior-esquerda).
3. **Nó único** — exatamente 1 círculo sólido blaze; nada mais em laranja (em SP/SI).
4. **Traço uniforme** — espessura constante, sem variação perceptível, sem falhas/emendas.
5. **Conformidade com a variante** — stroke/cantos/posição do nó batem com a tabela V do GOAL §3.2.
6. **Composição** — símbolo centrado, margem vazia ≥ 15% do canvas em todos os lados.
7. **Flat limpo** — zero gradiente/sombra/3D/ruído/texto fantasma/elemento extra; fundo chapado exato do esquema.
8. **QA de pixel v1 aprovado** — `bg_mismatch` e `blaze_ratio` do GOAL §6 continuam valendo.

Critérios 1–7 são julgados pelo **LLM-as-Judge (§2)**. Critério 8 permanece no QA de pixel existente. **Os dois gates são cumulativos.**

---

## 2 · LLM-AS-JUDGE — gate automático (SOTA)

Cada imagem gerada passa por um juiz de visão ANTES de entrar em `out/`. Modelo: `JUDGE_MODEL = os.getenv("JUDGE_MODEL", "gpt-4.1-mini")` (fallback `gpt-4o-mini`). Custo ≈ US$ 0,001/julgamento — irrelevante perto do custo de uma imagem ruim passar.

```python
JUDGE_MODEL = os.getenv("JUDGE_MODEL", "gpt-4.1-mini")

JUDGE_PROMPT_SYMBOL = """You are a strict brand-identity art director reviewing ONE candidate logo symbol.
Intended design: the capital letter S drawn as a single continuous angular automation/flow line,
flat 2D, solid plain background, with exactly ONE small solid orange circular node as the only accent.

Judge the image against the standard of a premium engineering brand (think Vercel/Linear-level craft).
Return ONLY a JSON object, no prose:
{
 "reads_as_S": true|false,
 "confusable_with_digit_5": true|false,
 "legibility_score": 0-10,
 "single_orange_node": true|false,
 "uniform_stroke": true|false,
 "centered_with_margins": true|false,
 "flat_clean": true|false,
 "verdict": "PASS"|"FAIL",
 "reason": "one short, specific, actionable sentence"
}
PASS requires: legibility_score >= 8 AND reads_as_S AND NOT confusable_with_digit_5
AND single_orange_node AND uniform_stroke AND centered_with_margins AND flat_clean."""

def judge_symbol(path: Path) -> dict:
    b64 = base64.b64encode(path.read_bytes()).decode()
    r = client.chat.completions.create(
        model=JUDGE_MODEL, temperature=0, max_tokens=220,
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": [
            {"type": "text", "text": JUDGE_PROMPT_SYMBOL},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}"}},
        ]}])
    return json.loads(r.choices[0].message.content)
```

**Judge para wordmarks/lockups (F2/F3):** mesma estrutura, trocando os campos de letra por
`"spells_exactly_SATTI": true|false` (S-A-T-T-I, 5 letras, dois T), `"uppercase": true|false`,
`"letterforms_clean": true|false` (sem glifos deformados/duplicados), mantendo nó/flat/margens.
PASS exige `spells_exactly_SATTI = true` — OCR do v1 vira redundância de segurança, não gate principal.

---

## 3 · LOOP GENERATE → JUDGE → CORRECT (substitui o `emit` simples do v1)

A partir de agora, **toda** geração usa o loop corretivo: em caso de FAIL, a regeneração recebe o motivo da falha como instrução cirúrgica no prompt.

```python
MAX_ATTEMPTS = 3

def emit_gold(phase, code, base_prompt, size, quality, scheme, kind, meta):
    """kind: 'symbol' | 'wordmark' | 'lockup' — escolhe o judge adequado."""
    last_reason = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        prompt = base_prompt if last_reason is None else (
            base_prompt
            + f" CRITICAL CORRECTION: the previous attempt was rejected by the art "
              f"director because: {last_reason}. Fix exactly this issue while keeping "
              f"every other constraint unchanged.")
        tmp = OUT / phase / f"{code}_a{attempt}.png"
        if not generate(prompt, size, tmp, quality):
            continue
        ok_px, px_fails = run_qa(tmp, scheme, has_word=(kind != "symbol"))
        j = judge_symbol(tmp) if kind == "symbol" else judge_lockup(tmp)
        if ok_px and j["verdict"] == "PASS":
            final = OUT / phase / f"{code}.png"
            tmp.rename(final)
            log_manifest(code, attempt, scheme, prompt, j, str(final), ok=True, **meta)
            return True
        last_reason = j.get("reason") or "; ".join(px_fails)
        rej = OUT / "_rejected" / f"{code}_a{attempt}.png"
        rej.parent.mkdir(parents=True, exist_ok=True)
        tmp.rename(rej)
        log_manifest(code, attempt, scheme, prompt, j, str(rej), ok=False, **meta)
        time.sleep(1.0)
    return False
```

Notas de implementação: (a) `N_SEEDS` deixa de multiplicar cegamente — cada `code` agora persegue **1 aprovação gold** em até 3 tentativas; quem quiser 2 aprovadas por código roda o code com sufixo `_b`; (b) o manifest ganha os campos `attempt`, `judge` (objeto completo) e `prompt_version: "1.1"`; (c) **nunca deletar rejeitadas** — são o dataset de calibração.

---

## 4 · RECALIBRAÇÃO CIRÚRGICA DOS PROMPTS (prompt_version 1.1)

### 4.1 Âncora de legibilidade (anexar a TODO prompt de símbolo, antes do BASE_STYLE)

```text
LEGIBILITY_ANCHOR = (
  "The shape must be instantly and unmistakably recognizable as the capital letter S "
  "at first glance (one-second squint test), in the spirit of a stencil or "
  "seven-segment display letter — never a maze, never an abstract path that hides the "
  "letter, never closed rectangular blocks. Both terminals must be clearly turned "
  "(opening at the top-right and at the bottom-left) so the mark can never be "
  "confused with the digit 5."
)
```

### 4.2 Correções por variante (substituem os valores do GOAL §4.2)

| Variante | Antes | Agora (v1.1) |
|---|---|---|
| v2 | "medium / sharp 90-degree" | + cláusula no descritor TA: `"the line is an open path tracing the letter, it must never close into rectangular blocks or loops"` |
| v8 | `proportion="horizontally extended proportion"` | `proportion="slightly wider stance while preserving clear letter proportions (maximum 1.3:1 width-to-height)"` |
| v6 | `node="at the center of the path"` | `node="sitting ON the middle horizontal stroke, like a station node on a conveyor line"` |

### 4.3 Reforço do nó (todas as variantes)

Trocar `"carrying exactly one small solid circular node"` por:
`"carrying exactly one small solid circular node (diameter ≈ 1.5× the stroke width — small accent, never a large ball)"`.

---

## 5 · RETRO-QA DO LOTE JÁ GERADO (não descartar trabalho)

1. Rodar `judge_symbol()` sobre **todas** as imagens existentes em `out/F1_symbols/`.
2. PASS → permanece; FAIL → mover para `out/_rejected/` com o objeto `judge` gravado no manifest (`retro_qa: true`).
3. Gerar contact sheet `contact-sheets/F1_TA_curated.png` apenas com as sobreviventes.
4. Reportar no REPORT a taxa de aprovação retroativa por variante (esperado: v7 alto; v8 próximo de zero) — isso valida a calibração.

---

## 6 · PILOTO DE CALIBRAÇÃO + GATE DE RETOMADA (ordem obrigatória)

**Proibido retomar o volume total antes de passar no piloto.**

1. **PILOTO:** gerar com prompts v1.1 + loop gold o conjunto `TA × {v1..v8} × {SP, SI}` = 16 códigos.
2. **Métrica:** taxa de aprovação em ≤ 3 tentativas por código.
3. **Gate:** aprovação ≥ 60% (≥ 10 de 16) → retomar tudo. Entre 40–60% → 1 rodada extra de ajuste de prompt (documentar o ajuste no REPORT) e repetir o piloto. < 40% → PARAR e reportar ao orquestrador com as 5 piores `reason` do judge.
4. **Após gate verde, executar na ordem:** F1 completo (TB, TC, TD com a mesma âncora de legibilidade adaptada — TB lê como S em blocos, TC como S em onda, TD como percurso-S de nós), F2 (judge de wordmark), F3 (judge de lockup), F4 (somente sobre aprovadas gold), F5 (sheets/report/index).

---

## 7 · MANIFEST E REPORT v1.1

- Manifest: novos campos obrigatórios `attempt`, `judge` (JSON completo do veredito), `prompt_version`, `retro_qa`.
- REPORT ganha a seção **"Calibração de qualidade"**: taxa PASS por território/variante/esquema, antes (retro-QA) vs. depois (v1.1), top-5 motivos de falha, custo total incluindo julgamentos.
- `index.html`: badge PASS dourado nas imagens gold; aba separada "rejeitadas" (com reason) para auditoria.

---

## 8 · DEFINITION OF DONE (adendo)

- [ ] Retro-QA executado em 100% do lote existente; curadas separadas das rejeitadas
- [ ] Piloto v1.1 executado e gate ≥ 60% atingido (ou escalado ao orquestrador)
- [ ] F1 completo: 4 territórios, **100% das imagens publicadas em `out/` são GOLD (PASS no judge + QA de pixel)**
- [ ] F2/F3/F4 executados com o loop gold e judges específicos
- [ ] Manifest com `judge` preenchido em todas as linhas; REPORT com a seção de calibração
- [ ] Zero imagem em `out/` (fora de `_rejected/`) que falhe o squint test — amostra humana final de 20 imagens confirma
- [ ] Branch `codex/logo-factory` atualizada; `app/` intocado

> **Resumo executivo para o Codex:** o volume continua sendo o objetivo (centenas), mas a partir de agora **nenhuma imagem entra na biblioteca sem passar pelo juiz**. Prefira 150 imagens gold a 300 mistas — a curadoria humana é o recurso mais caro do pipeline.
