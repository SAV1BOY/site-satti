# ADDENDUM TE-v2 — PRECISÃO GEOMÉTRICA · "S-SPLIT HEX-NODE"

> **Para:** Codex · **Substitui** os templates do `BRIEF-TE` (a TE_MATRIX e os blocos A–E continuam valendo; o MÉTODO de geração muda).
> **Status:** lote TE-1.0 reprovado pelo decisor por infidelidade geométrica. Este adendo corrige a spec e troca o método principal.

---

## 0 · DIAGNÓSTICO DO LOTE TE-1.0 (erros confirmados pelo decisor)

| # | Erro observado | O que a spec exige |
|---|---|---|
| E1 | Metade inferior virou **wireframe/contorno vazio**; metade superior sólida → peso desigual, simetria quebrada | As duas metades são a MESMA forma sólida, com o MESMO peso — a inferior é a superior **girada 180°** (simetria rotacional pontual) |
| E2 | Hexágono **deslocado/flutuando** entre as metades | As duas metades **convergem no hexágono**, no centro exato da marca |
| E3 | Faltam as **pontas triangulares** e o **corte-lâmina** | Cada metade afunila em **ponta de seta triangular** apontando para o hexágono; **um único corte diagonal a 45°** atravessa ponta → hexágono → ponta, como uma lâmina que fatiou o S |

**Causa raiz:** text-to-image não resolve geometria relacional precisa (tangências, rotação exata, pesos iguais). Não insistir no mesmo método: a partir de agora o território TE é executado pelo **Trilho A (SVG paramétrico — principal)**, com o **Trilho B (image-edit com referência visual)** como complemento estilístico. Prompts textuais reescritos ficam no §4 para uso pontual.

---

## 1 · SPEC GEOMÉTRICA CANÔNICA v2 (a única verdade do TE)

Construção em ordem (canvas 1024×1024, centro C = (512, 512)):

1. **Metade superior** — banda grossa (stroke sólido preenchido, largura `W ≈ 130–150 px`) que percorre: terminal externo no canto **superior-direito** → barra horizontal superior para a esquerda → desce pela lateral esquerda → retorna horizontal para a direita no nível do centro → **afunila em ponta triangular** (ponta de seta) apontando para C. Cantos externos **chanfrados a 45°**.
2. **Metade inferior** = metade superior **rotacionada 180° em torno de C**. Nada é desenhado à mão livre: é a mesma geometria girada (terminal externo termina no canto inferior-esquerdo; a ponta triangular aponta para C pela direita... rotação cuidará de tudo).
3. **Nó central** — hexágono regular **flat-top**, circunraio `H ≈ 0.9–1.1 × W`, centrado em C. As duas pontas triangulares **quase tocam** os lados esquerdo/direito do hexágono (gap = `G`, abaixo).
4. **Corte-lâmina** — UMA reta diagonal a **45°** passando por C, materializada como **gap na cor do fundo** de espessura `G ≈ 0.18–0.25 × W`, que corta: a ponta superior, o hexágono (o "risco") e a ponta inferior. É o único corte; nenhuma outra interrupção.
5. **Pontas terminais (quando laranja)** — chanfro 45° em blaze `#FF4D00`, separado da banda por gap fino (`≈ 0.10 × W`) na cor do fundo.
6. **Cores por variante** — conforme TE_MATRIX do BRIEF. **Cláusula anti-E1:** no split, a metade camuflada (cor ≈ fundo) é **forma sólida preenchida + hairline de contorno** (1.5–2 px) na cor oposta — JAMAIS wireframe oco.
7. **Invariantes de aceitação:** silhueta com simetria rotacional 180° (IoU ≥ 0.96 no QA §5); S legível em 1 s; anti-dígito-5 pelos dois terminais virados; margens ≥ 15%; flat absoluto.

---

## 2 · TRILHO A (PRINCIPAL) — GERADOR SVG PARAMÉTRICO

O Codex implementa `te_generator.py`: desenha a metade superior por coordenadas, gera a inferior por `rotate(180, 512, 512)`, posiciona hexágono + corte por máscara, aplica o mapa de cores da variante e exporta **SVG + PNG** (cairosvg ou resvg). Sem API de imagem, sem alucinação, simetria perfeita por construção.

```python
# te_generator.py — esqueleto (implementar completo)
import math
from pathlib import Path
import cairosvg

CANVAS, C = 1024, 512
PAPER, IRON, BLAZE = "#F7F8FA", "#15171B", "#FF4D00"

def half_path(W=140, taper=110):
    """Path da metade superior: terminal sup-dir -> barra -> descida esq ->
    retorno horizontal -> ponta triangular apontando ao centro.
    Retorna string 'd' com chanfros 45° (cada canto externo = 2 pontos)."""
    # ... construir lista de pontos e converter em polygon/path ...

def hexagon(cx, cy, r):
    pts = [(cx + r*math.cos(math.radians(60*i - 30)),
            cy + r*math.sin(math.radians(60*i - 30))) for i in range(6)]  # flat-top
    return pts

def blade_mask(G=30):
    """Retângulo fino rotacionado 45° em torno de C, usado como <clipPath>/gap
    na cor do fundo, atravessando ponta-hexágono-ponta."""

def render_variant(code, bg, halves, tips, node, weight):
    top    = f'<path d="{half_path()}" fill="{COLOR_TOP[halves]}" {hairline(halves,"top",bg)}/>'
    bottom = f'<g transform="rotate(180 {C} {C})"><path d="{half_path()}" ' \
             f'fill="{COLOR_BOT[halves]}" {hairline(halves,"bot",bg)}/></g>'
    hexn   = hex_svg(node)                      # sólido | vazado, cor da variante
    blade  = f'<rect ... transform="rotate(45 {C} {C})" fill="{BG[bg]}"/>'
    tipsvg = tip_svg(tips)                      # chanfros blaze + gap, e o 180° do par
    svg = f'<svg viewBox="0 0 1024 1024">{rect_bg}{top}{bottom}{tipsvg}{hexn}{blade}</svg>'
    Path(f"out/F1_TE/{code}.svg").write_text(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f"out/F1_TE/{code}.png",
                     output_width=1024, output_height=1024)

for code, params in TE_MATRIX.items():          # mesma matriz do BRIEF-TE
    render_variant(code, *params)
```

Regras do Trilho A: (a) a ordem de pintura põe o **corte-lâmina por cima** de pontas+hexágono para garantir o gap contínuo; (b) `tips` laranja são polígonos separados (gap fino entre tip e banda); (c) exportar **SVG e PNG** — o SVG já é candidato a arquivo oficial; (d) rodar judge + QA (§5) sobre os PNGs normalmente.

---

## 3 · TRILHO B (COMPLEMENTO) — IMAGE-EDIT COM REFERÊNCIA VISUAL

Para texturas/acabamentos estilizados (apresentações, hero do site), usar `images.edit` com **imagem de referência** em vez de texto puro:

```python
ref = open("refs/logo_mvp.png", "rb")            # desenho original do decisor
r = client.images.edit(
    model="gpt-image-1", image=ref, size="1024x1024", quality="high",
    prompt=("Redraw this exact logo geometry as a clean flat 2D vector-style mark, "
            "preserving EXACTLY: the 180-degree rotational symmetry, the two solid "
            "equal-weight halves, the triangular arrowhead tips meeting the central "
            "flat-top hexagon, the single 45-degree blade cut through tip-hexagon-tip, "
            "and the orange chamfered terminals. Only refine edge quality and apply "
            "this color spec: {spec}. Do not move, resize, add or remove any element."))
```

Inputs de referência: `logo_mvp.png` (desenho do Miguel) e, após o Trilho A rodar, os próprios PNGs paramétricos como referência-mestre (caminho preferido: **A gera a verdade, B estiliza sobre ela**).

---

## 4 · PROMPTS DE BASE REESCRITOS (texto puro — uso pontual, pedido do decisor)

Reescritos em "ordem de construção", com as cláusulas que faltavam (simetria 180°, peso igual, pontas-seta, corte-lâmina, anti-wireframe). Usar SOMENTE com o loop gold (judge v2 §5).

### P1 — Conceito integral · fundo off-white (alvo: TEv01)

```text
Flat 2D vector logo, perfectly centered on a solid cool off-white (#F7F8FA) background.
A bold capital letter S built with PERFECT 180-DEGREE ROTATIONAL SYMMETRY: the bottom
half is the exact same shape as the top half rotated 180 degrees around the center —
identical thickness, identical solid fill, identical proportions. Each half is one
thick angular band (45-degree chamfered outer corners) that starts at an outer terminal
and tapers into a sharp triangular arrowhead pointing at the center of the mark.
Top half: solid dark graphite (#15171B). Bottom half: solid cool off-white (#F7F8FA)
kept fully filled and outlined by a thin dark graphite hairline contour — it must be a
SOLID FILLED band exactly like the top half, NEVER a hollow outline or wireframe.
At the exact center sits a small flat-top regular hexagon in solid industrial orange
(#FF4D00), like a precision machine nut; the two triangular arrowheads aim at and
nearly touch its left and right sides. ONE single straight 45-degree diagonal cut, in
the background color, slices through the center like a clean blade: through the upper
arrowhead tip, across the orange hexagon (leaving a thin diagonal slash), and through
the lower arrowhead tip. The top-right terminal and the bottom-left terminal each end
in a 45-degree chamfered tip filled with industrial orange (#FF4D00), separated from
the band by a very thin background-color gap. The mark must read instantly as a capital
letter S (one-second squint test) and never as the digit 5. Strictly forbidden: stars,
sparkles, lightning bolts, arrows or any glyph inside the node; hollow wireframe
halves; asymmetry; gradients; shadows; 3D; texture; extra elements; text; borders.
```

### P2 — Conceito integral · fundo grafite (alvo: TEv02)
Igual ao P1 trocando: fundo "deep dark graphite (#15171B)"; metade superior "solid cool
off-white (#F7F8FA)"; metade inferior "solid dark graphite (#15171B) kept fully filled
and outlined by a thin off-white hairline contour".

### P3 — Acento único · mono grafite (alvo: TEv07)
Igual ao P1 trocando: "Top half and bottom half are BOTH solid dark graphite (#15171B)
— still built as two halves with perfect 180-degree rotational symmetry, tapering into
the two arrowheads"; terminais: "clean 45-degree chamfered cuts in the same graphite as
the band (no orange tips)"; o único laranja é o hexágono.

### P4 — Avatar app-icon (alvo: TEv17)
Igual ao P2 (S off-white sobre grafite, hexágono e tips blaze) acrescentando:
"Composed as a square app icon with extra generous padding on all sides, every detail
legible at 32 pixels."

---

## 5 · QA v2 — SIMETRIA VERIFICÁVEL POR PIXEL + JUDGE ATUALIZADO

### 5.1 Check automático de simetria (novo, objetivo, inegociável)

```python
import numpy as np
from PIL import Image

def qa_symmetry_180(path, bg_rgb, tol=30, iou_min=0.96):
    """Binariza a silhueta (pixel != fundo), rotaciona 180° e exige IoU >= 0.96.
    Funciona no split (cores diferentes, MESMA silhueta)."""
    a = np.asarray(Image.open(path).convert("RGB").resize((512, 512)), dtype=int)
    mask = (np.abs(a - np.array(bg_rgb)).sum(axis=2) > tol)
    rot = np.rot90(mask, 2)
    inter, union = (mask & rot).sum(), (mask | rot).sum()
    return union > 0 and inter / union >= iou_min
```

Aplicar a TODO PNG do TE (Trilho A deve passar com IoU ≈ 1.0 por construção; Trilho B e §4 só publicam se passarem).

### 5.2 Campos novos do judge (somar ao JUDGE_PROMPT_TE)

```text
"rotational_symmetry_180": true|false,    // bottom half = top half rotated 180°, same weight
"equal_weight_solid_halves": true|false,  // both halves SOLID FILLED; hollow/wireframe half => false
"arrowheads_meet_hexagon": true|false,    // both tapered tips aim at / nearly touch the hexagon sides
"single_blade_cut_45": true|false,        // ONE 45° background-color cut through tip-hexagon-tip
```
PASS exige os 4 = true (além dos critérios anteriores).

---

## 6 · ORDEM DE EXECUÇÃO + DEFINITION OF DONE

1. **Implementar o Trilho A** (`te_generator.py`) e gerar as 20 variações da TE_MATRIX em **SVG + PNG**.
2. Rodar `qa_symmetry_180` + judge v2 + QA de pixel em todos os PNGs.
3. Contact sheet `F1_TE_v2.png` (4×5, códigos legendados) + mini-REPORT (IoU por variação, PASS/FAIL, reasons).
4. *(Opcional, após aprovação do decisor)* Trilho B: 6–8 edits estilizados usando os PNGs do Trilho A como referência.
5. Commit em `codex/logo-factory`; nada fora de `branding/logo-factory/`.

**DoD:**
- [ ] 20/20 variações geradas pelo Trilho A com **SVG + PNG**
- [ ] `qa_symmetry_180` com IoU ≥ 0.96 em 100% das publicadas (esperado ≈ 1.0)
- [ ] Judge v2 PASS em 100% das publicadas; zero wireframe, zero glifo no nó, zero nó deslocado
- [ ] Contact sheet + mini-REPORT entregues ao decisor
- [ ] SVGs nomeados `F1_TEvNN.svg` — candidatos diretos a arquivo oficial da marca
