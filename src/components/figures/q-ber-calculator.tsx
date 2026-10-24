"use client";

import { useState } from "react";
import { berToQ, dbToQ, qToBer, qToDb } from "@/lib/simulations/optics";
import { linearScale, polyline } from "./chart-utils";
import { InteractiveFigure, RangeField, Stat } from "./interactive-figure";

/** Typical pre-FEC BER thresholds cited in the literature (reference values). */
const FEC_THRESHOLDS = [
  { name: "HD-FEC (~7% OH)", ber: 3.8e-3 },
  { name: "SD-FEC (~20% OH)", ber: 2.4e-2 },
] as const;

const W = 640;
const H = 200;

function formatBer(ber: number): string {
  if (ber < 1e-300) return "< 1e-300";
  const [mantissa, exponent] = ber.toExponential(2).split("e");
  return `${mantissa} × 10^${Number(exponent)}`;
}

export function QBerCalculator() {
  const [qDb, setQDb] = useState(10);
  const q = dbToQ(qDb);
  const ber = qToBer(q);

  // Two Gaussians (levels "0" and "1") with the decision threshold in the middle.
  const curves = (() => {
    const sigma = 1 / (2 * q); // levels at ±0.5 → Q = 1/(2σ)
    const x = linearScale([-1.6, 1.6], [16, W - 16]);
    const samples = 240;
    const pdf = (value: number, mean: number) =>
      Math.exp(-((value - mean) ** 2) / (2 * sigma ** 2));
    const points = (mean: number) =>
      Array.from({ length: samples + 1 }, (_, k) => {
        const value = -1.6 + (3.2 * k) / samples;
        return [x(value), H - 24 - pdf(value, mean) * (H - 48)] as [number, number];
      });
    return { zero: polyline(points(-0.5)), one: polyline(points(0.5)), threshold: x(0) };
  })();

  return (
    <InteractiveFigure
      title="Q-factor ↔ BER"
      description="BER = ½·erfc(Q/√2). The farther apart the levels are relative to the noise, the smaller the overlap — and the lower the error rate."
      testId="q-ber-calculator"
    >
      <div className="space-y-5">
        <RangeField
          label="Q² (dB) = 20·log₁₀(Q)"
          value={qDb}
          min={2}
          max={20}
          step={0.1}
          unit="dB"
          onChange={setQDb}
          testId="q-db"
        />

        <dl className="grid gap-3 sm:grid-cols-3">
          <Stat label="Q (linear)" value={q.toFixed(3)} />
          <Stat label="BER" value={<span data-testid="ber-value">{formatBer(ber)}</span>} />
          <Stat
            label="Errors per terabit"
            value={ber * 1e12 >= 1 ? (ber * 1e12).toExponential(1) : "< 1"}
            hint="1 Tb = 10¹² bits"
          />
        </dl>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Probability distributions of logic levels 0 and 1 and the decision threshold"
        >
          <path d={curves.zero} fill="none" className="stroke-accent" strokeWidth={2} />
          <path d={curves.one} fill="none" stroke="var(--warning)" strokeWidth={2} />
          <line
            x1={curves.threshold}
            x2={curves.threshold}
            y1={10}
            y2={H - 20}
            className="stroke-danger"
            strokeDasharray="4 4"
          />
          <text x={curves.threshold + 6} y={22} className="fill-danger text-[11px]">
            decision threshold
          </text>
          <text
            x={W * 0.27}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            level “0”
          </text>
          <text
            x={W * 0.73}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            level “1”
          </text>
        </svg>

        <ul className="space-y-1.5 text-sm" aria-label="Margin against FEC thresholds">
          {FEC_THRESHOLDS.map((fec) => {
            const qLimit = qToDb(berToQ(fec.ber));
            const margin = qDb - qLimit;
            return (
              <li
                key={fec.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5"
              >
                <span>
                  {fec.name}: pre-FEC BER ≤ {formatBer(fec.ber)} → Q² ≥ {qLimit.toFixed(2)} dB
                </span>
                <span className={margin >= 0 ? "font-mono text-success" : "font-mono text-danger"}>
                  margin {margin >= 0 ? "+" : ""}
                  {margin.toFixed(2)} dB
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </InteractiveFigure>
  );
}
