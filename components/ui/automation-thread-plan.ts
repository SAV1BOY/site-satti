/**
 * Plano geométrico da Linha de Automação (D3) — fonte única da verdade
 * do fio contínuo hero → serviços → automação → portfólio → contato.
 *
 * Contrato de continuidade (ULTRAGOAL §4 D3):
 * - O eixo X de SAÍDA de cada segmento (último waypoint, y=1) é IGUAL ao
 *   eixo X de ENTRADA do seguinte (primeiro waypoint, y=0). Sem gaps,
 *   sem resets — validado por validateThreadPlan() em dev.
 * - Tangentes verticais nas fronteiras (AutomationLine gera cubics com
 *   controles verticais), então a costura entre seções é invisível.
 * - O fio NASCE no hero (primeiro waypoint com y > 0) e TERMINA no
 *   contato (último waypoint com y < 1).
 *
 * Coordenadas em frações: x = fração da largura da seção (0..1),
 * y = fração da altura da seção (0..1). Nodes (círculo + label mono)
 * ancoram em waypoints com `slot`; o LABEL vem da seção consumidora
 * (copy-law L1 — geometria aqui, texto nunca).
 */

export type ThreadZoneId =
  | "hero"
  | "services"
  | "automation"
  | "portfolio"
  | "contact";

export interface ThreadWaypoint {
  /** Fração da largura da seção (0 = esquerda, 1 = direita). */
  x: number;
  /** Fração da altura da seção (0 = topo, 1 = base). */
  y: number;
  /** Âncora de node: chave usada pela seção em `nodeLabels[slot]`. */
  slot?: string;
}

export interface ThreadSegmentPlan {
  id: ThreadZoneId;
  /** Ordem do segmento no fio (0 = hero). O pulso viaja nesta ordem. */
  order: number;
  waypoints: ReadonlyArray<ThreadWaypoint>;
}

export const THREAD_PLAN: ReadonlyArray<ThreadSegmentPlan> = [
  {
    id: "hero",
    order: 0,
    waypoints: [
      { x: 0.115, y: 0.38 },
      { x: 0.115, y: 0.74, slot: "start" },
      { x: 0.32, y: 1 },
    ],
  },
  {
    id: "services",
    order: 1,
    waypoints: [
      { x: 0.32, y: 0 },
      { x: 0.68, y: 0.28, slot: "n1" },
      { x: 0.68, y: 0.62, slot: "n2" },
      { x: 0.46, y: 1 },
    ],
  },
  {
    id: "automation",
    order: 2,
    waypoints: [
      { x: 0.46, y: 0 },
      { x: 0.24, y: 0.3, slot: "n1" },
      { x: 0.76, y: 0.62, slot: "n2" },
      { x: 0.52, y: 0.86, slot: "n3" },
      { x: 0.6, y: 1 },
    ],
  },
  {
    id: "portfolio",
    order: 3,
    waypoints: [
      { x: 0.6, y: 0 },
      { x: 0.4, y: 0.5, slot: "n1" },
      { x: 0.22, y: 1 },
    ],
  },
  {
    id: "contact",
    order: 4,
    waypoints: [
      { x: 0.22, y: 0 },
      { x: 0.5, y: 0.42, slot: "end" },
    ],
  },
];

export function getSegmentPlan(id: ThreadZoneId): ThreadSegmentPlan {
  const seg = THREAD_PLAN.find((s) => s.id === id);
  if (!seg) throw new Error(`AutomationLine: zona desconhecida "${id}"`);
  return seg;
}

/** Próximo segmento na ordem do fio (com wrap contato → hero). */
export function nextZone(id: ThreadZoneId): ThreadZoneId {
  const sorted = [...THREAD_PLAN].sort((a, b) => a.order - b.order);
  const i = sorted.findIndex((s) => s.id === id);
  const next = sorted[(i + 1) % sorted.length];
  return next.id;
}

/** Valida o contrato de continuidade (dev only — chamado pelo Thread). */
export function validateThreadPlan(): string[] {
  const issues: string[] = [];
  const sorted = [...THREAD_PLAN].sort((a, b) => a.order - b.order);

  sorted.forEach((seg, i) => {
    const first = seg.waypoints[0];
    const last = seg.waypoints[seg.waypoints.length - 1];
    if (!first || !last) {
      issues.push(`${seg.id}: segmento sem waypoints`);
      return;
    }
    if (i > 0 && first.y !== 0) {
      issues.push(`${seg.id}: entrada deve estar em y=0 (está em ${first.y})`);
    }
    if (i < sorted.length - 1 && last.y !== 1) {
      issues.push(`${seg.id}: saída deve estar em y=1 (está em ${last.y})`);
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      const prevExit = prev.waypoints[prev.waypoints.length - 1];
      if (prevExit && prevExit.x !== first.x) {
        issues.push(
          `handshake quebrado ${prev.id} → ${seg.id}: saída x=${prevExit.x} ≠ entrada x=${first.x}`,
        );
      }
    }
  });

  return issues;
}
