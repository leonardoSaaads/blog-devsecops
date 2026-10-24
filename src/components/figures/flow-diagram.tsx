"use client";

import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { InteractiveFigure, controlButton } from "./interactive-figure";

export interface FlowStep {
  title: string;
  detail?: string;
  /** Destaque visual (ex.: ponto exposto, componente crítico). */
  tone?: "default" | "danger" | "success";
}

const STEP_MS = 1100;

/**
 * Diagrama de fluxo com animação passo a passo ("pacote" percorrendo a cadeia).
 * Clique em uma etapa para ver detalhes.
 */
export function FlowDiagram({
  title,
  steps,
  caption,
}: {
  title: string;
  steps: FlowStep[];
  caption?: string;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = steps[active];
  const last = steps.length - 1;
  const running = playing && active < last;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () => setActive((index) => Math.min(index + 1, last)),
      STEP_MS,
    );
    return () => window.clearInterval(timer);
  }, [running, last]);

  const play = () => {
    if (running) {
      setPlaying(false);
      return;
    }
    if (active >= last) setActive(0);
    setPlaying(true);
  };

  return (
    <InteractiveFigure
      title={title}
      description={
        caption ?? "Reproduza o fluxo ou clique em uma etapa para ver o que acontece nela."
      }
      testId="flow-diagram"
      actions={
        <button type="button" onClick={play} className={controlButton} aria-pressed={running}>
          {running ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {running ? "Pausar" : "Reproduzir fluxo"}
        </button>
      }
    >
      <ol className="flex flex-col items-stretch gap-1 lg:flex-row lg:items-center">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col items-center lg:flex-1 lg:flex-row">
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setActive(index);
              }}
              aria-current={index === active ? "step" : undefined}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition lg:text-center",
                index === active
                  ? "border-accent bg-accent-soft shadow-md shadow-slate-900/10"
                  : index < active
                    ? "border-accent/40 text-foreground"
                    : "border-border text-muted-foreground hover:border-accent",
                step.tone === "danger" && "border-danger/60",
                step.tone === "success" && index === active && "border-success",
              )}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground lg:mr-0 lg:block">
                {index + 1}
              </span>
              {step.title}
            </button>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "p-1 transition",
                  index < active ? "text-accent" : "text-muted-foreground/50",
                )}
              >
                <ArrowDown className="size-4 lg:hidden" />
                <ArrowRight className="hidden size-4 lg:block" />
              </span>
            )}
          </li>
        ))}
      </ol>

      {current?.detail && (
        <p
          className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <strong className="text-foreground">{current.title}:</strong> {current.detail}
        </p>
      )}
    </InteractiveFigure>
  );
}
