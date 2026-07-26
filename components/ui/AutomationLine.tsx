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
import { useScrollTimeline } from "@/hooks/useScrollTimeline";

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
 * - Desenho no scroll: stroke-dasharray/offset por progresso, via o loop
 *   COMPARTILHADO (useScrollTimeline) — não há rAF próprio aqui (L10 +
 *   teto de 2 loops persistentes do projeto).
 * - Pulso: círculo blaze viajando via offset-path/offset-distance CSS
 *   (nada de SMIL). Só existe no segmento DONO (AutomationThread garante
 *   UM pulso no site inteiro). animationend → passa o bastão.
 *
 * L5 (reduced-motion): linha 100% desenhada, nodes visíveis, sem pulso.
 * O ScrollProvider nem monta o loop nesse modo, então o track é inerte
 * por construção.
 * A11y: fundo puramente decorativo — wrapper aria-hidden.
 */

/** O tip do desenho cavalga neste eixo da viewport (fração da altura). */
const TIP_VH = 0.9;
/**
 * Teto do span de desenho, em viewports. Sem ele o progresso é
 * normalizado pela altura INTEIRA da seção: numa seção de 3.758 px
 * (a S6 do modelo) o desenho só fecharia no fim absoluto da seção, e no
 * meio dela a ponta ficaria centenas de px abaixo da dobra — na tela a
 * linha parece já desenhada e o efeito desaparece. Com o teto, seções
 * curtas (≤ 2 viewports: as outras 4 zonas) se comportam exatamente
 * como antes, e seções longas desenham numa cadência humana.
 */
const TIP_SPAN_VH = 2;
/** Velocidade do pulso em px/s (constante entre segmentos → fio contínuo). */
const PULSE_SPEED = 260;
/** Raio dos nodes e do pulso (comp: nodes 4 · pulso 4.5). */
const NODE_R = 4;
const PULSE_R = 4.5;
/**
 * Só re-mede o path se o container mudou mais que isto. Cada rebuild
 * força um getTotalLength() (layout sincrono) por segmento; sem a
 * quantização, uma barra de endereço de mobile aparecendo/desaparecendo
 * remede tudo dezenas de vezes.
 */
const REMEASURE_EPS = 8;

const SVG_NS = "http://www.w3.org/2000/svg";

type PulseStyle = CSSProperties & { "--pulse-duration": string };

interface AutomationLineProps {
  /** Zona do THREAD_PLAN. "automation" é obsoleta (ponte → automation-a). */
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
  /** Path completo. */
  d: string;
  /** Comando M inicial (base dos prefixos usados para medir arco). */
  head: string;
  /** Um comando C por par de waypoints — na ordem do plano. */
  segments: ReadonlyArray<string>;
  length: number;
  points: ReadonlyArray<{ wp: ThreadWaypoint; x: number; y: number }>;
  /**
   * Fração de COMPRIMENTO DE ARCO de cada waypoint (índice alinhado a
   * `points`). null até o path entrar no DOM e ser medido.
   */
  ats: ReadonlyArray<number> | null;
}

/** Cubics com tangente vertical entre waypoints consecutivos. */
function buildPath(
  waypoints: ReadonlyArray<ThreadWaypoint>,
  w: number,
  h: number,
): { d: string; head: string; segments: string[]; points: Measured["points"] } {
  const px = waypoints.map((wp) => ({
    wp,
    x: Math.round(wp.x * w * 100) / 100,
    y: Math.round(wp.y * h * 100) / 100,
  }));

  const first = px[0];
  if (first === undefined) return { d: "", head: "", segments: [], points: px };

  const head = `M ${first.x} ${first.y}`;
  const segments: string[] = [];

  for (let i = 1; i < px.length; i += 1) {
    const p = px[i];
    const prev = px[i - 1];
    if (p === undefined || prev === undefined) continue;
    const dy = p.y - prev.y;
    /* Controles verticais: a curva entra/sai reta no eixo Y (costura D3).
       O TETO é proporcional à altura, não fixo em 260 px: num container
       de 3.758 px o maior vão da zona dá 1.203 px de dy, 0,45× disso
       satura em qualquer teto constante e TODOS os trechos longos passam
       a receber o mesmo handle — as cúbicas degeneram em verticais com
       dobras nos waypoints. A 1.080 px de altura h*0.24 = 259,2, ou seja
       visualmente idêntico ao teto antigo: zero regressão nas outras
       4 zonas. */
    const k = Math.min(Math.max(dy * 0.45, 32), h * 0.24);
    segments.push(
      ` C ${prev.x} ${prev.y + k}, ${p.x} ${p.y - k}, ${p.x} ${p.y}`,
    );
  }

  return { d: head + segments.join(""), head, segments, points: px };
}

export default function AutomationLine({
  zone,
  tone = "light",
  nodeLabels,
  className,
}: AutomationLineProps) {
  const zoneId = zone;
  const plan = useMemo(() => getSegmentPlan(zoneId), [zoneId]);
  const { pulseOwner, advancePulse, register, unregister, motionOk } =
    useAutomationThread();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const nodesRef = useRef<SVGGElement | null>(null);
  const defsRef = useRef<SVGDefsElement | null>(null);
  const boxRef = useRef({ w: -1, h: -1 });
  const [measured, setMeasured] = useState<Measured | null>(null);

  // Registro no fio (dono do pulso é decidido pelo Thread).
  useEffect(() => {
    register(zoneId);
    return () => {
      unregister(zoneId);
    };
  }, [zoneId, register, unregister]);

  /* ---------------------------------------------------------------- *
   * Track no loop compartilhado (substitui o rAF que existia aqui).
   * `read` só lê rect; `write` só escreve estilo — a separação é o que
   * garante um flush de layout por frame na página inteira.
   * ---------------------------------------------------------------- */
  const attachTrack = useScrollTimeline<number | null>({
    read: (el, { vh }) => {
      if (!motionOk || !measured || measured.length === 0) return null;
      const rect = el.getBoundingClientRect();
      const span = Math.min(rect.height, TIP_SPAN_VH * vh);
      if (span <= 0) return null;
      const progress = Math.min(
        1,
        Math.max(0, (vh * TIP_VH - rect.top) / span),
      );
      return Math.round(measured.length * (1 - progress) * 10) / 10;
    },
    write: (_el, offset) => {
      const path = pathRef.current;
      if (offset === null || !path || !measured || measured.length === 0) return;
      path.style.strokeDashoffset = `${offset}`;
      /* Aritmética, não leitura de layout: o progresso é reconstruído do
         próprio offset já calculado na fase de leitura. */
      const progress = 1 - offset / measured.length;
      nodesRef.current
        ?.querySelectorAll<SVGGElement>(`.${styles.nodeGroup}`)
        .forEach((g) => {
          const at = Number(g.dataset.at ?? "0");
          g.style.opacity = progress >= at ? "1" : "0";
        });
    },
  });

  /* rootRef alimenta a medição; attachTrack inscreve no loop. Um único
     callback estável para os dois — um ref inline seria recriado a cada
     render e des/reinscreveria o elemento. */
  const setRoot = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      attachTrack(el);
    },
    [attachTrack],
  );

  // Mede o container e (re)constrói o path em px reais.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (w === 0 || h === 0) return;
      const box = boxRef.current;
      if (
        box.w >= 0 &&
        Math.abs(w - box.w) <= REMEASURE_EPS &&
        Math.abs(h - box.h) <= REMEASURE_EPS
      ) {
        return; // ruído de resize: o viewBox absorve (preserveAspectRatio=none)
      }
      boxRef.current = { w, h };
      const built = buildPath(plan.waypoints, w, h);
      setMeasured((prev) => {
        if (prev && prev.d === built.d) return prev;
        return {
          width: w,
          height: h,
          d: built.d,
          head: built.head,
          segments: built.segments,
          length: 0,
          points: built.points,
          ats: null,
        };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [plan]);

  /* Comprimento real do path + fração de arco de cada waypoint.
     A fração de ARCO (e não `wp.y`) é o que gateia a revelação dos
     nodes: com o span de desenho limitado a 2 viewports o progresso
     deixou de mapear em y, e mesmo antes disso o critério estava
     errado — um node num trecho quase horizontal acendia cedo porque
     ali o y é achatado. Medimos por prefixos do próprio path (um
     <path> descartável dentro de <defs>, que não renderiza), o que é
     exato e não assume monotonicidade em y. */
  useEffect(() => {
    const path = pathRef.current;
    const defs = defsRef.current;
    if (!path || !measured || measured.length !== 0) return;
    const length = path.getTotalLength();
    if (length === 0) return;

    let ats: number[] = [0];
    if (defs) {
      const probe = document.createElementNS(SVG_NS, "path");
      defs.appendChild(probe);
      let acc = measured.head;
      for (const seg of measured.segments) {
        acc += seg;
        probe.setAttribute("d", acc);
        ats.push(Math.min(1, probe.getTotalLength() / length));
      }
      probe.remove();
    }
    /* Salvaguarda: se a medição por prefixos não fechar (UA sem
       geometria em <defs>), cai no critério antigo por y. */
    const tail = ats[ats.length - 1] ?? 0;
    if (ats.length !== measured.points.length || tail < 0.98) {
      ats = measured.points.map((p) => p.wp.y);
    }

    setMeasured((prev) =>
      prev && prev.d === measured.d ? { ...prev, length, ats } : prev,
    );
  }, [measured]);

  /* Estado inicial do dash (o track escreve só o offset por frame) e
     limpeza. O ScrollProvider devolve estilos do ELEMENTO REGISTRADO —
     aqui o que anima é o <path> filho, então a limpeza é nossa. */
  useEffect(() => {
    const path = pathRef.current;
    const nodes = nodesRef.current;
    if (!path || !measured || measured.length === 0) return;

    const clear = () => {
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
      nodes
        ?.querySelectorAll<SVGGElement>(`.${styles.nodeGroup}`)
        .forEach((g) => {
          g.style.opacity = "";
        });
    };

    if (!motionOk) {
      // L5: linha 100% desenhada, nodes visíveis, nada anima.
      clear();
      return;
    }

    path.style.strokeDasharray = `${measured.length}`;
    path.style.strokeDashoffset = `${measured.length}`;
    return clear;
  }, [measured, motionOk]);

  const handlePulseEnd = useCallback(() => {
    advancePulse(zoneId);
  }, [advancePulse, zoneId]);

  const ready = measured !== null && measured.length > 0;
  const ownsPulse = ready && motionOk && pulseOwner === zoneId;

  const pulseStyle: PulseStyle | undefined =
    ownsPulse && measured
      ? {
          offsetPath: `path("${measured.d}")`,
          "--pulse-duration": `${Math.max(measured.length / PULSE_SPEED, 2)}s`,
        }
      : undefined;

  return (
    <div
      ref={setRoot}
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
          <defs ref={defsRef} />
          <path ref={pathRef} className={styles.path} d={measured.d} />

          <g ref={nodesRef}>
            {measured.points
              .flatMap((p, i) => (p.wp.slot === undefined ? [] : [{ p, i }]))
              .map(({ p, i }) => {
                const slot = p.wp.slot as string;
                const label = nodeLabels?.[slot];
                const anchorStart = p.wp.x <= 0.6;
                return (
                  <g
                    key={slot}
                    className={styles.nodeGroup}
                    data-at={measured.ats?.[i] ?? p.wp.y}
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
