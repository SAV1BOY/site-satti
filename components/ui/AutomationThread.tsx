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
import {
  nextZone,
  validateThreadPlan,
  type ThreadZoneId,
} from "./automation-thread-plan";
import { useMotionOk } from "@/hooks/useMotionOk";

/**
 * AutomationThread — orquestrador da Linha de Automação (D3).
 *
 * Responsabilidade única: garantir que existe UM ÚNICO pulso blaze no
 * site inteiro. Os segmentos (AutomationLine) se registram aqui; o
 * Thread decide qual segmento é o dono do pulso e passa o bastão quando
 * a viagem daquele segmento termina (animationend do offset-distance),
 * seguindo a ordem do THREAD_PLAN com wrap contato → hero.
 *
 * O desenho no scroll é responsabilidade de cada AutomationLine
 * (IO + rAF locais, padrão FillText) — o Thread não roda loop próprio.
 *
 * L5: em reduced-motion nenhum dono é definido — pulso não existe;
 * cada segmento renderiza a linha 100% desenhada por conta própria.
 */

interface ThreadContextValue {
  /** Zona dona do único pulso do site (null = sem pulso). */
  pulseOwner: ThreadZoneId | null;
  /** Chamado pelo segmento dono quando o pulso completa a viagem. */
  advancePulse: (from: ThreadZoneId) => void;
  register: (zone: ThreadZoneId) => void;
  unregister: (zone: ThreadZoneId) => void;
  motionOk: boolean;
}

const ThreadContext = createContext<ThreadContextValue | null>(null);

/** Ordem canônica do fio (para escolher dono inicial e avanço). */
const ZONE_ORDER: ReadonlyArray<ThreadZoneId> = [
  "hero",
  "services",
  "automation",
  "portfolio",
  "contact",
];

export default function AutomationThread({
  children,
}: {
  children: ReactNode;
}) {
  const motionOk = useMotionOk();
  const registeredRef = useRef<Set<ThreadZoneId>>(new Set());
  const [pulseOwner, setPulseOwner] = useState<ThreadZoneId | null>(null);

  // Handshake do plano (contrato D3) — barulhento em dev, silencioso em prod.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      for (const issue of validateThreadPlan()) {
        console.warn(`[AutomationThread] ${issue}`);
      }
    }
  }, []);

  /** Primeiro segmento registrado na ordem canônica do fio. */
  const firstRegistered = useCallback((): ThreadZoneId | null => {
    for (const zone of ZONE_ORDER) {
      if (registeredRef.current.has(zone)) return zone;
    }
    return null;
  }, []);

  const register = useCallback(
    (zone: ThreadZoneId) => {
      registeredRef.current.add(zone);
      setPulseOwner((owner) =>
        owner === null || !registeredRef.current.has(owner)
          ? firstRegistered()
          : owner,
      );
    },
    [firstRegistered],
  );

  const unregister = useCallback(
    (zone: ThreadZoneId) => {
      registeredRef.current.delete(zone);
      setPulseOwner((owner) => (owner === zone ? firstRegistered() : owner));
    },
    [firstRegistered],
  );

  const advancePulse = useCallback((from: ThreadZoneId) => {
    setPulseOwner((owner) => {
      if (owner !== from) return owner; // handoff antigo — ignora
      // Próxima zona REGISTRADA na ordem do fio (wrap incluído).
      let candidate = nextZone(from);
      for (let i = 0; i < ZONE_ORDER.length; i++) {
        if (registeredRef.current.has(candidate)) return candidate;
        candidate = nextZone(candidate);
      }
      return null;
    });
  }, []);

  const value = useMemo<ThreadContextValue>(
    () => ({
      // L5: sem motion não há dono — nenhum segmento renderiza pulso.
      pulseOwner: motionOk ? pulseOwner : null,
      advancePulse,
      register,
      unregister,
      motionOk,
    }),
    [motionOk, pulseOwner, advancePulse, register, unregister],
  );

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

/**
 * Hook interno do AutomationLine. Fora de um AutomationThread devolve um
 * contexto inerte (linha desenha, pulso não existe) — permite usar um
 * segmento isolado sem quebrar.
 */
export function useAutomationThread(): ThreadContextValue {
  const ctx = useContext(ThreadContext);
  const motionOk = useMotionOk();

  const inert = useMemo<ThreadContextValue>(
    () => ({
      pulseOwner: null,
      advancePulse: () => undefined,
      register: () => undefined,
      unregister: () => undefined,
      motionOk,
    }),
    [motionOk],
  );

  return ctx ?? inert;
}
