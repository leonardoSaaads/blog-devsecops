"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/format";
import { linearScale, polyline } from "./chart-utils";
import { LabFrame, labToggle } from "./lab-frame";

interface Band {
  id: string;
  name: string;
  min: number;
  max: number;
  detail: string;
}

const BANDS: Band[] = [
  {
    id: "O",
    name: "Original",
    min: 1260,
    max: 1360,
    detail:
      "Dispersão cromática ≈ 0 perto de 1310 nm (G.652). Enlaces curtos, data centers e upstream de PON.",
  },
  {
    id: "E",
    name: "Extended",
    min: 1360,
    max: 1460,
    detail:
      "Contém o pico de absorção OH⁻ em ~1383 nm nas fibras antigas; praticamente eliminado nas fibras G.652.D. Usada em CWDM.",
  },
  {
    id: "S",
    name: "Short",
    min: 1460,
    max: 1530,
    detail:
      "Sem EDFA convencional; amplificação por Raman ou fibra dopada com túlio (TDFA). Downstream de GPON em 1490 nm.",
  },
  {
    id: "C",
    name: "Conventional",
    min: 1530,
    max: 1565,
    detail: "Menor atenuação (~0,2 dB/km) e ganho eficiente do EDFA: o coração dos sistemas DWDM.",
  },
  {
    id: "L",
    name: "Long",
    min: 1565,
    max: 1625,
    detail: "EDFAs de banda L (fibra dopada mais longa) estendem a capacidade em sistemas C+L.",
  },
  {
    id: "U",
    name: "Ultra-long",
    min: 1625,
    max: 1675,
    detail: "Supervisão e monitoramento, como OTDR em serviço (ex.: 1650 nm).",
  },
];

/**
 * Modelo ilustrativo de atenuação da sílica (dB/km): espalhamento Rayleigh (A/λ⁴),
 * cauda de absorção infravermelha e pico OH⁻ gaussiano em 1383 nm.
 */
export function attenuationDbPerKm(nm: number, waterPeak: boolean): number {
  const um = nm / 1000;
  const rayleigh = 0.85 / um ** 4;
  const infrared = 7.81e11 * Math.exp(-48.48 / um);
  const peak = (waterPeak ? 0.6 : 0.02) * Math.exp(-(((nm - 1383) / 12) ** 2) / 2);
  return rayleigh + infrared + peak + 0.03;
}

const W = 640;
const H = 260;
const PAD = { left: 44, right: 12, top: 28, bottom: 34 };
const x = linearScale([1250, 1680], [PAD.left, W - PAD.right]);
const y = linearScale([0, 1], [H - PAD.bottom, PAD.top]);

export function FiberBandsChart() {
  const [selected, setSelected] = useState("C");
  const [legacy, setLegacy] = useState(false);
  const band = BANDS.find((item) => item.id === selected) ?? BANDS[3]!;

  const path = useMemo(() => {
    const points: Array<[number, number]> = [];
    for (let nm = 1250; nm <= 1680; nm += 2)
      points.push([x(nm), y(Math.min(1, attenuationDbPerKm(nm, legacy)))]);
    return polyline(points);
  }, [legacy]);

  return (
    <LabFrame
      title="Janelas espectrais da fibra monomodo"
      description="Curva ilustrativa de atenuação (Rayleigh + absorção infravermelha + pico OH⁻). Selecione uma banda para ver suas características."
      testId="fiber-bands"
      actions={
        <button
          type="button"
          className={labToggle(legacy)}
          aria-pressed={legacy}
          onClick={() => setLegacy((value) => !value)}
        >
          Fibra legada (pico de água)
        </button>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Atenuação da fibra de sílica entre 1250 e 1680 nm com as bandas O, E, S, C, L e U"
      >
        {BANDS.map((item) => (
          <g key={item.id}>
            <rect
              x={x(item.min)}
              y={PAD.top}
              width={x(item.max) - x(item.min)}
              height={H - PAD.top - PAD.bottom}
              className={cn(item.id === selected ? "fill-accent-soft" : "fill-transparent")}
            />
            <text
              x={(x(item.min) + x(item.max)) / 2}
              y={PAD.top - 10}
              textAnchor="middle"
              className={cn(
                "text-[12px] font-semibold",
                item.id === selected ? "fill-accent" : "fill-muted-foreground",
              )}
            >
              {item.id}
            </text>
            <line
              x1={x(item.min)}
              x2={x(item.min)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              className="stroke-border"
            />
          </g>
        ))}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
          <text
            key={tick}
            x={PAD.left - 6}
            y={y(tick) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            {tick.toFixed(1)}
          </text>
        ))}
        {[1300, 1400, 1500, 1600].map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={H - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
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
          comprimento de onda (nm) · eixo vertical: dB/km
        </text>
        <path d={path} fill="none" className="stroke-accent" strokeWidth={2.5} />
      </svg>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Selecionar banda">
        {BANDS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === selected}
            onClick={() => setSelected(item.id)}
            className={labToggle(item.id === selected, "font-mono")}
          >
            {item.id}
          </button>
        ))}
      </div>
      <div
        className="mt-3 rounded-xl bg-muted p-4 text-sm"
        aria-live="polite"
        data-testid="band-detail"
      >
        <p className="font-semibold">
          Banda {band.id} ({band.name}) · {band.min}–{band.max} nm
        </p>
        <p className="mt-1 text-muted-foreground">{band.detail}</p>
      </div>
    </LabFrame>
  );
}
