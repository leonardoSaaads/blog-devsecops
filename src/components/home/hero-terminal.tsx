"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const SCRIPT: Array<{ prompt?: boolean; text: string; tone?: "ok" | "muted" | "accent" }> = [
  { prompt: true, text: "kubectl get pods -l app=nginx" },
  { text: "nginx-deployment-7c9d8-x2k4p   1/1   Running", tone: "ok" },
  { text: "nginx-deployment-7c9d8-q8m1z   1/1   Running", tone: "ok" },
  { prompt: true, text: "stat -c '%A %a' deploy.sh" },
  { text: "-rwxr-x--- 750", tone: "accent" },
  { prompt: true, text: "osnr --launch 1 --span-loss 17 --nf 5 --spans 10" },
  { text: "OSNR = 27.0 dB  ✔ DP-16QAM (margem +7.0 dB)", tone: "ok" },
  { prompt: true, text: "echo 'leia, execute, quebre e conserte.'" },
];

const TYPE_MS = 28;
/** Posição inicial (em caracteres) de cada linha na animação de digitação. */
const OFFSETS = SCRIPT.map((_, index) =>
  SCRIPT.slice(0, index).reduce((sum, line) => sum + line.text.length, 0),
);
const TOTAL = SCRIPT.reduce((sum, line) => sum + line.text.length, 0);

export function HeroTerminal() {
  const total = TOTAL;
  const [typed, setTyped] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const done = reducedMotion || typed >= total;

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(
      () => setTyped((value) => Math.min(value + 1, total)),
      TYPE_MS,
    );
    return () => window.clearInterval(timer);
  }, [done, total]);

  const shown = reducedMotion ? total : typed;
  return (
    <div
      className="relative rounded-2xl border border-border bg-code shadow-2xl shadow-cyan-500/10"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-3 rounded-full bg-red-400/80" />
        <span className="size-3 rounded-full bg-amber-400/80" />
        <span className="size-3 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">leo@homelab: ~</span>
      </div>
      <div className="min-h-[17rem] space-y-1 p-4 font-mono text-[13px] leading-6">
        {SCRIPT.map((line, index) => {
          const start = OFFSETS[index] ?? 0;
          if (shown <= start) return null;
          const visible = line.text.slice(0, shown - start);
          const typing = shown < start + line.text.length;
          return (
            <p key={index} className="whitespace-pre-wrap break-all">
              {line.prompt && <span className="text-accent">$ </span>}
              <span
                className={
                  line.tone === "ok"
                    ? "text-success"
                    : line.tone === "accent"
                      ? "text-accent-strong"
                      : line.tone === "muted"
                        ? "text-muted-foreground"
                        : undefined
                }
              >
                {visible}
              </span>
              {typing && (
                <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}
