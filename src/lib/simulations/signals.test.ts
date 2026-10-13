import { describe, expect, it } from "vitest";
import { deliverSignal, processTree, STOP_GRACE_SECONDS } from "./signals";

describe("sinais em contêineres", () => {
  it("forma shell: sh como PID 1 não repassa SIGTERM, mesmo com tratador na aplicação", () => {
    const outcome = deliverSignal({ pid1: "shell", handler: true }, "SIGTERM");
    expect(outcome.state).toBe("killed");
    expect(outcome.exitCode).toBe(137);
    expect(outcome.elapsed).toBe(STOP_GRACE_SECONDS);
    expect(outcome.clean).toBe(false);
  });

  it("aplicação como PID 1 sem tratador ignora SIGTERM e acaba morta pelo SIGKILL", () => {
    expect(deliverSignal({ pid1: "app", handler: false }, "SIGTERM")).toMatchObject({
      state: "killed",
      exitCode: 137,
    });
  });

  it("aplicação com tratador encerra graciosamente com código 0", () => {
    for (const pid1 of ["app", "tini"] as const) {
      expect(deliverSignal({ pid1, handler: true }, "SIGTERM")).toMatchObject({
        state: "graceful",
        exitCode: 0,
        clean: true,
      });
    }
  });

  it("com tini e sem tratador, a ação padrão encerra com 128 + número do sinal", () => {
    expect(deliverSignal({ pid1: "tini", handler: false }, "SIGTERM").exitCode).toBe(143);
    expect(deliverSignal({ pid1: "tini", handler: false }, "SIGINT").exitCode).toBe(130);
  });

  it("SIGHUP com tratador recarrega; sem tratador como PID 1 é perdido", () => {
    expect(deliverSignal({ pid1: "app", handler: true }, "SIGHUP").state).toBe("reloaded");
    expect(deliverSignal({ pid1: "app", handler: false }, "SIGHUP").state).toBe("running");
  });

  it("SIGKILL não pode ser tratado", () => {
    for (const pid1 of ["shell", "app", "tini"] as const) {
      expect(deliverSignal({ pid1, handler: true }, "SIGKILL")).toMatchObject({
        state: "killed",
        exitCode: 137,
        elapsed: 0,
      });
    }
  });

  it("árvore de processos reflete o PID 1 escolhido", () => {
    expect(processTree("app")).toHaveLength(1);
    expect(processTree("tini")[0]?.command).toContain("tini");
  });
});
