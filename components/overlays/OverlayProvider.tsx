"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * OverlayProvider — estado e chrome comum dos overlays O1/O2/O3 (W4).
 *
 * Composição: os overlays são SERVER components (copy via getTranslations)
 * passados como slots; este provider (client) só decide QUAL slot está
 * visível e cuida do chrome de acessibilidade:
 * - Esc fecha · foco vai para o painel ao abrir e VOLTA ao trigger ao fechar
 * - trap de Tab dentro do painel ativo
 * - scroll da página travado enquanto houver overlay (html[data-overlay])
 * - histórico de triggers via ref (não estado — sem re-render extra)
 *
 * Triggers (DEC-011): hambúrguer do header → O1; item de contato do O1 →
 * O2; linha de idioma do O1 (e o seletor do header, opcional) → O3.
 * Fora de um provider, useOverlay() é inerte (dev/ui, testes).
 */

export type OverlayId = "menu" | "contact" | "language";

interface OverlayContextValue {
  active: OverlayId | null;
  open: (id: OverlayId) => void;
  close: () => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  const inert = useMemo<OverlayContextValue>(
    () => ({ active: null, open: () => undefined, close: () => undefined }),
    [],
  );
  return ctx ?? inert;
}

interface OverlayProviderProps {
  children: ReactNode;
  /** O1 — menu fullscreen graphite (server-rendered). */
  menu: ReactNode;
  /** O2 — painel de contato lateral direito (server-rendered). */
  contact: ReactNode;
  /** O3 — seletor de idioma (server-rendered). */
  language: ReactNode;
}

export default function OverlayProvider({
  children,
  menu,
  contact,
  language,
}: OverlayProviderProps) {
  const [active, setActive] = useState<OverlayId | null>(null);
  const activeRef = useRef<OverlayId | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const open = useCallback((id: OverlayId) => {
    // Só grava o trigger ao abrir a partir da PÁGINA: em transições
    // overlay→overlay (O1→O3) o botão de origem desmonta com o slot —
    // o foco deve voltar ao trigger ORIGINAL (ex.: hambúrguer) no close.
    if (activeRef.current === null) {
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }
    setActive(id);
  }, []);

  const close = useCallback(() => {
    setActive(null);
  }, []);

  // Esc fecha · trap de Tab · foco inicial · scroll lock · foco de volta.
  useEffect(() => {
    if (active === null) {
      document.documentElement.removeAttribute("data-overlay");
      const trigger = triggerRef.current;
      if (trigger !== null) {
        triggerRef.current = null;
        trigger.focus();
      }
      return;
    }

    document.documentElement.setAttribute("data-overlay", active);
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActive(null);
        return;
      }
      if (e.key !== "Tab" || panel === null) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === firstNode || current === panel)) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && current === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  const value = useMemo<OverlayContextValue>(
    () => ({ active, open, close }),
    [active, open, close],
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {active !== null ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          data-overlay-panel={active}
          data-lenis-prevent
        >
          {active === "menu" ? menu : null}
          {active === "contact" ? contact : null}
          {active === "language" ? language : null}
        </div>
      ) : null}
    </OverlayContext.Provider>
  );
}
