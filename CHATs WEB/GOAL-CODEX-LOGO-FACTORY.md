# GOAL — SATTI LOGO FACTORY v1

> **Para:** Codex (executor autônomo) · **De:** Orquestrador SATTI · **Decisor final:** Miguel
> **Branch:** `codex/logo-factory` · **Diretório de trabalho:** `branding/logo-factory/` (NÃO tocar em `app/`, `components/`, `content/`)
> Este documento é autocontido. Não dependa de nenhum contexto externo além dele.

---

## 0 · MISSÃO

Construir e executar uma **fábrica programática de exploração de logo** para a SATTI usando a API de geração de imagens da OpenAI (`gpt-image-1`). A fábrica gera **centenas de variações controladas** cobrindo: símbolo isolado, wordmark/tipografia, lockups combinados (horizontal e empilhado), versão com eyebrow técnico, sistema responsivo, esquemas primário / invertido / monocromático / avatar — tudo regido pela **Constituição Visual (§2)**, que é o destilado de pesquisa formal (acadêmica + competitiva) já realizada.

A saída é uma **biblioteca organizada + contact sheets + manifest + relatório** para curadoria humana posterior.

**Entenda o papel desta fábrica:** ela explora DIREÇÕES em raster. A logo oficial será redesenhada manualmente em vetor (SVG) a partir da direção vencedora. Portanto, otimize para **variedade controlada e comparabilidade entre variações** — não para "arquivo final perfeito". Consistência de enquadramento e fundo importa mais que perfeição de cada render individual.

---

## 1 · DNA DA MARCA (contexto mínimo necessário)

| Campo | Valor |
|---|---|
| Marca | **SATTI** — estúdio de IA & automação (Nova Lima/MG, Brasil) |
| Posicionamento | "Construímos máquinas digitais que trabalham por você" — engenharia pragmática, números reais, zero hype |
| Serviços | Agentes de IA, automações (n8n/Evolution API/WhatsApp), sites, apps, webapps, SaaS, dados & integrações |
| Públicos | Decisor PME brasileiro (não-técnico, precisa confiar rápido) + cliente técnico internacional |
| Paleta (LEI) | `#FF4D00` blaze (acento raro e caro) · `#15171B` iron/grafite · `#F7F8FA` paper/off-white |
| Cor proibida no logo | `#2F6BFF` (azul circuito — rebaixado a uso funcional de UI, jamais identidade) |
| Tipografia do site | Archivo (display), Inter (body), JetBrains Mono (voz técnica) |
| Sentimento-alvo | Precisão de engenharia + energia de execução + confiança premium ("precisão que pulsa") |

---

## 2 · CONSTITUIÇÃO VISUAL (regras duras — cada uma tem fundamento de pesquisa)

Estas regras são **inegociáveis**. Toda imagem gerada deve obedecê-las. Violações detectadas no QA (§6) vão para `_rejected/`.

### 2.1 Regras DO

| # | Regra | Fundamento |
|---|---|---|
| D1 | Wordmark **"SATTI" sempre em caixa alta** (5 letras: S-A-T-T-I) | Caixa alta → competência/autoridade/força percebida (Xu et al. 2017, *Marketing Letters*; Teng et al. 2021, *JBR*) — essencial p/ confiança rápida de PME |
| D2 | Tipografia: **grotesco geométrico, peso semibold/bold, família visual do Archivo**, com 1–2 "cortes de engenharia" (terminais chanfrados/retos) | Tipo carrega personalidade mensurável (Henderson, Giese & Cote 2004, *Journal of Marketing*); cortes próprios = ativo distintivo anti-blanding |
| D3 | Símbolo **descritivo da categoria** (automação / máquina / fluxo / sinal) — não abstração vazia | Logos descritivos → + autenticidade, + intenção de compra, + desempenho (Luffarelli, Mukesh & Mahmood 2019, *JMR*, estudo dos 597 logos) |
| D4 | Geometria **angular/reta dominante** (90° e 45°), não orgânica/arredondada | Formas angulares ativam associações de dureza, durabilidade e precisão (Jiang & Gorn et al. 2016, *JCR*) |
| D5 | **Leve assimetria** via nó/acento deslocado | Assimetria → excitação/energia percebida (Luffarelli, Stamatogiannakis & Yang 2019, *JMR*) |
| D6 | Blaze `#FF4D00` como **acento isolado** (exatamente 1 nó/módulo/pico/ponto) — nunca a palavra inteira, nunca 2+ elementos laranja | Cor é o ativo nº 1 de memória de logo (~80% lembram a cor certa — Signs.com "Branded in Memory"); acento único sobre neutro = máxima gravação |
| D7 | Fundos **chapados**: somente `#F7F8FA` ou `#15171B`, preenchendo todo o canvas | Comparabilidade entre variações + uso direto em contact sheet |
| D8 | **Flat absoluto**: 2D, sem gradiente, sem sombra, sem 3D, sem textura, sem mockup, sem cena | Direção "premium por restrição" (Apple/Porsche/Leica) |
| D9 | Composição **centralizada com espaço negativo generoso** | Logos simples são recriados de memória com muito mais precisão (Signs.com) |

### 2.2 Regras DON'T (proibições absolutas — incluir em TODO prompt)

- ✗ Sparkle / estrela de 4 pontas (clichê de IA saturado; ambíguo — NN/g constatou que ninguém lê como "IA")
- ✗ Cérebro, rede neural, neurônios, sinapses
- ✗ Hexágono, loop infinito, órbitas, átomos
- ✗ Placa de circuito genérica / microchip com perninhas
- ✗ Robô, mascote, animal, rosto
- ✗ Gradientes "IA mágica" pastel (roxo→rosa→azul)
- ✗ Qualquer azul (inclusive `#2F6BFF`)
- ✗ Caixa baixa "satti" / Title Case "Satti"
- ✗ Palavra inteira em laranja (falha de contraste WCAG sobre off-white + perda do acento raro)
- ✗ Mais de uma cor de acento na mesma peça

---

## 3 · MATRIZ DE GERAÇÃO

A fábrica é um produto cartesiano **controlado** (não aleatório) de 5 eixos. Cada imagem recebe um código único derivado dos eixos (ver §5.4 — nomenclatura).

### 3.1 Eixo T — Territórios de símbolo (4)

| Código | Território | Descrição operacional (vai no prompt) |
|---|---|---|
| **TA** | S-trace de automação | A letra S formada por **um único traço contínuo de fluxo/esteira** com dobras em ângulo (estilo trace de máquina/percurso de automação), carregando **um nó circular sólido** em blaze |
| **TB** | Monograma bloco-máquina | S modular construído de **blocos retangulares encaixados** (encaixe mecânico de peças), com recorte angular preciso e **um módulo/bloco** em blaze |
| **TC** | Onda quadrada / pulso | Uma **square wave curta** (forma de onda digital de pulso) cujo percurso **implica a letra S**, com **um segmento de pico** em blaze — "sinal medido, resultado real" |
| **TD** | Nó + conexão reta | **Dois/três pontos sólidos conectados por traço reto** de engenharia, nó terminal em blaze — minimalismo extremo, geometria reta (deliberadamente distante do n8n, que é circular/orgânico) |

### 3.2 Eixo V — Variantes paramétricas por território (8)

| Código | Stroke | Cantos | Posição do nó blaze | Proporção |
|---|---|---|---|---|
| v1 | fino | 90° retos | terminal | compacta |
| v2 | médio | 90° retos | terminal | compacta |
| v3 | bold | 90° retos | terminal | compacta |
| v4 | médio | chanfros 45° | terminal | compacta |
| v5 | médio | micro-arredondados (raio mínimo) | terminal | compacta |
| v6 | médio | 90° retos | central | compacta |
| v7 | bold | chanfros 45° | deslocado assimétrico | compacta |
| v8 | fino | 90° retos | deslocado assimétrico | estendida horizontal |

### 3.3 Eixo W — Tratamentos de wordmark (6)

| Código | Tratamento |
|---|---|
| W1 | Grotesco estilo Archivo **Semibold**, largura normal, kerning preciso |
| W2 | Grotesco estilo Archivo **Bold semi-expandido** |
| W3 | Semibold com **terminais chanfrados a 45°** (cortes de engenharia nas pontas de S, A, T) |
| W4 | Bold com **detalhe proprietário no A** (travessão do A elevado ou cortado — barra horizontal vira "linha de medição") |
| W5 | Semibold com **tracking largo** (espaçamento técnico, ar de placa de identificação industrial) |
| W6 | = W2 + **eyebrow "AI & AUTOMATION STUDIO"** em monospace (JetBrains Mono–like), menor, letterspaced, abaixo do wordmark |

### 3.4 Eixo C — Composições (5)

| Código | Composição | Tamanho gpt-image-1 |
|---|---|---|
| C1 | Símbolo isolado | `1024x1024` |
| C2 | Lockup horizontal (símbolo à esquerda, wordmark à direita, clear space) | `1536x1024` |
| C3 | Lockup empilhado (símbolo centrado acima do wordmark) | `1024x1024` |
| C4 | Wordmark puro | `1536x1024` |
| C5 | Wordmark + eyebrow mono (exige W6) | `1536x1024` |

### 3.5 Eixo S — Esquemas de cor (5)

| Código | Esquema | fg / bg / acento |
|---|---|---|
| SP | Primário | grafite `#15171B` sobre off-white `#F7F8FA` + 1 nó blaze `#FF4D00` |
| SI | Invertido | off-white `#F7F8FA` sobre grafite `#15171B` + 1 nó blaze `#FF4D00` |
| SM | Mono-grafite (teste de robustez 1-cor: gravação, bordado, carimbo) | grafite sobre off-white, **sem blaze** |
| SW | Mono-branco | off-white sobre grafite, **sem blaze** |
| SA | Avatar all-blaze (só para C1) | símbolo inteiro em blaze `#FF4D00` sobre grafite `#15171B` (modelo McLaren: app icon/favicon/avatar social) |

### 3.6 Plano de volume por fase

| Fase | Conteúdo | Fórmula | Imagens (×N_SEEDS) |
|---|---|---|---|
| **F1 SYMBOLS** | Exploração ampla de símbolos | 4T × 8V × C1 × {SP, SI} | 64 |
| **F2 WORDMARKS** | Tipografia pura | {W1..W5} × C4 × {SP, SI} + W6 × C5 × {SP, SI} | 12 |
| **F3 LOCKUPS** | Combinações | 4T × {v2, v4, v7} × {C2, C3} × {SP, SI} | 48 |
| **F4 SYSTEM** | Robustez do shortlist | top-12 (heurística §7.3) × {SM, SW, SA*, favicon-test} | ~36–48 |
| **F5 SHEETS** | Contact sheets + report + galeria | — | 0 gerações |

\* SA só se aplica quando o item do shortlist for um símbolo (C1).

**Parâmetros globais (configuráveis no topo do script):**

```text
MODE        = "FULL"      # FULL → N_SEEDS=2 (~290–300 imagens) | ECONOMY → N_SEEDS=1 (~160)
N_SEEDS     = 2           # repetições por prompt (variação natural do modelo)
QUALITY     = "medium"    # F1–F3 = medium; F4 = high
MAX_RETRIES = 2           # regeneração automática em falha de QA
```

> Estimativa de custo (gpt-image-1, quality medium): ~US$ 0,04–0,07/imagem → modo FULL ≈ US$ 12–25. Logar custo estimado no REPORT.

---

## 4 · TEMPLATES DE PROMPT (gpt-image-1 — manter em INGLÊS)

Prompts de imagem performam melhor em inglês. Os templates abaixo são **funções parametrizadas** — implemente-as exatamente, interpolando os eixos. Nunca improvise fora deles.

### 4.1 Blocos constantes

```text
BASE_STYLE = (
  "Flat 2D vector-style logo design, solid plain background color filling the entire "
  "canvas edge to edge, perfectly centered composition with generous negative space, "
  "clean sharp edges, professional brand identity presentation, minimalist, "
  "no gradients, no shadows, no 3D effects, no texture, no reflections, no mockup, "
  "no extra text, no watermark, no border, no frame."
)

AVOID = (
  "Strictly do not include: sparkles, four-pointed stars, glitter, brains, neural "
  "networks, neurons, hexagons, infinity symbols, orbits, atoms, circuit boards, "
  "microchips, robots, mascots, animals, faces, glow effects, neon, pastel gradients, "
  "any shade of blue, any second accent color."
)

SCHEMES = {
  "SP": dict(fg="dark graphite (#15171B)",  bg="cool off-white (#F7F8FA)",      accent="industrial orange (#FF4D00)"),
  "SI": dict(fg="cool off-white (#F7F8FA)", bg="deep dark graphite (#15171B)",  accent="industrial orange (#FF4D00)"),
  "SM": dict(fg="dark graphite (#15171B)",  bg="cool off-white (#F7F8FA)",      accent=None),
  "SW": dict(fg="cool off-white (#F7F8FA)", bg="deep dark graphite (#15171B)",  accent=None),
  "SA": dict(fg="industrial orange (#FF4D00)", bg="deep dark graphite (#15171B)", accent=None),
}
```

### 4.2 Descritores dos territórios (interpolar variante V)

```text
TERRITORIES = {
 "TA": "an abstract capital letter S formed by one single continuous automation flow "
       "line (like a precise machine path or conveyor trace) with {corners} bends, "
       "drawn with a {stroke} uniform stroke, {proportion}",
 "TB": "a modular monogram of the capital letter S built from interlocking rectangular "
       "machine blocks with one precise angular notch, {stroke} visual weight, "
       "{corners} block edges, {proportion}",
 "TC": "a short square-wave digital pulse signal line whose path subtly implies the "
       "capital letter S, {stroke} uniform stroke, {corners} steps, {proportion}",
 "TD": "an extremely minimal engineering connection mark: three solid dots joined by "
       "straight {stroke} line segments with {corners} angles forming an abstract "
       "S-path, {proportion}",
}

V_PARAMS = {
 "v1": dict(stroke="thin",   corners="sharp 90-degree",        node="at the terminal end of the path",          proportion="compact square proportion"),
 "v2": dict(stroke="medium", corners="sharp 90-degree",        node="at the terminal end of the path",          proportion="compact square proportion"),
 "v3": dict(stroke="bold",   corners="sharp 90-degree",        node="at the terminal end of the path",          proportion="compact square proportion"),
 "v4": dict(stroke="medium", corners="45-degree chamfered",    node="at the terminal end of the path",          proportion="compact square proportion"),
 "v5": dict(stroke="medium", corners="very slightly rounded",  node="at the terminal end of the path",          proportion="compact square proportion"),
 "v6": dict(stroke="medium", corners="sharp 90-degree",        node="at the center of the path",                proportion="compact square proportion"),
 "v7": dict(stroke="bold",   corners="45-degree chamfered",    node="asymmetrically offset from the path end",  proportion="compact square proportion"),
 "v8": dict(stroke="thin",   corners="sharp 90-degree",        node="asymmetrically offset from the path end",  proportion="horizontally extended proportion"),
}
```

### 4.3 Funções de prompt

```text
PROMPT_SYMBOL(T, V, S):
  acc = SCHEMES[S].accent
  accent_clause = (f", carrying exactly one small solid circular node in {acc} placed {V.node}"
                   if acc else "")
  return (f"Minimal abstract logo symbol for an AI and automation engineering studio: "
          f"{TERRITORIES[T].format(**V)}{accent_clause}. "
          f"Main mark in {SCHEMES[S].fg} on a solid {SCHEMES[S].bg} background. "
          f"{BASE_STYLE} {AVOID}")

PROMPT_WORDMARK(W, S):
  acc = SCHEMES[S].accent
  accent_clause = (f" Exactly one tiny solid circular node in {acc} integrated as a "
                   f"single accent detail (for example replacing the crossbar tip of "
                   f"the final letter), never coloring whole letters." if acc else "")
  return (f"Logotype wordmark that spells exactly the word \"SATTI\" in uppercase "
          f"letters S-A-T-T-I (five letters, double T), {W.treatment}, geometric "
          f"grotesque sans-serif in the spirit of the Archivo typeface, precise "
          f"kerning, engineered and technical character. Letterforms in {SCHEMES[S].fg} "
          f"on a solid {SCHEMES[S].bg} background.{accent_clause} {BASE_STYLE} {AVOID}")

PROMPT_LOCKUP(T, V, W, C, S):
  layout = ("the symbol on the left and the wordmark on the right, separated by clear "
            "space equal to the symbol width" if C == "C2"
            else "the symbol centered above the wordmark with balanced vertical spacing")
  return (f"Complete brand lockup for \"SATTI\", an AI and automation engineering "
          f"studio: {layout}. Symbol: {TERRITORIES[T].format(**V)}, carrying exactly "
          f"one small solid circular node in {SCHEMES[S].accent}. Wordmark: spells "
          f"exactly \"SATTI\" in uppercase (S-A-T-T-I), {W.treatment}, geometric "
          f"grotesque sans-serif in the spirit of Archivo. All marks in {SCHEMES[S].fg} "
          f"on a solid {SCHEMES[S].bg} background. {BASE_STYLE} {AVOID}")

PROMPT_EYEBROW_SUFFIX (anexar quando W == W6 ou C == C5):
  " Below the wordmark, a much smaller technical tagline reading exactly "
  "\"AI & AUTOMATION STUDIO\" in a monospaced engineering font, widely letterspaced, "
  "same foreground color at reduced visual weight."

PROMPT_AVATAR(T, V):   # esquema SA, só C1
  return (f"Square app icon: {TERRITORIES[T].format(**V)} rendered entirely in solid "
          f"industrial orange (#FF4D00), centered on a solid deep dark graphite "
          f"(#15171B) square background with generous padding, designed to stay "
          f"legible at 32 pixels. {BASE_STYLE} {AVOID}")
```

### 4.4 Tratamentos W (texto interpolável)

```text
W_TREATMENTS = {
 "W1": "semibold weight, normal width",
 "W2": "bold weight, slightly expanded width",
 "W3": "semibold weight with 45-degree chamfered cut terminals on the S, A and T strokes",
 "W4": "bold weight where the crossbar of the letter A is raised and cut like a precision measurement line",
 "W5": "semibold weight with wide industrial letterspacing, like a machined identification plate",
 "W6": "bold weight, slightly expanded width",
}
```

---

## 5 · WORKFLOW EXECUTÁVEL (ULTRACODE)

### 5.1 Pré-requisitos

```bash
mkdir -p branding/logo-factory && cd branding/logo-factory
python -m venv .venv && source .venv/bin/activate
pip install openai pillow pytesseract   # pytesseract opcional (QA de spelling); requer tesseract-ocr no sistema
export OPENAI_API_KEY=...               # precisa de acesso ao modelo gpt-image-1
```

### 5.2 Estrutura de saída (criar no início)

```text
branding/logo-factory/
├── logo_factory.py
├── out/
│   ├── F1_symbols/      F2_wordmarks/      F3_lockups/      F4_system/
│   └── _rejected/                      # reprovadas no QA, com motivo no manifest
├── contact-sheets/                     # grades PNG por fase/território
├── manifest.jsonl                      # 1 linha JSON por imagem gerada
├── REPORT.md                           # estatísticas, custo, shortlist, instruções de decisão
└── index.html                          # galeria estática local (grid com código + prompt)
```

### 5.3 `logo_factory.py` — esqueleto de referência (implementar fiel a isto)

```python
"""SATTI Logo Factory — geração programática de variações de logo via gpt-image-1.
Regido pela Constituição Visual do GOAL (§2). Retomável: pula arquivos já existentes."""
import base64, itertools, json, os, time
from pathlib import Path
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont

# ── parâmetros globais ────────────────────────────────────────────────────────
MODE        = os.getenv("MODE", "FULL")            # FULL | ECONOMY
N_SEEDS     = 2 if MODE == "FULL" else 1
QUALITY_STD = "medium"                              # F1–F3
QUALITY_HI  = "high"                                # F4
MAX_RETRIES = 2
OUT         = Path("out"); SHEETS = Path("contact-sheets")
client      = OpenAI()

# ── matriz (§3) e templates (§4): cole aqui SCHEMES, TERRITORIES, V_PARAMS,
#    W_TREATMENTS e as funções PROMPT_* exatamente como especificadas no GOAL ──

SIZES = {"C1": "1024x1024", "C2": "1536x1024", "C3": "1024x1024",
         "C4": "1536x1024", "C5": "1536x1024"}

def generate(prompt: str, size: str, out_path: Path, quality: str) -> bool:
    """Gera 1 imagem com retry/backoff. Retorna True se salvou."""
    if out_path.exists():
        return True                                  # retomável
    for attempt in range(MAX_RETRIES + 1):
        try:
            r = client.images.generate(model="gpt-image-1", prompt=prompt,
                                       size=size, quality=quality, n=1)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(base64.b64decode(r.data[0].b64_json))
            return True
        except Exception as e:
            wait = 2 ** attempt * 5
            print(f"[retry {attempt}] {out_path.name}: {e} — aguardando {wait}s")
            time.sleep(wait)
    return False

# ── QA automático (§6) ───────────────────────────────────────────────────────
HEX = {"paper": (247, 248, 250), "iron": (21, 23, 27), "blaze": (255, 77, 0)}

def near(c, target, tol=22):
    return all(abs(a - b) <= tol for a, b in zip(c, target))

def qa_background(img: Image.Image, scheme: str) -> bool:
    """Amostra os 4 cantos: devem bater com o bg esperado do esquema."""
    bg = HEX["iron"] if scheme in ("SI", "SW", "SA") else HEX["paper"]
    w, h = img.size
    pts = [(8, 8), (w - 8, 8), (8, h - 8), (w - 8, h - 8)]
    px = img.convert("RGB")
    return all(near(px.getpixel(p), bg) for p in pts)

def qa_blaze_ratio(img: Image.Image, scheme: str) -> bool:
    """Blaze deve existir como ACENTO: 0.05%–12% da área em SP/SI; 0% em SM/SW;
    dominante (>15%) apenas em SA."""
    px = img.convert("RGB").resize((256, 256))
    n = sum(1 for c in px.getdata() if near(c, HEX["blaze"], tol=46))
    ratio = n / (256 * 256)
    if scheme in ("SP", "SI"):  return 0.0005 <= ratio <= 0.12
    if scheme in ("SM", "SW"):  return ratio < 0.002
    if scheme == "SA":          return ratio > 0.15
    return True

def qa_spelling(img: Image.Image) -> bool | None:
    """OCR opcional: confere 'SATTI'. Retorna None se tesseract indisponível
    (marcar p/ revisão humana, não rejeitar)."""
    try:
        import pytesseract
        txt = pytesseract.image_to_string(img).upper()
        return "SATTI" in txt.replace(" ", "")
    except Exception:
        return None

def run_qa(path: Path, scheme: str, has_word: bool) -> tuple[bool, list[str]]:
    img, fails = Image.open(path), []
    if not qa_background(img, scheme):  fails.append("bg_mismatch")
    if not qa_blaze_ratio(img, scheme): fails.append("blaze_ratio")
    if has_word and qa_spelling(img) is False: fails.append("spelling")
    return (not fails), fails

# ── laço principal ────────────────────────────────────────────────────────────
def emit(phase, code, prompt, size, quality, scheme, has_word, meta):
    for seed in range(1, N_SEEDS + 1):
        path = OUT / phase / f"{code}_s{seed}.png"
        if not generate(prompt, size, path, quality):
            continue
        ok, fails = run_qa(path, scheme, has_word)
        if not ok:                                   # 1 regeneração automática
            path_r = OUT / "_rejected" / path.name
            path_r.parent.mkdir(parents=True, exist_ok=True)
            path.rename(path_r)
            if generate(prompt, size, path, quality):
                ok, fails = run_qa(path, scheme, has_word)
                if not ok:
                    path.rename(OUT / "_rejected" / f"x2_{path.name}")
        rec = dict(code=code, seed=seed, phase=phase, scheme=scheme, ok=ok,
                   qa_fails=fails, prompt=prompt, file=str(path), **meta)
        with open("manifest.jsonl", "a") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        time.sleep(1.5)                              # rate-limit friendly

def main():
    # F1 — símbolos: 4T × 8V × {SP, SI}
    for T, V, S in itertools.product(TERRITORIES, V_PARAMS, ("SP", "SI")):
        emit("F1_symbols", f"F1_{T}{V}_C1_{S}",
             PROMPT_SYMBOL(T, V, S), SIZES["C1"], QUALITY_STD, S, False,
             dict(territory=T, variant=V, comp="C1"))
    # F2 — wordmarks: W1..W5 em C4; W6 em C5 (+ sufixo eyebrow)
    for W, S in itertools.product(W_TREATMENTS, ("SP", "SI")):
        C = "C5" if W == "W6" else "C4"
        p = PROMPT_WORDMARK(W, S) + (PROMPT_EYEBROW_SUFFIX if W == "W6" else "")
        emit("F2_wordmarks", f"F2_{W}_{C}_{S}", p, SIZES[C], QUALITY_STD, S, True,
             dict(wordmark=W, comp=C))
    # F3 — lockups: 4T × {v2, v4, v7} × W3 × {C2, C3} × {SP, SI}
    for T, V, C, S in itertools.product(TERRITORIES, ("v2", "v4", "v7"),
                                        ("C2", "C3"), ("SP", "SI")):
        emit("F3_lockups", f"F3_{T}{V}_W3_{C}_{S}",
             PROMPT_LOCKUP(T, V, "W3", C, S), SIZES[C], QUALITY_STD, S, True,
             dict(territory=T, variant=V, wordmark="W3", comp=C))
    # F4 — sistema: shortlist top-12 (§7.3) × {SM, SW, SA, favicon}
    for item in shortlist_top12():
        for S in ("SM", "SW"):
            emit("F4_system", f"F4_{item['code']}_{S}",
                 rebuild_prompt(item, S), item["size"], QUALITY_HI, S,
                 item["has_word"], dict(parent=item["code"]))
        if item["comp"] == "C1":
            emit("F4_system", f"F4_{item['code']}_SA",
                 PROMPT_AVATAR(item["territory"], item["variant"]),
                 "1024x1024", QUALITY_HI, "SA", False, dict(parent=item["code"]))
        favicon_test(item)        # downscale 32px do arquivo aprovado + salvar lado a lado
    contact_sheets(); write_report(); write_index_html()

if __name__ == "__main__":
    main()
```

### 5.4 Nomenclatura (lei)

`{fase}_{T}{V}_{W}_{C}_{S}_s{seed}.png` — campos não aplicáveis são omitidos.
Exemplos: `F1_TAv4_C1_SP_s1.png` · `F2_W3_C4_SI_s2.png` · `F3_TCv7_W3_C2_SP_s1.png`

### 5.5 Funções de fechamento (implementar)

- `shortlist_top12()` — heurística sobre o manifest: somente `ok=True`; diversidade obrigatória (≥2 itens por território; ≥3 composições distintas); desempate por nitidez (variância do Laplaciano via PIL/np) e por menor taxa de falha do prompt-irmão.
- `contact_sheets()` — grades PNG (PIL): F1 = 1 folha por território (8 variantes × 2 esquemas × seeds, célula 512px com o código legendado embaixo); F2 = 1 folha; F3 = 2 folhas (C2 e C3); F4 = 1 folha do shortlist. Fundo da folha `#FFFFFF`, labels em fonte default.
- `favicon_test(item)` — redimensionar a imagem aprovada p/ 32×32 e 16×16 (LANCZOS) e salvar composição lado a lado `F4_{code}_favicon.png` para julgar legibilidade em escala mínima.
- `write_report()` — gerar `REPORT.md` (ver §7.2).
- `write_index_html()` — galeria estática: grid de todas as imagens `ok=True`, agrupadas por fase, cada célula com código + esquema + link do arquivo; filtro simples por território via JS inline.

---

## 6 · QA AUTOMÁTICO E CRITÉRIOS DE DESCARTE

| Check | Regra | Ação em falha |
|---|---|---|
| `bg_mismatch` | 4 cantos ≈ bg do esquema (ΔRGB ≤ 22) | rejeitar → regenerar 1× |
| `blaze_ratio` | SP/SI: 0,05%–12% de pixels ~blaze · SM/SW: ~0% · SA: >15% | rejeitar → regenerar 1× |
| `spelling` | OCR encontra "SATTI" (quando há wordmark) | rejeitar → regenerar 1×; se OCR indisponível, flag `needs_human_spellcheck` |
| Proibições semânticas (§2.2) | sparkles/cérebros/etc. não são detectáveis por pixel | **amostra humana**: REPORT deve listar 30 imagens aleatórias p/ inspeção visual do revisor |

Imagens reprovadas 2× ficam em `out/_rejected/` com prefixo `x2_` e motivo no manifest — **nunca deletar** (servem de evidência de calibração de prompt).

---

## 7 · ENTREGÁVEIS

### 7.1 Manifest (`manifest.jsonl`) — schema por linha

```json
{"code":"F3_TAv4_W3_C2_SP","seed":1,"phase":"F3_lockups","territory":"TA",
 "variant":"v4","wordmark":"W3","comp":"C2","scheme":"SP","ok":true,
 "qa_fails":[],"prompt":"...","file":"out/F3_lockups/F3_TAv4_W3_C2_SP_s1.png"}
```

### 7.2 `REPORT.md` — conteúdo obrigatório

1. Totais: geradas / aprovadas / rejeitadas por fase e por motivo de QA; custo estimado (n × preço da quality usada).
2. Taxa de aprovação por território e por esquema (tabela) — onde o modelo performou melhor.
3. **Shortlist top-12** (heurística §5.5) com thumbnails inline e código.
4. Lista das 30 imagens p/ inspeção semântica humana (§6).
5. Instruções de decisão p/ o Miguel: "abra `index.html` → filtre por território → anote 3–5 códigos favoritos → devolva os códigos ao orquestrador".

### 7.3 Git

Commit em `codex/logo-factory` com `out/` (aprovadas), `contact-sheets/`, `manifest.jsonl`, `REPORT.md`, `index.html` e o script. Mensagens convencionais em PT-BR (`feat: fábrica de logos F1–F5`). **Proibido tocar em qualquer arquivo fora de `branding/logo-factory/`.**

---

## 8 · DEFINITION OF DONE

- [ ] Modo FULL executado: **≥ 200 imagens aprovadas** no QA automático
- [ ] F1 cobre 100% da matriz 4T × 8V × {SP, SI}
- [ ] F2, F3, F4 completos conforme §3.6 (F4 sobre shortlist top-12 com diversidade garantida)
- [ ] `manifest.jsonl` com 100% das gerações (aprovadas e rejeitadas)
- [ ] Contact sheets de todas as fases em `contact-sheets/`
- [ ] `REPORT.md` completo (incl. shortlist + amostra de inspeção humana + custo)
- [ ] `index.html` abrindo localmente com a galeria filtrável
- [ ] Zero violação das regras DO/DON'T na amostra humana de 30 imagens (ou listadas como rejeitadas)
- [ ] Branch `codex/logo-factory` commitada, `app/` intocado

---

## 9 · PÓS-FÁBRICA (contexto — NÃO executar nesta task)

Miguel + orquestrador revisam contact sheets e `index.html` → escolhem direção vencedora → **rodada 2 de refinamento** (variações finas só da vencedora) → **vetorização manual em SVG** (a logo oficial nunca será o raster) → kit oficial de marca: clear space, tamanhos mínimos, versões P/I/mono/avatar, regras de uso no site e nos documentos.
