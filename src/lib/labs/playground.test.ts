import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {
  MAX_OUTPUT_LINES,
  appendOutput,
  applyIndent,
  isRunnerMessage,
  type RunnerMessage,
} from "./playground";

describe("protocolo do playground", () => {
  it("valida mensagens dos workers", () => {
    expect(isRunnerMessage({ type: "stdout", id: 1, text: "oi" })).toBe(true);
    expect(isRunnerMessage({ type: "started", id: 1 })).toBe(true);
    expect(isRunnerMessage({ type: "done", id: 1, ms: 3, ok: true })).toBe(true);
    expect(isRunnerMessage({ type: "done", id: 1 })).toBe(false);
    expect(isRunnerMessage({ type: "eval", id: 1, text: "x" })).toBe(false);
    expect(isRunnerMessage("texto")).toBe(false);
  });

  it("quebra linhas e trunca saídas descontroladas", () => {
    expect(appendOutput([], { stream: "stdout", text: "a\nb\n" }).lines).toHaveLength(2);
    const huge = appendOutput([], { stream: "stdout", text: "x\n".repeat(MAX_OUTPUT_LINES + 10) });
    expect(huge.truncated).toBe(true);
    expect(huge.lines).toHaveLength(MAX_OUTPUT_LINES + 1);
    expect(huge.lines.at(-1)?.stream).toBe("system");
  });

  it("indenta e desindenta com Tab/Shift+Tab", () => {
    expect(applyIndent("abc", 0, 0)).toEqual({
      value: "    abc",
      selectionStart: 4,
      selectionEnd: 4,
    });
    expect(applyIndent("    abc", 6, 6, { outdent: true })).toEqual({
      value: "abc",
      selectionStart: 2,
      selectionEnd: 2,
    });
    expect(applyIndent("abc", 1, 1, { outdent: true }).value).toBe("abc");
  });
});

/** Executa o worker real (public/workers/js-runner.js) em um contexto isolado do Node. */
async function runJs(code: string): Promise<RunnerMessage[]> {
  const messages: RunnerMessage[] = [];
  const self: {
    onmessage?: (event: { data: unknown }) => Promise<void>;
    postMessage: (m: RunnerMessage) => void;
  } = {
    postMessage: (message) => messages.push(message),
  };
  const source = fs.readFileSync(path.join(process.cwd(), "public/workers/js-runner.js"), "utf8");
  vm.runInNewContext(source, { self, performance, WeakSet, Map, Set, Object, Array, JSON, String });
  await self.onmessage!({ data: { id: 7, code } });
  return messages;
}

describe("executor de JavaScript (worker)", () => {
  it("captura console.log com formatação de objetos", async () => {
    const messages = await runJs(
      'console.log("oi", { a: 1, b: [1, 2] }, new Map([["k", 1]]), 10n)',
    );
    const output = messages.find((message) => message.type === "stdout");
    expect(output).toMatchObject({
      id: 7,
      text: 'oi { a: 1, b: [ 1, 2 ] } Map(1) { "k" => 1 } 10n',
    });
    expect(messages.at(-1)).toMatchObject({ type: "done", ok: true });
    expect(messages[0]).toEqual({ type: "started", id: 7 });
  });

  it("suporta await no nível superior e reporta erros", async () => {
    const messages = await runJs('await Promise.resolve(1); throw new TypeError("falhou")');
    expect(
      messages.some(
        (message) => message.type === "stderr" && message.text.includes("TypeError: falhou"),
      ),
    ).toBe(true);
    expect(messages.at(-1)).toMatchObject({ type: "done", ok: false });
  });

  it("lida com referências circulares", async () => {
    const messages = await runJs("const a = {}; a.self = a; console.log(a)");
    expect(messages.find((message) => message.type === "stdout")).toMatchObject({
      text: "{ self: [Circular] }",
    });
  });
});
