/**
 * Executor de JavaScript do playground (Web Worker clássico).
 *
 * Isolamento:
 *  - roda em thread separada (o pai encerra o worker em caso de timeout/loop infinito);
 *  - CSP própria entregue com este arquivo: `default-src 'none'; script-src 'unsafe-eval'`
 *    — o código pode ser avaliado, mas não acessa rede (fetch/WebSocket/importScripts);
 *  - sem acesso ao DOM, cookies ou armazenamento da página.
 */
"use strict";

const MAX_DEPTH = 4;

function format(value, depth = 0, seen = new WeakSet()) {
  if (typeof value === "string") return depth === 0 ? value : JSON.stringify(value);
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (typeof value === "symbol") return value.toString();
  if (value === null || typeof value !== "object") return String(value);
  if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
  if (seen.has(value)) return "[Circular]";
  if (depth >= MAX_DEPTH) return Array.isArray(value) ? "[Array]" : "[Object]";
  seen.add(value);
  if (Array.isArray(value)) return `[ ${value.map((v) => format(v, depth + 1, seen)).join(", ")} ]`;
  if (value instanceof Map) {
    return `Map(${value.size}) { ${[...value].map(([k, v]) => `${format(k, depth + 1, seen)} => ${format(v, depth + 1, seen)}`).join(", ")} }`;
  }
  if (value instanceof Set) return `Set(${value.size}) { ${[...value].map((v) => format(v, depth + 1, seen)).join(", ")} }`;
  const entries = Object.entries(value).map(([k, v]) => `${k}: ${format(v, depth + 1, seen)}`);
  return `{ ${entries.join(", ")} }`;
}

self.onmessage = async (event) => {
  const { id, code } = event.data || {};
  if (typeof id !== "number" || typeof code !== "string") return;

  const send = (type, text) => self.postMessage({ type, id, text });
  const write = (type) => (...args) => send(type, args.map((arg) => format(arg)).join(" "));
  const timers = new Map();
  const sandboxConsole = {
    log: write("stdout"),
    info: write("stdout"),
    debug: write("stdout"),
    table: write("stdout"),
    warn: write("stderr"),
    error: write("stderr"),
    time: (label = "default") => timers.set(label, performance.now()),
    timeEnd: (label = "default") => {
      const start = timers.get(label);
      if (start !== undefined) send("stdout", `${label}: ${(performance.now() - start).toFixed(3)} ms`);
    },
  };

  self.postMessage({ type: "started", id });
  const started = performance.now();
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const run = new AsyncFunction("console", `"use strict";\n${code}`);
    await run(sandboxConsole);
    self.postMessage({ type: "done", id, ms: performance.now() - started, ok: true });
  } catch (error) {
    send("stderr", format(error));
    self.postMessage({ type: "done", id, ms: performance.now() - started, ok: false });
  }
};
