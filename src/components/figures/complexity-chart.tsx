"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  COMPLEXITIES,
  crossover,
  estimateSeconds,
  formatDuration,
  type ComplexityId,
} from "@/lib/simulations/complexity";
import { linearScale, polyline } from "./chart-utils";
import { InteractiveFigure, RangeField, controlToggle } from "./interactive-figure";

const W = 640;
const H = 280;
const PAD = { left: 56, right: 16, top: 12, bottom: 30 };
const LOG_N = [1, 7] as const; // n de 10 a 10⁷
const LOG_T = [-9, 4] as const; // de 1 ns a ~3 h

const COLORS: Record<ComplexityId, string> = {
  log: "var(--success)",
  n: "var(--accent)",
  nlogn: "oklch(0.6 0.15 300)",
  n2: "var(--signal)",
  "2n": "var(--danger)",
};

const SECOND_LABELS: Record<number, string> = {
  [-9]: "1 ns",
  [-6]: "1 µs",
  [-3]: "1 ms",
  0: "1 s",
  3: "17 min",
};

export function ComplexityChart() {
  const [logN, setLogN] = useState(4);
  const [factor, setFactor] = useState(50);
  const [visible, setVisible] = useState<Set<ComplexityId>>(() => new Set(["n", "nlogn", "n2"]));
  const n = Math.round(10 ** logN);
  const fast = 1;
  const slow = factor;
  const cross = crossover("nlogn", slow, "n2", fast);

  const x = linearScale([...LOG_N], [PAD.left, W - PAD.right]);
  const y = linearScale([...LOG_T], [H - PAD.bottom, PAD.top]);
  const curve = (id: ComplexityId, nsPerOp: number) =>
    polyline(
      Array.from({ length: 121 }, (_, index) => {
        const lx = LOG_N[0] + ((LOG_N[1] - LOG_N[0]) * index) / 120;
        const seconds = estimateSeconds(id, 10 ** lx, nsPerOp);
        const ly = Math.min(LOG_T[1] + 1, Math.max(LOG_T[0] - 1, Math.log10(seconds)));
        return [x(lx), y(ly)] as [number, number];
      }),
    );

  const toggle = (id: ComplexityId) =>
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <InteractiveFigure
      title="Algoritmo × linguagem: tempo estimado em escala log-log"
      description="Linhas cheias: linguagem compilada (1 ns por operação). Tracejadas: interpretada, com o fator de lentidão escolhido. A inclinação (o algoritmo) logo domina o deslocamento vertical (a linguagem)."
      testId="complexity-chart"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Complexidades exibidas">
          {COMPLEXITIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={visible.has(item.id)}
              onClick={() => toggle(item.id)}
              className={controlToggle(visible.has(item.id), "font-mono text-xs")}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ background: COLORS[item.id] }}
                aria-hidden="true"
              />
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <RangeField
            label="Tamanho da entrada n = 10^k"
            value={logN}
            min={1}
            max={7}
            step={0.1}
            unit={`(n ≈ ${new Intl.NumberFormat("pt-BR").format(n)})`}
            onChange={setLogN}
            testId="complexity-n"
          />
          <RangeField
            label="Interpretada é mais lenta em"
            value={factor}
            min={5}
            max={100}
            step={5}
            unit="×"
            onChange={setFactor}
            testId="complexity-factor"
          />
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Curvas de tempo de execução por complexidade, em escala logarítmica"
        >
          {[-9, -6, -3, 0, 3].map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-border"
                strokeDasharray="2 4"
              />
              <text
                x={PAD.left - 6}
                y={y(tick) + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {SECOND_LABELS[tick]}
              </text>
            </g>
          ))}
          {[1, 3, 5, 7].map((tick) => (
            <text
              key={tick}
              x={x(tick)}
              y={H - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              n = 10{["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷"][tick]}
            </text>
          ))}
          <defs>
            <clipPath id="complexity-clip">
              <rect
                x={PAD.left}
                y={PAD.top}
                width={W - PAD.left - PAD.right}
                height={H - PAD.top - PAD.bottom}
              />
            </clipPath>
          </defs>
          <g clipPath="url(#complexity-clip)">
            {COMPLEXITIES.filter((item) => visible.has(item.id)).map((item) => (
              <g key={item.id}>
                <path
                  d={curve(item.id, fast)}
                  fill="none"
                  stroke={COLORS[item.id]}
                  strokeWidth={2.2}
                />
                <path
                  d={curve(item.id, slow)}
                  fill="none"
                  stroke={COLORS[item.id]}
                  strokeWidth={1.6}
                  strokeDasharray="6 4"
                  opacity={0.85}
                />
              </g>
            ))}
          </g>
          <line
            x1={x(logN)}
            x2={x(logN)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            className="stroke-foreground"
            strokeOpacity={0.4}
          />
        </svg>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm" data-testid="complexity-table">
            <caption className="sr-only">Tempo estimado para n ≈ {n}</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Algoritmo
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Compilada
                </th>
                <th scope="col" className="py-2 font-medium">
                  Interpretada ({factor}×)
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPLEXITIES.map((item) => (
                <tr
                  key={item.id}
                  className={cn("border-b border-border/60", !visible.has(item.id) && "opacity-50")}
                >
                  <th
                    scope="row"
                    className="py-1.5 pr-4 text-left font-mono text-[13px] font-medium"
                  >
                    {item.label}
                  </th>
                  <td className="py-1.5 pr-4 font-mono text-[13px] tabular-nums">
                    {formatDuration(estimateSeconds(item.id, n, fast))}
                  </td>
                  <td className="py-1.5 font-mono text-[13px] tabular-nums">
                    {formatDuration(estimateSeconds(item.id, n, slow))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cross !== null && (
          <p
            className="rounded-xl border border-accent/40 bg-accent-soft/50 p-3 font-serif text-[1.02rem]"
            data-testid="complexity-crossover"
          >
            Com um fator de {factor}×, um algoritmo{" "}
            <strong>O(n log n) na linguagem interpretada</strong> supera um{" "}
            <strong>O(n²) compilado</strong> a partir de{" "}
            <strong className="font-mono">
              n ≈ {new Intl.NumberFormat("pt-BR").format(cross)}
            </strong>{" "}
            elementos.
          </p>
        )}
      </div>
    </InteractiveFigure>
  );
}
