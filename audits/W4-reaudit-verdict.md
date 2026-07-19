# RE-AUDIT W4 — Itens 3, 4 e 5

Auditoria exclusivamente estática; nenhum `npm`, build ou Git foi executado.

| Item | Veredito | Evidência estática |
|---|---|---|
| 3 — ARIA dos triggers | **PASS** | O CTA de contato expõe `aria-haspopup="dialog"` e `aria-expanded={overlay.active === "contact"}` em `components/sections/header/HeaderClient.tsx:104-113`; o hambúrguer expõe os mesmos atributos com estado ligado a `"menu"` em `components/sections/header/HeaderClient.tsx:123-130`; o seletor de idioma do header já cobre O3 em `components/sections/header/HeaderClient.tsx:86-92`; e o trigger O1→O3 agora declara `aria-haspopup="dialog"` e `aria-expanded` em `components/overlays/menu/MenuLanguage.tsx:24-29`. |
| 4 — L2 no O1 | **PASS** | O item em hover/foco assume blaze em `components/overlays/menu/MenuOverlay.module.css:167-173`; simultaneamente, `.root:has(.item:hover) .pulse` e `.root:has(.item:focus-visible) .pulse` ocultam o pulso em `components/overlays/menu/MenuOverlay.module.css:175-180`. A maior especificidade dessa regra prevalece sobre o `display: initial` do pulso animado em `components/overlays/menu/MenuOverlay.module.css:257-282`, mantendo no máximo um destaque blaze. |
| 5 — close→âncora | **PASS** | As âncoras chamam `close()` sem `preventDefault`, preservando o default nativo em `components/overlays/menu/MenuNavLink.tsx:29-35` e `components/overlays/contact/ContactCta.tsx:24-29`. No mesmo handler, `close()` remove `data-overlay` sincronamente antes de agendar o fechamento em `components/overlays/OverlayProvider.tsx:90-97`; portanto o `overflow: hidden` de `app/globals.css:69-75` já não vigora quando o default da âncora ocorre. A restauração posterior usa `focus({ preventScroll: true })` em `components/overlays/OverlayProvider.tsx:101-109`, sem desfazer a posição do fragmento. |

## Veredito final

**5/5 PASS — GATE W4: PASS.**

Os itens 1 e 2 permanecem **PASS** conforme `audits/W4-verdict.md:7-8`; os itens 3, 4 e 5 passam nesta reauditoria. Não há correção adicional proposta.
