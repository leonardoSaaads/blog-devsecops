"use client";

import { Shuffle } from "lucide-react";
import { useId, useRef, useState } from "react";
import { CoverArt, artCaption } from "@/components/art/cover-art";
import { useInView } from "@/hooks/use-in-view";
import { MOTIFS, type Motif } from "@/lib/art/types";
import { InteractiveFigure, controlButton, controlToggle } from "./interactive-figure";

const MOTIF_LABEL: Record<Motif, string> = {
  spectrum: "Espectro DWDM",
  lattice: "Malha de nós",
  bits: "Matriz de bits",
  network: "Rede e túneis",
  ridgeline: "Séries temporais",
  radar: "Varredura",
  flamegraph: "Flame graph",
  circuit: "Circuito",
  eye: "Diagrama de olho",
};

const SEEDS = ["fibra", "kernel", "pacote", "quantum", "observar", "latencia", "entropia", "tunel"];

export function ArtExplorer() {
  const [motif, setMotif] = useState<Motif>("circuit");
  const [seed, setSeed] = useState("bastidores-do-blog");
  const [animated, setAnimated] = useState(false);
  const inputId = useId();
  const previewRef = useRef<HTMLDivElement>(null);
  // Anima só enquanto a prévia está visível (economia de CPU fora da tela).
  const inView = useInView(previewRef, "0px");
  const safeSeed = seed.trim().slice(0, 40) || "semente";

  return (
    <InteractiveFigure
      title="Arte generativa determinística"
      description="Cada capa do blog é um SVG gerado no build a partir do slug do artigo: a mesma semente produz sempre a mesma imagem, sem arquivos de imagem nem chamadas externas."
      testId="art-explorer"
      actions={
        <button
          type="button"
          className={controlButton}
          onClick={() => setSeed(SEEDS[(SEEDS.indexOf(seed) + 1) % SEEDS.length]!)}
        >
          <Shuffle className="size-4" aria-hidden="true" /> Outra semente
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Motivo">
          {MOTIFS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={motif === item}
              onClick={() => setMotif(item)}
              className={controlToggle(motif === item, "text-xs")}
            >
              {MOTIF_LABEL[item]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={inputId} className="text-sm font-medium">
            Semente
          </label>
          <input
            id={inputId}
            value={seed}
            maxLength={40}
            onChange={(event) => setSeed(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
            data-testid="art-seed"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={animated}
              onChange={(event) => setAnimated(event.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Animação
          </label>
        </div>
        <div
          ref={previewRef}
          className="overflow-hidden rounded-xl bg-plate"
          data-testid="art-preview"
        >
          <CoverArt
            motif={motif}
            seed={safeSeed}
            animated={animated && inView}
            className="aspect-[1200/630] h-auto"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-xs">
            generateArt(&quot;{motif}&quot;, &quot;{safeSeed}&quot;)
          </code>{" "}
          — {artCaption(motif, safeSeed)}
        </p>
      </div>
    </InteractiveFigure>
  );
}
