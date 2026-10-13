"use client";

import { Eraser, LoaderCircle, Play, RotateCcw, Square, SquareTerminal } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/format";
import {
  PYODIDE_LOAD_TIMEOUT_MS,
  RUNNER_URL,
  RUN_TIMEOUT_MS,
  appendOutput,
  applyIndent,
  isRunnerMessage,
  type OutputLine,
  type PlaygroundLanguage,
} from "@/lib/simulations/playground";
import { controlButton, primaryButton } from "./interactive-figure";

const LANGUAGE_LABEL: Record<PlaygroundLanguage, string> = {
  javascript: "JavaScript",
  python: "Python 3 (Pyodide)",
};

type Status = "idle" | "loading" | "running";

export function CodePlayground({
  language,
  initialCode,
  title,
}: {
  language: PlaygroundLanguage;
  initialCode: string;
  title?: string;
}) {
  const [code, setCode] = useState(initialCode.replace(/\n$/, ""));
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState<number>();
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const runIdRef = useRef(0);
  const pythonLoadedRef = useRef(false);
  const editorId = useId();
  const captionId = useId();
  const lineCount = code.split("\n").length;

  const disposeWorker = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    pythonLoadedRef.current = false;
  }, []);

  useEffect(() => disposeWorker, [disposeWorker]);

  const push = useCallback((line: OutputLine) => {
    setOutput((lines) => {
      const result = appendOutput(lines, line);
      if (result.truncated) {
        // Saída descontrolada (ex.: print em loop infinito): encerra a execução.
        workerRef.current?.terminate();
        workerRef.current = null;
        pythonLoadedRef.current = false;
        setStatus("idle");
      }
      return result.lines;
    });
  }, []);

  const stop = useCallback(
    (reason?: string) => {
      disposeWorker();
      setStatus("idle");
      if (reason) push({ stream: "system", text: reason });
    },
    [disposeWorker, push],
  );

  const run = () => {
    const runId = ++runIdRef.current;
    setOutput([]);
    setElapsed(undefined);

    // JavaScript: worker novo a cada execução. Python: reaproveita o runtime já carregado.
    if (language === "javascript" || !workerRef.current) {
      disposeWorker();
      const { url, module } = RUNNER_URL[language];
      workerRef.current = new Worker(url, module ? { type: "module" } : undefined);
    }
    const worker = workerRef.current!;
    const firstPythonRun = language === "python" && !pythonLoadedRef.current;

    const armTimeout = (ms: number) => {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => stop(`⏱ Execução interrompida após ${ms / 1000} s (possível loop infinito).`),
        ms,
      );
    };

    worker.onmessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (!isRunnerMessage(message) || message.id !== runId) return;
      if (message.type === "status") {
        setStatus("loading");
        armTimeout(PYODIDE_LOAD_TIMEOUT_MS);
        push({ stream: "system", text: message.text });
        return;
      }
      if (message.type === "started") {
        if (language === "python") pythonLoadedRef.current = true;
        setStatus("running");
        armTimeout(RUN_TIMEOUT_MS[language]);
        return;
      }
      if (message.type === "done") {
        window.clearTimeout(timeoutRef.current);
        setElapsed(message.ms);
        setStatus("idle");
        if (language === "javascript") disposeWorker();
        return;
      }
      push({ stream: message.type, text: message.text });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      stop(`Erro no executor: ${event.message || "falha ao iniciar o worker"}`);
    };

    setStatus("running");
    armTimeout(firstPythonRun ? PYODIDE_LOAD_TIMEOUT_MS : RUN_TIMEOUT_MS[language]);
    worker.postMessage({ id: runId, code });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (status === "idle") run();
      return;
    }
    // Tab indenta; Esc seguido de Tab permite sair do editor (evita "armadilha de teclado").
    if (event.key === "Tab" && !event.currentTarget.dataset.escape) {
      event.preventDefault();
      const target = event.currentTarget;
      const next = applyIndent(target.value, target.selectionStart, target.selectionEnd, {
        outdent: event.shiftKey,
      });
      setCode(next.value);
      requestAnimationFrame(() => target.setSelectionRange(next.selectionStart, next.selectionEnd));
    }
    if (event.key === "Escape") event.currentTarget.dataset.escape = "1";
    else if (event.key !== "Tab") delete event.currentTarget.dataset.escape;
  };

  const busy = status !== "idle";

  return (
    <figure
      className="not-prose listing-numbered figure-wide my-12"
      aria-labelledby={captionId}
      data-testid={`playground-${language}`}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_40px_-24px_rgb(15_23_42/0.35)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-[linear-gradient(90deg,var(--accent-soft),transparent_70%)] px-4 py-2.5">
          <SquareTerminal className="size-4 text-accent" aria-hidden="true" />
          <p className="smallcaps text-xs font-semibold text-accent-strong">Código executável</p>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {LANGUAGE_LABEL[language]}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {busy ? (
              <button
                type="button"
                className={controlButton}
                onClick={() => stop("■ Execução interrompida pelo usuário.")}
              >
                <Square className="size-4" aria-hidden="true" /> Parar
              </button>
            ) : (
              <button
                type="button"
                className={primaryButton}
                onClick={run}
                data-testid="playground-run"
              >
                <Play className="size-4" aria-hidden="true" /> Executar
              </button>
            )}
            <button
              type="button"
              className={controlButton}
              onClick={() => setCode(initialCode.replace(/\n$/, ""))}
              disabled={busy}
              aria-label="Restaurar código original"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={controlButton}
              onClick={() => setOutput([])}
              aria-label="Limpar saída"
            >
              <Eraser className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <label htmlFor={editorId} className="sr-only">
          Editor de código {LANGUAGE_LABEL[language]} (Ctrl+Enter executa; Esc e depois Tab sai do
          editor)
        </label>
        <div className="flex max-h-[28rem] overflow-auto bg-code font-mono text-[13px] leading-6">
          <div
            aria-hidden="true"
            className="select-none border-r border-border px-3 py-3 text-right text-muted-foreground/60"
          >
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <textarea
            id={editorId}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            rows={lineCount}
            wrap="off"
            className="min-h-24 flex-1 resize-none bg-transparent px-3 py-3 outline-none"
            data-testid="playground-editor"
          />
        </div>

        <div className="border-t border-border bg-background">
          <div className="flex items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
            <span>Saída</span>
            <span aria-live="polite">
              {status === "loading" && (
                <span className="inline-flex items-center gap-1">
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> carregando
                  runtime…
                </span>
              )}
              {status === "running" && (
                <span className="inline-flex items-center gap-1">
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> executando…
                </span>
              )}
              {status === "idle" &&
                elapsed !== undefined &&
                `concluído em ${elapsed.toFixed(1)} ms`}
            </span>
          </div>
          <pre
            className="max-h-72 min-h-16 overflow-auto px-4 pb-3 font-mono text-[13px] leading-6"
            aria-live="polite"
            aria-label="Saída do programa"
            data-testid="playground-output"
          >
            {output.length === 0 ? (
              <span className="text-muted-foreground">Clique em Executar (ou Ctrl+Enter).</span>
            ) : (
              output.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    line.stream === "stderr" && "text-danger",
                    line.stream === "system" && "italic text-muted-foreground",
                  )}
                >
                  {line.text || " "}
                </div>
              ))
            )}
          </pre>
        </div>
      </div>
      <figcaption
        id={captionId}
        className="mt-3 px-1 font-serif text-[0.95rem] leading-relaxed text-muted-foreground"
      >
        <span className="listing-label" />
        <span className="font-semibold text-foreground">{title ?? "Execute o código"}.</span> Edite
        e execute no próprio navegador, em um Web Worker isolado (Ctrl+Enter).
      </figcaption>
    </figure>
  );
}
