"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InteractiveFigure } from "./interactive-figure";

const LAYERS = [
  {
    id: "OTU",
    name: "OTU — Optical channel Transport Unit",
    fields: [
      "FAS/MFAS: frame and multiframe alignment",
      "SM: Section Monitoring (BIP-8, BEI, BDI, TTI)",
      "GCC0: section communication channel",
      "FEC: parity (e.g., RS(255,239) in the original G.709)",
    ],
  },
  {
    id: "ODU",
    name: "ODU — Optical channel Data Unit",
    fields: [
      "PM: end-to-end Path Monitoring",
      "TCM1–TCM6: tandem connection monitoring (cascaded/nested)",
      "GCC1/GCC2: communication channels",
      "APS/PCC: automatic protection switching",
    ],
  },
  {
    id: "OPU",
    name: "OPU — Optical channel Payload Unit",
    fields: [
      "PSI/PT: payload type identification",
      "Justification (JC/NJO/PJO) for rate adaptation",
      "Mappings: BMP, AMP, GMP",
    ],
  },
  {
    id: "Client",
    name: "Client signal",
    fields: ["Ethernet (1GE–400GE), SDH/SONET, Fibre Channel, lower-order ODUs"],
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
      title="OTN encapsulation (ITU-T G.709)"
      description="Each layer adds overhead to the content of the layer inside it. Click a layer to see its fields."
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
