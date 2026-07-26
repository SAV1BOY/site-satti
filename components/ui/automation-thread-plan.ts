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
 *
 * ─────────────────────────────────────────────────────────────────────
 * CONTRATO COM A W12 — a S6 renderiza DOIS <AutomationLine>
 * ─────────────────────────────────────────────────────────────────────
 * A zona "automation" foi DIVIDIDA em "automation-a" e "automation-b"
 * (W11-F). O motivo é o pulso, não a geometria: o pulso viaja a
 * PULSE_SPEED px/s constante e o bastão só passa no `animationend` do
 * segmento dono. Com a S6 crescendo de ~1.140 px para os 3.758 px do
 * modelo, o segmento único passaria a ter ~3.900 px de arco → ~15 s de
 * viagem, um quarto de minuto em que nenhuma outra zona pode ser dona
 * do único pulso do site. Aumentar PULSE_SPEED quebraria a invariante
 * de px/s constante (é ela que faz o fio parecer UM fio). Dividir a
 * zona em dois sub-blocos de ~1.879 px preserva as duas coisas.
 *
 * Portanto a S6 (components/sections/automation/Automation.tsx, da W12)
 * deve renderizar DOIS segmentos, um por sub-bloco, cada um ancorado no
 * seu próprio wrapper `position: relative` de ~metade da seção:
 *
 *   <div className={styles.blockA}>   // ~1.879 px
 *     <AutomationLine zone="automation-a" tone="dark"
 *                     nodeLabels={{ n1: steps[0], n2: steps[1] }} />
 *   </div>
 *   <div className={styles.blockB}>   // ~1.879 px
 *     <AutomationLine zone="automation-b" tone="dark"
 *                     nodeLabels={{ n3: steps[2] }} />
 *   </div>
 *
 * Os 3 labels oficiais de `automation.steps` continuam cobertos: n1/n2
 * no sub-bloco A, n3 no B. O handshake A→B acontece no MESMO x (0,62),
 * então a costura entre os dois wrappers é invisível — é o mesmo
 * contrato de continuidade das fronteiras de seção.
 */

export type ThreadZoneId =
  | "hero"
  | "services"
  | "automation-a"
  | "automation-b"
  | "portfolio"
  | "contact";

/**
 * Ids aceitos mas obsoletos. Existe UM: a zona "automation" antes do
 * split da W11-F. Resolve para o sub-bloco A. Some com a W12.
 */
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
  /* Sub-blocos da S6. O x-swing aqui é DELIBERADAMENTE quase full-bleed
     (0,06 … 0,94): o path do modelo é um S largo que estoura as duas
     bordas do container, enquanto o nosso era timidamente central
     (0,24 … 0,76) e lia como uma linha vertical com cotoveladas. */
  {
    id: "automation-a",
    order: 2,
    waypoints: [
      { x: 0.46, y: 0 },
      { x: 0.06, y: 0.32, slot: "n1" },
      { x: 0.94, y: 0.68, slot: "n2" },
      { x: 0.62, y: 1 },
    ],
  },
  {
    id: "automation-b",
    order: 3,
    waypoints: [
      { x: 0.62, y: 0 },
      { x: 0.08, y: 0.34 },
      { x: 0.92, y: 0.66, slot: "n3" },
      { x: 0.6, y: 1 },
    ],
  },
  {
    id: "portfolio",
    order: 4,
    waypoints: [
      { x: 0.6, y: 0 },
      { x: 0.4, y: 0.5, slot: "n1" },
      { x: 0.22, y: 1 },
    ],
  },
  {
    id: "contact",
    order: 5,
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
