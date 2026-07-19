# BRIEF — TERRITÓRIO TE: "S-SPLIT HEX-NODE" (conceito do decisor) · 20 VARIAÇÕES GOLD

> **Para:** Codex · **Complementa** `GOAL-CODEX-LOGO-FACTORY.md` + `ADDENDUM v1.1`.
> **Origem:** desenho autoral do Miguel (decisor). Este território tem **prioridade sobre TA–TD** e substitui a fila atual de geração. Pipeline obrigatório: `emit_gold` do Addendum v1.1 (judge + correção, MAX_ATTEMPTS=3).

---

## 0 · VEREDITO DE CONFORMIDADE (lei para este território)

O conceito do decisor está **aprovado** contra a Constituição Visual, com 3 cláusulas:

1. **Hexágono liberado COMO NÓ-PORCA** — exceção registrada: a proibição do GOAL §2.2 vale para hexágono-contêiner/colmeia (clichê de IA). Aqui o hexágono é um **nó pequeno flat-top no meio do traço, lendo como porca/junta de máquina de precisão** (diâmetro ≈ 1,8–2,2× a espessura do traço). Hexágono grande, moldura hexagonal ou padrão de favos = FAIL.
2. **Interior do nó = APENAS o risco** — uma única barra diagonal a 45° na cor do fundo, cortando o hexágono (o fluxo atravessa o nó). **Estrela, sparkle de 4 pontas, raio/lightning bolt, seta ou qualquer glifo dentro do nó = FAIL imediato** (clichês banidos pela pesquisa: sparkle = ambíguo/saturado; raio = território Supabase).
3. **Split bicolor com hairline** — quando o S for metade grafite + metade off-white, a metade que coincide com a cor do fundo recebe **contorno hairline fino na cor oposta** (linguagem de desenho técnico do design system). Metade invisível fundida ao fundo = FAIL.

A dosagem do laranja (pontas + nó vs. acento único) é **eixo de teste**, não regra: os blocos B e C existem para o decisor comparar a disciplina da regra D6 contra o conceito integral.

---

## 1 · SPEC GEOMÉTRICA DO TE (descrição canônica)

- **Letra:** S maiúsculo, bold, construído como caminho grosso quadrado de **duas metades-gancho espelhadas** que se encontram no centro exato da marca. Cantos externos **chanfrados a 45°**. Terminal superior à direita (abertura para a esquerda em cima) e terminal inferior à esquerda (abertura para a direita embaixo) — anti-dígito-5 garantido pelos dois terminais virados.
- **Nó central:** hexágono regular **flat-top** (lado horizontal em cima), pequeno (1,8–2,2× o stroke), interrompendo o traço no ponto de encontro das metades; atravessado por **um risco diagonal de 45°** na cor do fundo.
- **Pontas (quando laranja):** chanfro 45° em blaze `#FF4D00`, separado do corpo por um **gap fino na cor do fundo** (notch de sinalização industrial).
- **Split (quando bicolor):** metade superior grafite `#15171B`, metade inferior off-white `#F7F8FA`; hairline na metade camuflada (cláusula 3).
- **Proporção:** compacta (~1:1), exceto v20 (1.2:1). Margens ≥ 15%. Flat absoluto (GOAL §2.1 D7–D9).

---

## 2 · TABELA DAS 20 VARIAÇÕES (códigos `F1_TEv01`–`F1_TEv20`)

| Código | Fundo | Corpo do S | Pontas | Nó hexagonal | Peso |
|---|---|---|---|---|---|
| **BLOCO A — conceito integral do decisor** |||||
| TEv01 | `SP` off-white | split grafite/off-white + hairline | blaze | blaze + risco | bold |
| TEv02 | `SI` grafite | split + hairline | blaze | blaze + risco | bold |
| TEv03 | `SP` | split + hairline | blaze | blaze + risco | médio |
| TEv04 | `SI` | split + hairline | blaze | blaze + risco | médio |
| TEv05 | `SP` | split + hairline | blaze | blaze **pointy-top** + risco (comparação) | bold |
| TEv06 | `SI` | split + hairline | blaze | blaze flat-top **maior** (2,6× stroke) + risco | bold |
| **BLOCO B — acento único (regra D6 fiel: laranja SÓ no nó)** |||||
| TEv07 | `SP` | mono grafite | chanfro limpo (cor do corpo) | blaze + risco | bold |
| TEv08 | `SI` | mono off-white | chanfro limpo | blaze + risco | bold |
| TEv09 | `SP` | mono grafite | chanfro limpo | blaze + risco | médio |
| TEv10 | `SI` | mono off-white | chanfro limpo | blaze + risco | médio |
| **BLOCO C — laranja só nas pontas (nó neutro)** |||||
| TEv11 | `SP` | mono grafite | blaze | grafite + risco off-white do fundo | bold |
| TEv12 | `SI` | mono off-white | blaze | off-white + risco grafite do fundo | bold |
| TEv13 | `SP` | split + hairline | blaze | grafite + risco | bold |
| TEv14 | `SI` | split + hairline | blaze | off-white + risco | bold |
| **BLOCO D — split protagonista (sem pontas laranja)** |||||
| TEv15 | `SP` | split + hairline | chanfro limpo | blaze + risco | bold |
| TEv16 | `SI` | split + hairline | chanfro limpo | blaze + risco | bold |
| **BLOCO E — sistema** |||||
| TEv17 | avatar: quadrado grafite, padding de app-icon | mono off-white | blaze | blaze + risco | bold, legível a 32 px |
| TEv18 | `SP` | **1-cor total grafite** (robustez gravação) | chanfro limpo | hexágono vazado (só contorno grafite) + risco | bold |
| TEv19 | `SI` | **1-cor total off-white** | chanfro limpo | hexágono vazado (contorno off-white) + risco | bold |
| TEv20 | `SI` | split + hairline ("hero" de capa) | blaze | blaze + risco | bold, proporção 1.2:1 |

---

## 3 · TEMPLATES DE PROMPT (gpt-image-1 · inglês · `prompt_version: "TE-1.0"`)

### 3.1 Cláusulas parametrizadas

```python
BG = {"SP": "cool off-white (#F7F8FA)", "SI": "deep dark graphite (#15171B)",
      "AV": "deep dark graphite (#15171B)"}

HALVES = {
 "split":      ("The upper half of the S is solid dark graphite (#15171B) and the "
                "lower half is solid cool off-white (#F7F8FA). The half whose color "
                "matches the background carries a thin hairline outline in the "
                "opposite color so it remains clearly visible."),
 "mono_iron":  "The whole S is solid dark graphite (#15171B).",
 "mono_paper": "The whole S is solid cool off-white (#F7F8FA).",
}

TIPS = {
 "blaze": ("The top-right terminal and the bottom-left terminal end in 45-degree "
           "chamfered tips filled with industrial orange (#FF4D00), each tip "
           "separated from the main stroke by a very thin gap in the background "
           "color, like industrial signal markings."),
 "clean": "Both terminals end in clean 45-degree chamfered cuts in the same color as the stroke.",
}

NODE = {
 "blaze_flat":   "a small flat-top regular hexagon node in solid industrial orange (#FF4D00)",
 "blaze_pointy": "a small pointy-top regular hexagon node in solid industrial orange (#FF4D00)",
 "blaze_big":    "a flat-top regular hexagon node in solid industrial orange (#FF4D00), slightly larger (about 2.6x the stroke width)",
 "iron":         "a small flat-top regular hexagon node in solid dark graphite (#15171B)",
 "paper":        "a small flat-top regular hexagon node in solid cool off-white (#F7F8FA)",
 "hollow_iron":  "a small flat-top regular hexagon node drawn as a thin graphite outline only (hollow center)",
 "hollow_paper": "a small flat-top regular hexagon node drawn as a thin off-white outline only (hollow center)",
}

WEIGHT = {"bold": "very thick bold stroke", "medium": "medium-weight stroke"}
```

### 3.2 Template canônico

```python
def PROMPT_TE(bg, halves, tips, node, weight, extra=""):
    return (
      f"Bold angular logo symbol, perfectly centered on a solid {BG[bg]} background "
      f"filling the entire canvas: the capital letter S constructed as one {WEIGHT[weight]} "
      f"squared path with 45-degree chamfered outer corners, formed by two mirrored "
      f"hook-shaped halves that meet at the exact center of the mark. {HALVES[halves]} "
      f"At the meeting point the stroke is interrupted by {NODE[node]}, like a precision "
      f"machine nut, crossed by exactly one thin straight 45-degree diagonal slash in "
      f"the background color, so the flow line visually cuts through the node. "
      f"{TIPS[tips]} {extra} "
      f"The mark must be instantly recognizable as a capital letter S at first glance "
      f"(one-second squint test) — the top terminal opens at the top-right and the "
      f"bottom terminal opens at the bottom-left, so it can never be confused with the "
      f"digit 5. The hexagon node is small (about twice the stroke width) and is the "
      f"only geometric interruption. STRICTLY FORBIDDEN inside or around the node: "
      f"stars, four-pointed sparkles, lightning bolts, arrows, letters or any glyph — "
      f"only the single diagonal slash. Flat 2D vector style, sharp clean edges, "
      f"generous margins of at least 15% on all sides, no gradients, no shadows, no "
      f"3D, no texture, no extra elements, no text, no watermark, no border."
    )
```

### 3.3 Mapeamento código → parâmetros

```python
TE_MATRIX = {
 "TEv01": ("SP","split","blaze","blaze_flat","bold",""),
 "TEv02": ("SI","split","blaze","blaze_flat","bold",""),
 "TEv03": ("SP","split","blaze","blaze_flat","medium",""),
 "TEv04": ("SI","split","blaze","blaze_flat","medium",""),
 "TEv05": ("SP","split","blaze","blaze_pointy","bold",""),
 "TEv06": ("SI","split","blaze","blaze_big","bold",""),
 "TEv07": ("SP","mono_iron","clean","blaze_flat","bold",""),
 "TEv08": ("SI","mono_paper","clean","blaze_flat","bold",""),
 "TEv09": ("SP","mono_iron","clean","blaze_flat","medium",""),
 "TEv10": ("SI","mono_paper","clean","blaze_flat","medium",""),
 "TEv11": ("SP","mono_iron","blaze","iron","bold",""),
 "TEv12": ("SI","mono_paper","blaze","paper","bold",""),
 "TEv13": ("SP","split","blaze","iron","bold",""),
 "TEv14": ("SI","split","blaze","paper","bold",""),
 "TEv15": ("SP","split","clean","blaze_flat","bold",""),
 "TEv16": ("SI","split","clean","blaze_flat","bold",""),
 "TEv17": ("AV","mono_paper","blaze","blaze_flat","bold",
           "Composed as a square app icon with extra generous padding, designed to stay perfectly legible at 32 pixels."),
 "TEv18": ("SP","mono_iron","clean","hollow_iron","bold",""),
 "TEv19": ("SI","mono_paper","clean","hollow_paper","bold",""),
 "TEv20": ("SI","split","blaze","blaze_flat","bold",
           "The letter has a slightly extended horizontal stance (about 1.2:1 width to height), hero composition."),
}
# Tamanho: 1024x1024 para todos. Quality: "high" (lote pequeno e decisivo).
```

---

## 4 · JUDGE ATUALIZADO PARA O TE (substitui o judge de símbolo NESTE lote)

O judge recebe a spec da variante (linha da TE_MATRIX) injetada no prompt — ele valida CONFORMIDADE COM A SPEC, não gosto pessoal.

```python
JUDGE_PROMPT_TE = """You are a strict brand-identity art director reviewing ONE candidate logo symbol
against an exact spec. Intended design: a bold angular capital letter S made of two mirrored halves
meeting at a small flat-top hexagonal machine-nut node crossed by one diagonal slash.

VARIANT SPEC (must match): {spec_line}

Return ONLY JSON:
{
 "reads_as_S": true|false,
 "confusable_with_digit_5": true|false,
 "legibility_score": 0-10,
 "hexagon_node_correct": true|false,        // small flat-top hexagon (pointy-top/large ONLY if spec says so); diamonds/circles = false
 "slash_through_node": true|false,          // exactly one thin 45° slash in background color
 "forbidden_glyph_inside_node": true|false, // ANY star/sparkle/bolt/arrow/letter inside node => true => FAIL
 "color_spec_match": true|false,            // body/tips/node colors match the variant spec exactly (incl. hairline on camouflaged half when split)
 "uniform_stroke": true|false,
 "centered_with_margins": true|false,
 "flat_clean": true|false,
 "verdict": "PASS"|"FAIL",
 "reason": "one short, specific, actionable sentence"
}
PASS requires: legibility_score >= 8, reads_as_S, NOT confusable_with_digit_5,
hexagon_node_correct, slash_through_node, NOT forbidden_glyph_inside_node,
color_spec_match, uniform_stroke, centered_with_margins, flat_clean."""
```

QA de pixel: manter `qa_background`; **adaptar `qa_blaze_ratio`** por bloco — Blocos A/C/E-v17/v20: 0,5%–14%; Bloco B: 0,1%–6%; v18/v19: ~0%.

---

## 5 · EXECUÇÃO

1. Pasta `out/F1_TE/` · códigos `F1_TEv01..20` · `emit_gold` com `MAX_ATTEMPTS=3` e correção textual da `reason`.
2. Quality `high` em todo o lote (20 códigos é lote de decisão, não de exploração).
3. Ao final: `contact-sheets/F1_TE.png` (grade 4×5, células 512 px com código legendado) + mini-REPORT com taxa PASS por bloco e as `reason` de toda falha.
4. **Sem gate de piloto:** o lote inteiro É o piloto. Se PASS < 50% (10/20), parar e reportar as 5 piores reasons ao orquestrador em vez de insistir.
5. Manifest: `territory:"TE"`, `block:"A|B|C|D|E"`, `prompt_version:"TE-1.0"`, objeto `judge` completo.

## 6 · DEFINITION OF DONE

- [ ] 20 códigos processados; tudo publicado em `out/F1_TE/` é GOLD (judge PASS + QA pixel)
- [ ] Zero estrela/sparkle/raio dentro do nó em qualquer aprovada (inspeção humana de 100% do lote — são só 20)
- [ ] Contact sheet + mini-REPORT entregues
- [ ] Rejeitadas preservadas em `_rejected/` com reason
- [ ] Branch `codex/logo-factory` atualizada; nada fora de `branding/logo-factory/` tocado
