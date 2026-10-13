"use client";

import { Minus, Pause, Play, Plus, RotateCcw, Rocket, Send, X } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/format";
import {
  MAX_REPLICAS,
  clusterReducer,
  createCluster,
  summarize,
  type PodPhase,
} from "@/lib/simulations/k8s";
import { InteractiveFigure, controlButton, primaryButton } from "./interactive-figure";

const PHASE_STYLE: Record<PodPhase, string> = {
  Pending: "border-warning/60 bg-warning/10 text-warning",
  ContainerCreating: "border-accent/60 bg-accent-soft text-accent-strong",
  Running: "border-success/60 bg-success/10 text-success",
  Terminating: "border-danger/60 bg-danger/10 text-danger",
};

const TICK_MS = 800;

export function K8sSimulator() {
  const [state, dispatch] = useReducer(clusterReducer, undefined, () =>
    createCluster({ replicas: 3 }),
  );
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const summary = summarize(state);
  const nextVersion = state.version === "1.28" ? "1.29" : "1.28";

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => window.clearInterval(timer);
  }, [playing, inView]);

  return (
    <InteractiveFigure
      title="Simulador de Deployment + Service"
      description="Exclua pods, escale réplicas, envie requisições e faça um rolling update. O controlador reconcilia o estado a cada ciclo."
      testId="k8s-simulator"
      actions={
        <>
          <button
            type="button"
            className={controlButton}
            onClick={() => setPlaying((value) => !value)}
            aria-pressed={!playing}
          >
            {playing ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {playing ? "Pausar" : "Continuar"}
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={() => dispatch({ type: "reset" })}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reiniciar
          </button>
        </>
      }
    >
      <div ref={ref} className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex items-center rounded-lg border border-border"
            role="group"
            aria-label="Réplicas desejadas"
          >
            <button
              type="button"
              className="grid size-9 place-items-center hover:bg-muted disabled:opacity-40"
              onClick={() => dispatch({ type: "scale", replicas: state.desired - 1 })}
              disabled={state.desired === 0}
              aria-label="Diminuir réplicas"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-24 px-2 text-center font-mono text-sm" data-testid="replicas">
              replicas: {state.desired}
            </span>
            <button
              type="button"
              className="grid size-9 place-items-center hover:bg-muted disabled:opacity-40"
              onClick={() => dispatch({ type: "scale", replicas: state.desired + 1 })}
              disabled={state.desired === MAX_REPLICAS}
              aria-label="Aumentar réplicas"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            className={primaryButton}
            onClick={() => dispatch({ type: "request" })}
            data-testid="k8s-request"
          >
            <Send className="size-4" aria-hidden="true" /> curl http://nginx-service
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={() => dispatch({ type: "rollout", version: nextVersion })}
          >
            <Rocket className="size-4" aria-hidden="true" /> Rollout nginx:{nextVersion}
          </button>
        </div>

        <div
          role="status"
          className="rounded-xl border border-dashed border-border p-3 text-center font-mono text-xs text-muted-foreground"
        >
          Service <strong className="text-foreground">nginx-service</strong> (ClusterIP
          10.43.0.10:80) → endpoints prontos:{" "}
          <span data-testid="endpoint-count">{summary.ready}</span>
          {state.lastRequestFailed !== undefined && (
            <span className={cn("ml-2", state.lastRequestFailed ? "text-danger" : "text-success")}>
              {state.lastRequestFailed ? "503 — sem endpoints" : "200 OK"}
            </span>
          )}
        </div>

        {/* Altura reservada para as 3 réplicas iniciais: o surgimento dos pods não empurra o texto (CLS). */}
        <ul
          className="grid min-h-[20.75rem] content-start gap-3 sm:min-h-[13.5rem] sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Pods"
          data-testid="pods"
        >
          {state.pods.map((pod) => (
            <li
              key={pod.name}
              className={cn(
                "relative rounded-xl border bg-background p-3 transition",
                pod.name === state.lastServedBy
                  ? "border-accent ring-4 ring-[var(--ring)]"
                  : "border-border",
                pod.phase === "Terminating" && "opacity-60",
              )}
              data-phase={pod.phase}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-mono text-xs" title={pod.name}>
                  {pod.name}
                </p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "delete", name: pod.name })}
                  disabled={pod.phase === "Terminating"}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-30"
                  aria-label={`Excluir pod ${pod.name}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-medium",
                    PHASE_STYLE[pod.phase],
                  )}
                >
                  {pod.phase}
                </span>
                <span className="font-mono text-muted-foreground">{pod.ip}</span>
                <span className="font-mono text-muted-foreground">nginx:{pod.version}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                requisições atendidas: {pod.served}
              </p>
            </li>
          ))}
          {state.pods.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Nenhum pod — aguardando reconciliação…
            </li>
          )}
        </ul>

        <div className="grid gap-3 lg:grid-cols-[auto_1fr]">
          <pre
            className="overflow-x-auto rounded-xl bg-code p-3 font-mono text-xs leading-6"
            aria-label="kubectl get deployment"
          >
            {`$ kubectl get deploy nginx-deployment
NAME               READY   UP-TO-DATE
nginx-deployment   ${summary.ready}/${summary.desired}     ${summary.upToDate}`}
          </pre>
          {/* Espaço fixo para os 8 eventos mais recentes (a lista cresce durante a simulação). */}
          <div className="min-h-[15rem] min-w-0 rounded-xl bg-code p-3 font-mono text-xs leading-6">
            <p className="text-muted-foreground">$ kubectl get events --sort-by=.lastTimestamp</p>
            <ol aria-label="Eventos do cluster" data-testid="k8s-events">
              {state.events.map((event, index) => (
                <li key={`${state.tick}-${index}`} className="truncate" title={event}>
                  {event}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </InteractiveFigure>
  );
}
