# SATTI — Auditoria de conformidade com o DESIGN.md

Fonte: `outputs/design-md/satti/DESIGN.md`. 30 telas verificadas contra as leis do Design System. Este relatório foi gerado pela auditoria automática (scan de todos os `style=""`) e revisado manualmente.

## Veredito: **SUBSTANCIALMENTE CONFORME** ✅

As duas leis mais duras do DS passam em **todas** as telas:
- **Texto claro sobre blaze: 0 ocorrências** — em todo botão/superfície blaze o texto é `iron #15171B` (preto), como manda o DS.
- **Feedback como bloco cheio: 0 ocorrências** — erro/sucesso sempre como texto + borda + ícone.
- **Blaze raro:** o acento aparece com disciplina (eyebrow-marker 8×8, 1 CTA/pulso por dobra). `circuit` só em função (links, diagrama, focus).

## Ação aplicada nesta passada — alinhamento à escala de raio {8·12·16·28·999}

O DESIGN.md define a escala de raio; snapamos os valores fora da escala para o token mais próximo (Δ de 2–4px, sem alterar o caráter visual):

- 6→8 · 14→12 · 18→16 · 20→16 · 26→28
- **44 ocorrências em 13 telas** corrigidas: Home EN (desktop + print) ×8/×8, O3 Idioma (mobile/overlay) ×3/×3, S4 Serviços (desktop/mobile) ×3/×3, S6 Automação (desktop/mobile) ×5/×5, S7 Portfólio ×1, S8 Banner ×2, S9 Cases ×1, S1+S2 Hero (desktop/mobile) ×1/×1.
- **Intacto — `24px` em cards mobile (S4/S5/S7/S9/S10):** é o downscale intencional 28→24 do desktop→mobile. **[CONFIRMAR]** se prefere manter 24 ou padronizar em 28.

## Achados que são intencionais — NÃO são violações

Reclassificados após inspeção do código (não mexer sem sua ordem, pois são telas aprovadas):

- **Rampas tonais dos cards S4 (Serviços):** cada card é um mundo monocromático derivado de um tint **oficial** do DS — card1 `#FFE9DE` (blaze-soft), card2 `#E4EBFF` (tint-blue), card3 `#ECEEF2` (tint-slate). Os tons `#F6DCCF/#B98A74/#9A6F58/#5C4A40` (rampa quente), `#D7E1FB/#8AA0D6/#6079B5/#445377` (rampa azul) e `#E0E4EA/#9AA3B2/#5A606B/#CBD0D9` (rampa slate) são slot-de-imagem, cruz, eyebrow, corpo e borda-de-tag tingidos para casar com cada tint. Desenho deliberado.
- **Cinzas de blueprint** (`#E0E4EA`, `#9AA3B2`, `#EEF0F3`, `#DDE1E7`): linhas de grade/cruz dos placeholders de mídia — a linguagem de desenho técnico do DS.
- **Elevações dark** (`#1E2127`, `#2E333B`, `#2A2D34`, `#1B1E24`, `#3A3F47`): painéis elevados dentro das seções graphite (Footer, O1, O2, S6, S8).
- **Sombras de overlay/modal** (`-40px 0 80px rgba(15,17,21,.25)` em O2 Contato; `0 24px 60px rgba(15,17,21,.28-.32)` em O3 Idioma): elevação legítima de drawer/modal flutuante. O `{{ w.glow }}`/`{{ c.glow }}` são o glow blaze (template).
- **`circuit-fill` em S3 Var B (circuit):** é a variante ARQUIVADA — circuit é o tema dela por design.

## Itens para sua decisão — [CONFIRMAR]

1. **Corpo dos cards S4/S5 em tom tingido** (`#5C4A40`, `#445377`, `#5A606B`) em vez de `iron`/`steel`. O DS diz "corpo em iron ou steel". Manter as rampas (recomendado, é bonito e intencional) **ou** padronizar corpo em iron/steel para conformidade estrita?
2. **`24px` de card mobile** — manter downscale 24 ou padronizar em 28?
3. **Cinzas dark ad-hoc** — tokenizar como escala de elevação do graphite no DS (`--c-graphite-1/2/3`) para disciplina de token, ou manter literais?
4. **Sombra sutil de card** `0 1px 2px rgba(15,17,21,.04)` (headers pill Home/S1) — o DS prega "sombras quase zero". Remover ou manter esse hairline-shadow?

## Cobertura da extração (design-md)

Qualidade **B (84/100)** · confiança high=88 · cobertura de tokens 62,5% · arquétipo `polaris-friendly` (heurístico — ver nota no DESIGN.md; o SATTI é de fato um sistema de precisão/técnico) · render-contract: light, 0 warnings.
