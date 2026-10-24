/**
 * Teaching simulation of signal delivery in a container (PID 1, docker stop/kill).
 * Model: the kernel ignores default-action signals sent to PID 1 of a namespace;
 * `sh -c` does not forward signals to its child; `tini`/`docker run --init` does.
 */

export type Pid1 = "shell" | "app" | "tini";
export type SignalName = "SIGHUP" | "SIGINT" | "SIGKILL" | "SIGTERM";

export interface ContainerSetup {
  pid1: Pid1;
  /** The application installs handlers (SIGTERM/SIGINT = shutdown; SIGHUP = reload). */
  handler: boolean;
}

export const SIGNALS: Record<SignalName, { number: number; description: string }> = {
  SIGHUP: {
    number: 1,
    description: "Terminal hung up; by convention, daemons reload their configuration.",
  },
  SIGINT: { number: 2, description: "Keyboard interrupt (Ctrl+C)." },
  SIGKILL: {
    number: 9,
    description: "Immediate termination by the kernel; cannot be caught or ignored.",
  },
  SIGTERM: {
    number: 15,
    description: "A polite termination request: sent by docker stop and kubectl delete pod.",
  },
};

/** Default `docker stop` grace period before escalating to SIGKILL. */
export const STOP_GRACE_SECONDS = 10;

export const DOCKERFILE: Record<Pid1, string> = {
  shell: "CMD python app.py",
  app: 'CMD ["python", "app.py"]',
  tini: 'ENTRYPOINT ["tini", "--"]\nCMD ["python", "app.py"]',
};

export function processTree(pid1: Pid1): Array<{ pid: number; command: string }> {
  switch (pid1) {
    case "shell":
      return [
        { pid: 1, command: '/bin/sh -c "python app.py"' },
        { pid: 7, command: "python app.py" },
      ];
    case "app":
      return [{ pid: 1, command: "python app.py" }];
    case "tini":
      return [
        { pid: 1, command: "tini -- python app.py" },
        { pid: 7, command: "python app.py" },
      ];
  }
}

export type Tone = "info" | "success" | "warning" | "danger";

export interface SignalEvent {
  /** Time in seconds since the signal was sent. */
  t: number;
  text: string;
  tone: Tone;
}

export interface SignalOutcome {
  command: string;
  events: SignalEvent[];
  state: "graceful" | "killed" | "terminated" | "running" | "reloaded";
  exitCode?: number;
  elapsed: number;
  /** The application got a chance to finish requests and release resources. */
  clean: boolean;
}

export function deliverSignal(setup: ContainerSetup, signal: SignalName): SignalOutcome {
  const viaStop = signal === "SIGTERM";
  const command = viaStop ? "docker stop app" : `docker kill --signal ${signal} app`;
  const events: SignalEvent[] = [{ t: 0, text: `$ ${command}`, tone: "info" }];
  const add = (t: number, text: string, tone: Tone = "info") => events.push({ t, text, tone });
  const number = SIGNALS[signal].number;

  if (signal === "SIGKILL") {
    add(0, "The kernel terminates every process in the container immediately.", "danger");
    add(0, "No application code runs: open connections are cut off.", "danger");
    return { command, events, state: "killed", exitCode: 128 + 9, elapsed: 0, clean: false };
  }

  const tree = processTree(setup.pid1);
  add(0, `PID 1 (${tree[0]!.command}) receives ${signal}.`);

  // Who actually receives the signal, and whether its default action is "protected" (PID 1).
  let appIsPid1 = setup.pid1 === "app";
  let reachesApp = true;
  if (setup.pid1 === "shell") {
    add(
      0,
      "sh installs no handler and does not forward the signal to its child (PID 7).",
      "warning",
    );
    reachesApp = false;
  } else if (setup.pid1 === "tini") {
    add(0, "tini forwards the signal to its child (PID 7) and waits for it to exit.");
    appIsPid1 = false;
  }

  if (reachesApp && setup.handler) {
    if (signal === "SIGHUP") {
      add(
        0.1,
        "SIGHUP handler: the application rereads its configuration without restarting.",
        "success",
      );
      return { command, events, state: "reloaded", elapsed: 0.1, clean: true };
    }
    add(0.1, "Handler runs: stops accepting new connections.", "success");
    add(0.6, "Finishes in-flight requests and closes the database pool.", "success");
    add(1.2, "exit(0) — graceful shutdown.", "success");
    return { command, events, state: "graceful", exitCode: 0, elapsed: 1.2, clean: true };
  }

  if (reachesApp && !appIsPid1) {
    add(
      0.05,
      `No handler: the default ${signal} action terminates the process (no cleanup).`,
      "warning",
    );
    return {
      command,
      events,
      state: "terminated",
      exitCode: 128 + number,
      elapsed: 0.05,
      clean: false,
    };
  }

  add(
    0,
    "No handler and running as PID 1: the kernel drops the signal and nothing happens.",
    "warning",
  );
  if (!viaStop) {
    add(0, "The container keeps running; the signal was lost.", "warning");
    return { command, events, state: "running", elapsed: 0, clean: false };
  }
  add(
    STOP_GRACE_SECONDS,
    `${STOP_GRACE_SECONDS} s grace period expired: Docker sends SIGKILL.`,
    "danger",
  );
  add(STOP_GRACE_SECONDS, "Process killed without a graceful shutdown (exit code 137).", "danger");
  return {
    command,
    events,
    state: "killed",
    exitCode: 137,
    elapsed: STOP_GRACE_SECONDS,
    clean: false,
  };
}
