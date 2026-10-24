"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DOCKERFILE,
  SIGNALS,
  deliverSignal,
  processTree,
  type Pid1,
  type SignalName,
} from "@/lib/simulations/signals";
import { InteractiveFigure, Stat, controlToggle } from "./interactive-figure";

const PID1_LABEL: Record<Pid1, string> = {
  shell: "Forma shell",
  app: "Forma exec",
  tini: "Com init (tini)",
};

const STATE_LABEL = {
  graceful: { text: "Encerrado com elegância", tone: "success" },
  reloaded: { text: "Configuração recarregada", tone: "success" },
  terminated: { text: "Encerrado sem limpeza", tone: "warning" },
  running: { text: "Ainda em execução", tone: "warning" },
  killed: { text: "Morto pelo kernel", tone: "danger" },
} as const;

const TONE_CLASS = {
  info: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

export function SignalSimulator() {
  const [pid1, setPid1] = useState<Pid1>("shell");
  const [handler, setHandler] = useState(true);
  const [signal, setSignal] = useState<SignalName>("SIGTERM");
  const outcome = deliverSignal({ pid1, handler }, signal);
  const state = STATE_LABEL[outcome.state];

  return (
    <InteractiveFigure
      title="Sinais e o PID 1 em contêineres"
      description="Escolha como o processo é iniciado, se a aplicação trata sinais e qual sinal enviar. A linha do tempo mostra quem recebe o sinal e como o contêiner termina."
      testId="signal-simulator"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Inicialização no Dockerfile</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PID1_LABEL) as Pid1[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={pid1 === value}
                  onClick={() => setPid1(value)}
                  className={controlToggle(pid1 === value)}
                >
                  {PID1_LABEL[value]}
                </button>
              ))}
            </div>
            <pre
              className="mt-3 overflow-x-auto rounded-lg bg-code p-3 font-mono text-xs leading-relaxed"
              data-testid="dockerfile"
            >
              {DOCKERFILE[pid1]}
            </pre>
          </fieldset>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={handler}
                onChange={(event) => setHandler(event.target.checked)}
                className="size-4 accent-[var(--accent)]"
                data-testid="signal-handler"
              />
              A aplicação trata sinais
            </label>
            <p className="mt-1 pl-6 font-mono text-xs text-muted-foreground">
              signal.signal(SIGTERM, encerrar)
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Árvore de processos no contêiner</p>
            <ul className="space-y-1 font-mono text-xs">
              {processTree(pid1).map((process, index) => (
                <li
                  key={process.pid}
                  className="flex gap-2 rounded-md bg-muted px-2 py-1"
                  style={{ marginLeft: index * 16 }}
                >
                  <span className="text-accent-strong">PID {process.pid}</span>
                  <span className="truncate">{process.command}</span>
                </li>
              ))}
            </ul>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Sinal</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SIGNALS) as SignalName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={signal === name}
                  onClick={() => setSignal(name)}
                  className={controlToggle(signal === name, "font-mono text-xs")}
                >
                  {name} ({SIGNALS[name].number})
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{SIGNALS[signal].description}</p>
          </fieldset>
        </div>

        <div className="space-y-4">
          <dl className="grid grid-cols-3 gap-3">
            <Stat
              label="Resultado"
              value={<span data-testid="signal-state">{state.text}</span>}
              tone={state.tone}
            />
            <Stat label="Código de saída" value={outcome.exitCode ?? "—"} />
            <Stat
              label="Tempo até parar"
              value={
                outcome.state === "running"
                  ? "—"
                  : `${outcome.elapsed.toFixed(1).replace(".", ",")} s`
              }
            />
          </dl>
          <ol
            className="relative space-y-3 border-l border-border pl-5"
            aria-label="Linha do tempo"
            aria-live="polite"
            data-testid="signal-timeline"
          >
            {outcome.events.map((event, index) => (
              <li key={`${signal}-${index}`} className="relative text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full ring-4 ring-card",
                    event.tone === "danger"
                      ? "bg-danger"
                      : event.tone === "warning"
                        ? "bg-warning"
                        : event.tone === "success"
                          ? "bg-success"
                          : "bg-accent",
                  )}
                />
                <span className="mr-2 font-mono text-xs text-muted-foreground">
                  t={event.t.toFixed(1).replace(".", ",")}s
                </span>
                <span
                  className={cn(index === 0 ? "font-mono text-foreground" : TONE_CLASS[event.tone])}
                >
                  {event.text}
                </span>
              </li>
            ))}
          </ol>
          {!outcome.clean && outcome.state !== "running" && (
            <p className="rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm">
              Requisições em andamento foram perdidas. Em um Deployment do Kubernetes, isso aparece
              como erros 502 durante cada atualização.
            </p>
          )}
        </div>
      </div>
    </InteractiveFigure>
  );
}
