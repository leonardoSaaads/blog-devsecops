export type PlaygroundLanguage = "javascript" | "python";

export type RunnerMessage =
  | { type: "stdout" | "stderr" | "status"; id: number; text: string }
  | { type: "started"; id: number }
  | { type: "done"; id: number; ms: number; ok: boolean };

export interface OutputLine {
  stream: "stdout" | "stderr" | "system";
  text: string;
}

export const RUNNER_URL: Record<PlaygroundLanguage, { url: string; module: boolean }> = {
  javascript: { url: "/workers/js-runner.js", module: false },
  python: { url: "/workers/py-runner.mjs", module: true },
};

/** Tempo máximo de execução (o carregamento inicial do Pyodide tem prazo próprio). */
export const RUN_TIMEOUT_MS: Record<PlaygroundLanguage, number> = {
  javascript: 5000,
  python: 20000,
};
export const PYODIDE_LOAD_TIMEOUT_MS = 90000;
export const MAX_OUTPUT_LINES = 500;

export function isRunnerMessage(value: unknown): value is RunnerMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  if (typeof message.id !== "number") return false;
  if (message.type === "started") return true;
  if (message.type === "done")
    return typeof message.ms === "number" && typeof message.ok === "boolean";
  return (
    ["stdout", "stderr", "status"].includes(message.type as string) &&
    typeof message.text === "string"
  );
}

/** Acrescenta linhas respeitando o limite; retorna `truncated` quando o excedeu. */
export function appendOutput(lines: OutputLine[], line: OutputLine, max = MAX_OUTPUT_LINES) {
  const pieces = line.text
    .replace(/\n$/, "")
    .split("\n")
    .map((text) => ({ stream: line.stream, text }));
  const next = [...lines, ...pieces];
  if (next.length <= max) return { lines: next, truncated: false };
  return {
    lines: [
      ...next.slice(0, max),
      { stream: "system" as const, text: `… saída truncada em ${max} linhas.` },
    ],
    truncated: true,
  };
}

/** Insere indentação (Tab) ou remove-a (Shift+Tab) na linha do cursor. */
export function applyIndent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  { indent = "    ", outdent = false } = {},
): { value: string; selectionStart: number; selectionEnd: number } {
  if (!outdent) {
    return {
      value: value.slice(0, selectionStart) + indent + value.slice(selectionEnd),
      selectionStart: selectionStart + indent.length,
      selectionEnd: selectionStart + indent.length,
    };
  }
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const leading = /^ {1,4}/.exec(value.slice(lineStart))?.[0].length ?? 0;
  if (leading === 0) return { value, selectionStart, selectionEnd };
  return {
    value: value.slice(0, lineStart) + value.slice(lineStart + leading),
    selectionStart: Math.max(lineStart, selectionStart - leading),
    selectionEnd: Math.max(lineStart, selectionEnd - leading),
  };
}
