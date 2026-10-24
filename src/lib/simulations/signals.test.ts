import { describe, expect, it } from "vitest";
import { deliverSignal, processTree, STOP_GRACE_SECONDS } from "./signals";

describe("signals in containers", () => {
  it("shell form: sh as PID 1 does not forward SIGTERM, even when the app has a handler", () => {
    const outcome = deliverSignal({ pid1: "shell", handler: true }, "SIGTERM");
    expect(outcome.state).toBe("killed");
    expect(outcome.exitCode).toBe(137);
    expect(outcome.elapsed).toBe(STOP_GRACE_SECONDS);
    expect(outcome.clean).toBe(false);
  });

  it("an app as PID 1 without a handler ignores SIGTERM and ends up killed by SIGKILL", () => {
    expect(deliverSignal({ pid1: "app", handler: false }, "SIGTERM")).toMatchObject({
      state: "killed",
      exitCode: 137,
    });
  });

  it("an app with a handler shuts down gracefully with exit code 0", () => {
    for (const pid1 of ["app", "tini"] as const) {
      expect(deliverSignal({ pid1, handler: true }, "SIGTERM")).toMatchObject({
        state: "graceful",
        exitCode: 0,
        clean: true,
      });
    }
  });

  it("with tini and no handler, the default action exits with 128 + the signal number", () => {
    expect(deliverSignal({ pid1: "tini", handler: false }, "SIGTERM").exitCode).toBe(143);
    expect(deliverSignal({ pid1: "tini", handler: false }, "SIGINT").exitCode).toBe(130);
  });

  it("SIGHUP with a handler reloads; without one, as PID 1, it is lost", () => {
    expect(deliverSignal({ pid1: "app", handler: true }, "SIGHUP").state).toBe("reloaded");
    expect(deliverSignal({ pid1: "app", handler: false }, "SIGHUP").state).toBe("running");
  });

  it("SIGKILL cannot be handled", () => {
    for (const pid1 of ["shell", "app", "tini"] as const) {
      expect(deliverSignal({ pid1, handler: true }, "SIGKILL")).toMatchObject({
        state: "killed",
        exitCode: 137,
        elapsed: 0,
      });
    }
  });

  it("the process tree reflects the chosen PID 1", () => {
    expect(processTree("app")).toHaveLength(1);
    expect(processTree("tini")[0]?.command).toContain("tini");
  });
});
