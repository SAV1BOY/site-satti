"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "./AutomationLine.module.css";
import {
  getSegmentPlan,
  type ThreadZoneId,
  type ThreadWaypoint,
} from "./automation-thread-plan";
import { useAutomationThread } from "./AutomationThread";

/**
 * AutomationLine — um segmento do fio contínuo da Linha de Automação (D3).
 *
 * A seção hospedeira (position: relative) renderiza
 * `<AutomationLine zone="services" tone="light" />` como fundo decorativo
 * absoluto. A geometria vem do THREAD_PLAN (fonte única — contrato de
 * continuidade); os labels dos nodes vêm da seção via `nodeLabels`
 * (copy-law L1: texto nunca mora na geometria).
 *
 * Técnica (escolha registrada em DECISIONS.log):
 * - SVG por segmento com handshake de coordenadas do plano. O path é
 *   construído em PX REAIS do container (ResizeObserver), com cubics de
 *   tangente vertical — a fronteira entre seções fica invisível.
 * - Desenho no scroll: stroke-dasharray/offset por progresso, IO + rAF
 *   (L10). O tip da linha "cavalga" a 90% da altura da viewport, então
 *   quando a base de uma seção cruza esse eixo o segmento está completo
 *   e o seguinte começa no MESMO instante e no MESMO x — fio único.
 * - Pulso: círculo blaze viajando via offset-path/offset-distance CSS
 *   (nada de SMIL). Só existe no segmento DONO (AutomationThread garante
 *   UM pulso no site inteiro). animationend → passa o bastão.
 *
 * L5 (reduced-motion): linha 100% desenhada, nodes visíveis, sem pulso.
 * A11y: fundo puramente decorativo — wrapper aria-hidden.
 */

/** O tip do desenho cavalga neste eixo da viewport (fração da altura). */
const TIP_VH = 0.9;
/** Velocidade do pulso em px/s (constante entre segmentos → fio contínuo). */
const PULSE_SPEED = 260;
/** Raio dos nodes e do pulso (comp: nodes 4 · pulso 4.5). */
const NODE_R = 4;
const PULSE_R = 4.5;

type PulseStyle = CSSProperties & { "--pulse-duration": string };

interface AutomationLineProps {
  zone: ThreadZoneId;
  /** Tom da seção: troca os tokens de stroke (D1). Default: light. */
  tone?: "light" | "dark";
  /** Labels mono dos nodes, por slot do plano (ex.: {n1: "TRIGGER"}). */
  nodeLabels?: Partial<Record<string, string>>;
  className?: string;
}

interface Measured {
  width: number;
  height: number;
  d: string;
  length: number;
  points: ReadonlyArray<{ wp: ThreadWaypoint; x: number; y: number }>;
}

/** Cubics com tangente vertical entre waypoints consecutivos. */
function buildPath(
  waypoints: ReadonlyArray<ThreadWaypoint>,
  w: number,
  h: number,
): { d: string; points: Measured["points"] } {
  const px = waypoints.map((wp) => ({
    wp,
    x: Math.round(wp.x * w * 100) / 100,
    y: Math.round(wp.y * h * 100) / 100,
  }));

  let d = "";
  px.forEach((p, i) => {
    if (i === 0) {
      d = `M ${p.x} ${p.y}`;
      return;
    }
    const prev = px[i - 1];
    const dy = p.y - prev.y;
    // Controles verticais: curva entra/sai reta no eixo Y (costura D3).
    const k = Math.min(Math.max(dy * 0.45, 32), 260);
    d += ` C ${prev.x} ${prev.y + k}, ${p.x} ${p.y - k}, ${p.x} ${p.y}`;
  });

  return { d, points: px };
}

export default function AutomationLine({
  zone,
  tone = "light",
  nodeLabels,
  className,
}: AutomationLineProps) {
  const plan = useMemo(() => getSegmentPlan(zone), [zone]);
  const { pulseOwner, advancePulse, register, unregister, motionOk } =
    useAutomationThread();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const nodesRef = useRef<SVGGElement | null>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);

  // Registro no fio (dono do pulso é decidido pelo Thread).
  useEffect(() => {
    register(zone);
    return () => {
      unregister(zone);
    };
  }, [zone, register, unregister]);

  // Mede o container e (re)constrói o path em px reais.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (w === 0 || h === 0) return;
      const { d, points } = buildPath(plan.waypoints, w, h);
      setMeasured((prev) => {
        if (prev && prev.d === d) return prev;
        return { width: w, height: h, d, length: 0, points };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [plan]);

  // Comprimento real do path (após o d entrar no DOM).
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !measured || measured.length !== 0) return;
    const length = path.getTotalLength();
    setMeasured((prev) =>
      prev && prev.d === measured.d ? { ...prev, length } : prev,
    );
  }, [measured]);

  // Desenho no scroll: IO liga/desliga rAF; rAF lê rect e escreve
  // dashoffset + opacity dos nodes (L10: transform/opacity/stroke-offset).
  useEffect(() => {
    const root = rootRef.current;
    const path = pathRef.current;
    if (!root || !path || !measured || measured.length === 0) return;

    const len = measured.length;

    if (!motionOk) {
      // L5: linha 100% desenhada, nodes visíveis, nada anima.
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
      nodesRef.current
        ?.querySelectorAll<SVGGElement>(`.${styles.nodeGroup}`)
        .forEach((g) => {
          g.style.opacity = "";
        });
      return;
    }

    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    let raf = 0;
    let lastOffset = -1;

    const frame = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (vh * TIP_VH - rect.top) / rect.height),
      );
      const offset = Math.round(len * (1 - progress) * 10) / 10;
      if (offset !== lastOffset) {
        lastOffset = offset;
        path.style.strokeDashoffset = `${offset}`;
        // Node aparece quando o tip passa pelo seu y (path monotônico em y).
        nodesRef.current
          ?.querySelectorAll<SVGGElement>(`.${styles.nodeGroup}`)
          .forEach((g) => {
            const at = Number(g.dataset.at ?? "0");
            g.style.opacity = progress >= at ? "1" : "0";
          });
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "15% 0px 15% 0px" },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
    };
  }, [measured, motionOk]);

  const handlePulseEnd = useCallback(() => {
    advancePulse(zone);
  }, [advancePulse, zone]);

  const ready = measured !== null && measured.length > 0;
  const ownsPulse = ready && motionOk && pulseOwner === zone;

  const pulseStyle: PulseStyle | undefined =
    ownsPulse && measured
      ? {
          offsetPath: `path("${measured.d}")`,
          "--pulse-duration": `${Math.max(measured.length / PULSE_SPEED, 2)}s`,
        }
      : undefined;

  return (
    <div
      ref={rootRef}
      className={[styles.root, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {measured ? (
        <svg
          className={styles.svg}
          data-ready={ready ? "true" : undefined}
          viewBox={`0 0 ${measured.width} ${measured.height}`}
          preserveAspectRatio="none"
        >
          <path ref={pathRef} className={styles.path} d={measured.d} />

          <g ref={nodesRef}>
            {measured.points
              .filter((p) => p.wp.slot !== undefined)
              .map((p) => {
                const slot = p.wp.slot as string;
                const label = nodeLabels?.[slot];
                const anchorStart = p.wp.x <= 0.6;
                return (
                  <g
                    key={slot}
                    className={styles.nodeGroup}
                    data-at={p.wp.y}
                  >
                    <circle
                      className={styles.node}
                      cx={p.x}
                      cy={p.y}
                      r={NODE_R}
                    />
                    {label ? (
                      <text
                        className={styles.nodeLabel}
                        x={anchorStart ? p.x + 14 : p.x - 14}
                        y={p.y + 4}
                        textAnchor={anchorStart ? "start" : "end"}
                      >
                        {label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
          </g>

          {ownsPulse ? (
            <circle
              className={`${styles.pulse} ${styles.pulseRun}`}
              r={PULSE_R}
              style={pulseStyle}
              onAnimationEnd={handlePulseEnd}
            />
          ) : null}
        </svg>
      ) : null}
    </div>
  );
}
