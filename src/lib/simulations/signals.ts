/**
 * Simulação didática da entrega de sinais em um contêiner (PID 1, docker stop/kill).
 * Modelo: o kernel ignora sinais com ação padrão enviados ao PID 1 de um namespace;
 * `sh -c` não repassa sinais ao filho; `tini`/`docker run --init` repassa.
 */

export type Pid1 = "shell" | "app" | "tini";
export type SignalName = "SIGHUP" | "SIGINT" | "SIGKILL" | "SIGTERM";

export interface ContainerSetup {
  pid1: Pid1;
  /** A aplicação instala tratadores (SIGTERM/SIGINT = desligamento; SIGHUP = recarga). */
  handler: boolean;
}

export const SIGNALS: Record<SignalName, { number: number; description: string }> = {
  SIGHUP: {
    number: 1,
    description: "Terminal desconectado; por convenção, daemons recarregam a configuração.",
  },
  SIGINT: { number: 2, description: "Interrupção pelo teclado (Ctrl+C)." },
  SIGKILL: {
    number: 9,
    description: "Encerramento imediato pelo kernel; não pode ser capturado nem ignorado.",
  },
  SIGTERM: {
    number: 15,
    description: "Pedido de término educado: enviado por docker stop e kubectl delete pod.",
  },
};

/** Prazo padrão do `docker stop` antes de escalar para SIGKILL. */
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
  /** Instante em segundos desde o envio. */
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
  /** A aplicação teve chance de concluir requisições e fechar recursos. */
  clean: boolean;
}

export function deliverSignal(setup: ContainerSetup, signal: SignalName): SignalOutcome {
  const viaStop = signal === "SIGTERM";
  const command = viaStop ? "docker stop app" : `docker kill --signal ${signal} app`;
  const events: SignalEvent[] = [{ t: 0, text: `$ ${command}`, tone: "info" }];
  const add = (t: number, text: string, tone: Tone = "info") => events.push({ t, text, tone });
  const number = SIGNALS[signal].number;

  if (signal === "SIGKILL") {
    add(0, "O kernel encerra todos os processos do contêiner imediatamente.", "danger");
    add(0, "Nenhum código da aplicação executa: conexões abertas são cortadas.", "danger");
    return { command, events, state: "killed", exitCode: 128 + 9, elapsed: 0, clean: false };
  }

  const tree = processTree(setup.pid1);
  add(0, `PID 1 (${tree[0]!.command}) recebe ${signal}.`);

  // Quem efetivamente recebe o sinal e se ele tem ação padrão "protegida" (PID 1).
  let appIsPid1 = setup.pid1 === "app";
  let reachesApp = true;
  if (setup.pid1 === "shell") {
    add(0, "O sh não instala tratador nem repassa o sinal ao processo filho (PID 7).", "warning");
    reachesApp = false;
  } else if (setup.pid1 === "tini") {
    add(0, "tini repassa o sinal ao processo filho (PID 7) e aguarda o seu término.");
    appIsPid1 = false;
  }

  if (reachesApp && setup.handler) {
    if (signal === "SIGHUP") {
      add(0.1, "Tratador de SIGHUP: a aplicação relê a configuração sem reiniciar.", "success");
      return { command, events, state: "reloaded", elapsed: 0.1, clean: true };
    }
    add(0.1, "Tratador executa: para de aceitar novas conexões.", "success");
    add(0.6, "Conclui as requisições em andamento e fecha o pool do banco de dados.", "success");
    add(1.2, "exit(0) — desligamento gracioso.", "success");
    return { command, events, state: "graceful", exitCode: 0, elapsed: 1.2, clean: true };
  }

  if (reachesApp && !appIsPid1) {
    add(
      0.05,
      `Sem tratador: ação padrão do ${signal} encerra o processo (sem limpeza).`,
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

  add(0, "Sem tratador e como PID 1, o kernel descarta o sinal: nada acontece.", "warning");
  if (!viaStop) {
    add(0, "O contêiner continua em execução; o sinal foi perdido.", "warning");
    return { command, events, state: "running", elapsed: 0, clean: false };
  }
  add(
    STOP_GRACE_SECONDS,
    `Prazo de ${STOP_GRACE_SECONDS} s esgotado: o Docker envia SIGKILL.`,
    "danger",
  );
  add(STOP_GRACE_SECONDS, "Processo morto sem desligamento gracioso (código 137).", "danger");
  return {
    command,
    events,
    state: "killed",
    exitCode: 137,
    elapsed: STOP_GRACE_SECONDS,
    clean: false,
  };
}
