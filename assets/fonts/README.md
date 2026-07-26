# `assets/fonts/` — fontes de BUILD, nunca servidas

Este diretório está **fora de `public/`** de propósito: nada aqui chega a um
cliente. É consumido só por `fs.readFileSync` em tempo de build, hoje por
`app/[locale]/opengraph-image.tsx`.

## `Archivo-ExtraBold-latin.ttf` (45,8 KB)

Instância **estática** do Archivo em `wght=800 / wdth=100`, subsetada para o
range `latin` do Google Fonts — o mesmo subset que `app/[locale]/layout.tsx`
pede ao `next/font/google`, então o card social e os `<h1>` do site saem da
mesma fonte e do mesmo peso.

### Por que não o `Archivo-Variable.ttf` direto

O `ImageResponse` do Next 16.2.10 (satori + o fork de `opentype.js` embutido em
`@vercel/og`) **quebra ao parsear um variable font**: `parseFvarAxis` lê o nome
de cada eixo na tabela `name` pelo dicionário `macintosh`, e os registros 256+
do Archivo-Variable existem só na plataforma Windows —

```
TypeError: Cannot read properties of undefined (reading '256')
    at parseFvarAxis (…/@vercel/og/index.node.js:11887)
```

Verificado empiricamente nesta versão. Pinar os dois eixos remove a tabela
`fvar` inteira e o problema com ela. Como efeito colateral, o `weight: 800` que
o `ImageResponse` recebe passa a ser verdade: satori não instancia eixos, ele
usa o arquivo como está — com o variable font o texto sairia no default do
eixo (`wght=600`), não em 800.

### Como regenerar

Fonte: `Site/BRANDING/logo-factory/assets/fonts/Archivo-Variable.ttf` (658 KB,
eixos `wght 100→900` default 600, `wdth 62→125` default 100). `Site/` está fora
do git (DEC-016) — é material de referência.

```bash
pip install fonttools
python - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC = "Site/BRANDING/logo-factory/assets/fonts/Archivo-Variable.ttf"
inst = instancer.instantiateVariableFont(
    TTFont(SRC), {"wght": 800, "wdth": 100}, inplace=False, updateFontNames=True
)
inst.save("/tmp/archivo-800.ttf")
# range "latin" do Google Fonts, idêntico ao do next/font/google
LATIN = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
         "U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,"
         "U+2212,U+2215,U+FEFF,U+FFFD")
subset.main(["/tmp/archivo-800.ttf", f"--unicodes={LATIN}", "--layout-features=*",
             "--output-file=assets/fonts/Archivo-ExtraBold-latin.ttf"])
PY
```

`node scripts/make-brand-assets.mjs` valida o arquivo resultante: exige `fvar`
ausente e `OS/2.usWeightClass == 800`, que são exatamente as duas condições que
fazem a rota de OG gerar com a tipografia certa em vez de quebrar o build.

## Licença

`Archivo-ExtraBold-latin.ttf` é uma instância estática subsetada do Archivo, que é
licenciado sob a **SIL Open Font License 1.1**. A OFL exige que a licença acompanhe
qualquer redistribuição, e uma instância estática subsetada é obra derivada — então
`OFL.txt` fica neste diretório.

O texto foi obtido do repositório upstream
(`Omnibus-Type/Archivo`, branch master), não redigido aqui. A linha de copyright do
`OFL.txt` bate exatamente com o `nameID 0` da própria TTF:
`Copyright 2020 The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo)`.

Nota de conformidade: os campos `nameID 13` (license description) e `nameID 14`
(license URL) da TTF vieram vazios da origem. O `OFL.txt` ao lado cobre a
exigência de redistribuição; se a fonte for redistribuída fora deste repo, o
ideal é preencher os dois campos.
