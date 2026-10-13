/**
 * Executor de Python do playground (Web Worker de módulo + Pyodide/WebAssembly).
 *
 * O runtime é baixado sob demanda (~10 MB, cacheado pelo navegador) de uma única
 * origem com versão fixada. A CSP deste worker limita script/conexões a essa origem.
 */
const PYODIDE_VERSION = "314.0.7";
const INDEX_URL = `https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/`;

let pyodidePromise;

/** Remove do traceback os frames internos do Pyodide, mantendo só o código do leitor. */
function cleanTraceback(message) {
  const start = message.indexOf('  File "<exec>"');
  return start === -1 ? message : `Traceback (most recent call last):\n${message.slice(start)}`;
}

function loadRuntime(id) {
  if (!pyodidePromise) {
    self.postMessage({ type: "status", id, text: `Carregando Python (Pyodide ${PYODIDE_VERSION})…` });
    pyodidePromise = import(`${INDEX_URL}pyodide.mjs`).then(({ loadPyodide }) => loadPyodide({ indexURL: INDEX_URL }));
  }
  return pyodidePromise;
}

self.onmessage = async (event) => {
  const { id, code } = event.data || {};
  if (typeof id !== "number" || typeof code !== "string") return;
  const send = (type, text) => self.postMessage({ type, id, text });

  let pyodide;
  try {
    pyodide = await loadRuntime(id);
  } catch (error) {
    pyodidePromise = undefined;
    send("stderr", `Falha ao carregar o Pyodide: ${error?.message ?? error}`);
    self.postMessage({ type: "done", id, ms: 0, ok: false });
    return;
  }

  pyodide.setStdout({ batched: (text) => send("stdout", text) });
  pyodide.setStderr({ batched: (text) => send("stderr", text) });

  self.postMessage({ type: "started", id });
  const started = performance.now();
  try {
    // Namespace novo a cada execução: variáveis não vazam entre execuções.
    const globals = pyodide.toPy({});
    await pyodide.runPythonAsync(code, { globals });
    globals.destroy();
    self.postMessage({ type: "done", id, ms: performance.now() - started, ok: true });
  } catch (error) {
    send("stderr", cleanTraceback(String(error?.message ?? error)));
    self.postMessage({ type: "done", id, ms: performance.now() - started, ok: false });
  }
};
