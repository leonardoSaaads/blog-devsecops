"use client";

import { useMemo, useState } from "react";
import { cascadedOsnrDb } from "@/lib/simulations/optics";
import { linearScale, niceTicks, polyline } from "./chart-utils";
import { InteractiveFigure, RangeField, Stat } from "./interactive-figure";

/** Approximate required OSNR (back-to-back + margin), for teaching purposes only. */
const FORMATS = [
  { name: "DP-QPSK · 100G", required: 13, color: "var(--success)" },
  { name: "DP-16QAM · 200G", required: 20, color: "var(--warning)" },
  { name: "DP-64QAM · 300G+", required: 26, color: "var(--danger)" },
] as const;

const W = 640;
const H = 260;
const PAD = { left: 44, right: 16, top: 16, bottom: 36 };
const MAX_SPANS = 40;

export function OsnrCalculator() {
  const [launch, setLaunch] = useState(1);
  const [lengthKm, setLengthKm] = useState(80);
  const [attenuation, setAttenuation] = useState(0.2);
  const [nf, setNf] = useState(5);
  const [spans, setSpans] = useState(10);

  const spanLoss = lengthKm * attenuation + 1; // + 1 dB for connectors/splices
  const osnr = cascadedOsnrDb({
    launchPowerDbm: launch,
    spanLossDb: spanLoss,
    noiseFigureDb: nf,
    spans,
  });

  const curve = useMemo(
    () =>
      Array.from({ length: MAX_SPANS }, (_, i) => {
        const value = cascadedOsnrDb({
          launchPowerDbm: launch,
          spanLossDb: spanLoss,
          noiseFigureDb: nf,
          spans: i + 1,
        });
        return [i + 1, value] as [number, number];
      }),
    [launch, spanLoss, nf],
  );

  const yMin = Math.min(5, Math.floor(Math.min(...curve.map(([, y]) => y)) - 2));
  const yMax = Math.max(35, Math.ceil(Math.max(...curve.map(([, y]) => y)) + 2));
  const x = linearScale([1, MAX_SPANS], [PAD.left, W - PAD.right]);
  const y = linearScale([yMin, yMax], [H - PAD.bottom, PAD.top]);

  return (
    <InteractiveFigure
      title="OSNR budget for a chain of EDFAs"
      description="OSNR ≈ 58 + P_launch − span_loss − NF − 10·log₁₀(N) (dB, in 0.1 nm @ 1550 nm). Tune the link and compare with the OSNR each format requires."
      testId="osnr-calculator"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <RangeField
            label="Launch power per channel"
            value={launch}
            min={-5}
            max={5}
            step={0.5}
            unit="dBm"
            onChange={setLaunch}
          />
          <RangeField
            label="Span length"
            value={lengthKm}
            min={20}
            max={150}
            step={5}
            unit="km"
            onChange={setLengthKm}
          />
          <RangeField
            label="Fiber attenuation"
            value={attenuation}
            min={0.15}
            max={0.3}
            step={0.01}
            unit="dB/km"
            onChange={setAttenuation}
          />
          <RangeField
            label="EDFA noise figure"
            value={nf}
            min={3}
            max={8}
            step={0.5}
            unit="dB"
            onChange={setNf}
          />
          <RangeField
            label="Number of spans (N)"
            value={spans}
            min={1}
            max={MAX_SPANS}
            unit={`(${spans * lengthKm} km)`}
            onChange={setSpans}
            testId="osnr-spans"
          />
        </div>

        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3">
            <Stat
              label="Loss per span"
              value={`${spanLoss.toFixed(1)} dB`}
              hint="includes 1 dB of connectors"
            />
            <Stat
              label="OSNR at the receiver"
              value={<span data-testid="osnr-value">{osnr.toFixed(1)} dB</span>}
              tone={osnr >= FORMATS[0].required ? "success" : "danger"}
            />
          </dl>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`OSNR versus number of spans; with ${spans} spans the OSNR is ${osnr.toFixed(1)} dB`}
          >
            {niceTicks(yMin, yMax, 5).map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  className="stroke-border"
                />
                <text
                  x={PAD.left - 8}
                  y={y(tick) + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {tick}
                </text>
              </g>
            ))}
            {[1, 10, 20, 30, 40].map((tick) => (
              <text
                key={tick}
                x={x(tick)}
                y={H - PAD.bottom + 18}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {tick}
              </text>
            ))}
            <text
              x={(W + PAD.left) / 2}
              y={H - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              number of spans (N)
            </text>
            {FORMATS.map((format) => (
              <g key={format.name}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(format.required)}
                  y2={y(format.required)}
                  stroke={format.color}
                  strokeDasharray="5 4"
                />
                <text
                  x={W - PAD.right}
                  y={y(format.required) - 5}
                  textAnchor="end"
                  fill={format.color}
                  className="text-[11px]"
                >
                  {format.name}
                </text>
              </g>
            ))}
            <path
              d={polyline(curve.map(([n, v]) => [x(n), y(v)]))}
              fill="none"
              className="stroke-accent"
              strokeWidth={2.5}
            />
            <circle
              cx={x(spans)}
              cy={y(osnr)}
              r={6}
              className="fill-accent stroke-card"
              strokeWidth={2}
            />
          </svg>

          <ul className="space-y-1.5 text-sm" aria-label="Margin per modulation format">
            {FORMATS.map((format) => {
              const margin = osnr - format.required;
              return (
                <li
                  key={format.name}
                  className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5"
                >
                  <span>{format.name}</span>
                  <span
                    className={margin >= 0 ? "font-mono text-success" : "font-mono text-danger"}
                  >
                    {margin >= 0 ? "✔" : "✘"} margin {margin >= 0 ? "+" : ""}
                    {margin.toFixed(1)} dB
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground">
            Linear model (ASE noise only). Nonlinear effects, transceiver penalties and aging lower
            the real-world value — see the GSNR section.
          </p>
        </div>
      </div>
    </InteractiveFigure>
  );
}
