"use client";

import { useState } from "react";
import {
  extrapolatedRate,
  generateCounter,
  instantRate,
  naiveDelta,
  rateSeries,
  selectRange,
} from "@/lib/simulations/promql";
import { linearScale, niceTicks, polyline } from "./chart-utils";
import { InteractiveFigure, RangeField, Stat, controlToggle } from "./interactive-figure";

const W = 680;
const H = 150;
const PAD = { left: 52, right: 12 };
const DURATION = 1200;
const STEP = 15;
const WINDOWS = [60, 120, 300] as const;
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function Axis({
  ticks,
  scale,
  format,
}: {
  ticks: number[];
  scale: (value: number) => number;
  format: (value: number) => string;
}) {
  return (
    <g className="text-[10px]">
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={scale(tick)}
            y2={scale(tick)}
            className="stroke-border"
            strokeDasharray="2 4"
          />
          <text
            x={PAD.left - 6}
            y={scale(tick) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
          >
            {format(tick)}
          </text>
        </g>
      ))}
    </g>
  );
}

export function RateExplainer() {
  const [withReset, setWithReset] = useState(true);
  const [range, setRange] = useState<(typeof WINDOWS)[number]>(120);
  const [cursor, setCursor] = useState(660);

  const samples = generateCounter({
    duration: DURATION,
    step: STEP,
    ratePerSecond: 6,
    resetAt: withReset ? 600 : undefined,
  });
  const series = rateSeries(samples, range, STEP);
  const end = Math.max(cursor, range);
  const start = end - range;
  const inWindow = selectRange(samples, start, end);
  const rate = extrapolatedRate(samples, start, end);
  const increase = extrapolatedRate(samples, start, end, false);
  const delta = naiveDelta(samples, start, end);
  const irate = instantRate(samples, start, end);

  const x = linearScale([0, DURATION], [PAD.left, W - PAD.right]);
  const maxV = Math.max(...samples.map((sample) => sample.v));
  const yCounter = linearScale([0, maxV * 1.05], [H - 16, 10]);
  const maxRate = Math.max(...series.map((point) => point.value), 1);
  const yRate = linearScale([0, maxRate * 1.15], [H - 16, 10]);

  return (
    <InteractiveFigure
      title="Do contador bruto à taxa: rate() e increase() no PromQL"
      description="Acima, um contador raspado a cada 15 s (com reinício do processo em t = 600 s). Abaixo, rate() avaliado a cada passo. Arraste a janela e compare com a diferença ingênua."
      testId="rate-explainer"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Janela:</span>
          {WINDOWS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              onClick={() => setRange(value)}
              className={controlToggle(range === value, "font-mono text-xs")}
            >
              [{value / 60}m]
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withReset}
              onChange={(event) => setWithReset(event.target.checked)}
              className="size-4 accent-[var(--accent)]"
              data-testid="rate-reset"
            />
            Reinício do processo em t = 600 s
          </label>
        </div>

        <RangeField
          label="Instante da consulta (fim da janela)"
          value={end}
          min={range}
          max={DURATION}
          step={STEP}
          unit="s"
          onChange={setCursor}
          testId="rate-cursor"
        />

        <figure className="space-y-1">
          <p className="font-mono text-xs text-muted-foreground">
            node_network_receive_bytes_total (amostras)
          </p>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label="Contador monotônico com amostras a cada 15 segundos e a janela selecionada destacada"
          >
            <Axis
              ticks={niceTicks(0, maxV, 3)}
              scale={yCounter}
              format={(value) => `${number.format(value / 1000)}k`}
            />
            <rect
              x={x(start)}
              y={6}
              width={x(end) - x(start)}
              height={H - 22}
              className="fill-accent-soft"
              opacity={0.7}
            />
            <path
              d={polyline(samples.map((sample) => [x(sample.t), yCounter(sample.v)]))}
              fill="none"
              className="stroke-muted-foreground"
              strokeWidth={1.2}
            />
            {samples.map((sample) => (
              <circle
                key={sample.t}
                cx={x(sample.t)}
                cy={yCounter(sample.v)}
                r={sample.t > start && sample.t <= end ? 3 : 1.6}
                className={
                  sample.t > start && sample.t <= end ? "fill-accent" : "fill-muted-foreground"
                }
              />
            ))}
          </svg>
          <p className="font-mono text-xs text-muted-foreground">
            rate(…[{range / 60}m]) — bytes/s
          </p>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label="Taxa calculada por rate ao longo do tempo"
          >
            <Axis
              ticks={niceTicks(0, maxRate, 3)}
              scale={yRate}
              format={(value) => number.format(value)}
            />
            <path
              d={polyline(series.map((point) => [x(point.t), yRate(point.value)]))}
              fill="none"
              className="stroke-accent"
              strokeWidth={2}
            />
            <line
              x1={x(end)}
              x2={x(end)}
              y1={8}
              y2={H - 16}
              className="stroke-signal"
              strokeDasharray="3 3"
            />
            {rate !== null && (
              <circle cx={x(end)} cy={yRate(rate)} r={4.5} className="fill-signal" />
            )}
            {[0, 300, 600, 900, 1200].map((tick) => (
              <text
                key={tick}
                x={x(tick)}
                y={H - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}s
              </text>
            ))}
          </svg>
        </figure>

        <dl className="grid gap-3 sm:grid-cols-4">
          <Stat label="Amostras na janela" value={inWindow.length} />
          <Stat
            label={`rate([${range / 60}m])`}
            value={
              <span data-testid="rate-value">
                {rate === null ? "—" : `${number.format(rate)} B/s`}
              </span>
            }
            tone="success"
          />
          <Stat
            label={`increase([${range / 60}m])`}
            value={increase === null ? "—" : `${number.format(increase)} B`}
          />
          <Stat
            label="Último − primeiro (ingênuo)"
            value={
              <span data-testid="naive-delta">
                {delta === null ? "—" : `${number.format(delta)} B`}
              </span>
            }
            tone={delta !== null && delta < 0 ? "danger" : undefined}
            hint={irate === null ? undefined : `irate: ${number.format(irate)} B/s`}
          />
        </dl>
      </div>
    </InteractiveFigure>
  );
}
