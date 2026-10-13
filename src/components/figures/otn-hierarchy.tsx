"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import { InteractiveFigure } from "./interactive-figure";

const LAYERS = [
  {
    id: "OTU",
    name: "OTU — Optical channel Transport Unit",
    fields: [
      "FAS/MFAS: alinhamento de quadro e multiquadro",
      "SM: Section Monitoring (BIP-8, BEI, BDI, TTI)",
      "GCC0: canal de comunicação de seção",
      "FEC: paridade (ex.: RS(255,239) na G.709 original)",
    ],
  },
  {
    id: "ODU",
    name: "ODU — Optical channel Data Unit",
    fields: [
      "PM: Path Monitoring fim a fim",
      "TCM1–TCM6: monitoramento de conexões em cascata/aninhadas",
      "GCC1/GCC2: canais de comunicação",
      "APS/PCC: proteção automática",
    ],
  },
  {
    id: "OPU",
    name: "OPU — Optical channel Payload Unit",
    fields: [
      "PSI/PT: identificação do tipo de payload",
      "Justificação (JC/NJO/PJO) para adaptação de taxa",
      "Mapeamentos: BMP, AMP, GMP",
    ],
  },
  {
    id: "Cliente",
    name: "Sinal cliente",
    fields: ["Ethernet (1GE–400GE), SDH/SONET, Fibre Channel, ODUs de ordem inferior"],
  },
] as const;

export function OtnHierarchy() {
  const [selected, setSelected] = useState<string>("ODU");
  const layer = LAYERS.find((item) => item.id === selected) ?? LAYERS[1];

  const render = (index: number): React.ReactNode => {
    const item = LAYERS[index];
    if (!item) return null;
    const isSelected = item.id === selected;
    return (
      <div
        className={cn(
          "rounded-xl border-2 p-2.5 transition sm:p-3",
          isSelected ? "border-accent bg-accent-soft" : "border-border bg-background",
        )}
      >
        <button
          type="button"
          onClick={() => setSelected(item.id)}
          aria-pressed={isSelected}
          className="mb-2 rounded-md px-1.5 py-0.5 font-mono text-sm font-semibold hover:text-accent"
        >
          {item.id} {index === 0 ? "(overhead + FEC)" : index < 3 ? "(overhead)" : ""}
        </button>
        {render(index + 1)}
      </div>
    );
  };

  return (
    <InteractiveFigure
      title="Encapsulamento OTN (ITU-T G.709)"
      description="Cada camada adiciona overhead ao conteúdo da camada interna. Clique em uma camada para ver seus campos."
      testId="otn-hierarchy"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>{render(0)}</div>
        <div className="rounded-xl bg-muted p-4 text-sm" aria-live="polite">
          <p className="font-semibold">{layer.name}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {layer.fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      </div>
    </InteractiveFigure>
  );
}
