import { mulberry32 } from "./random";

export type PodPhase = "Pending" | "ContainerCreating" | "Running" | "Terminating";

export interface Pod {
  name: string;
  ip: string;
  phase: PodPhase;
  version: string;
  /** Ticks no estado atual. */
  age: number;
  served: number;
}

export interface ClusterState {
  desired: number;
  version: string;
  pods: Pod[];
  events: string[];
  tick: number;
  seed: number;
  nextIp: number;
  lastServedBy?: string;
  lastRequestFailed?: boolean;
}

export type ClusterAction =
  | { type: "tick" }
  | { type: "scale"; replicas: number }
  | { type: "delete"; name: string }
  | { type: "request" }
  | { type: "rollout"; version: string }
  | { type: "reset" };

export const MAX_REPLICAS = 6;
const PHASE_DURATION: Record<Exclude<PodPhase, "Running">, number> = {
  Pending: 1,
  ContainerCreating: 2,
  Terminating: 2,
};
const MAX_EVENTS = 8;
const ALPHABET = "bcdfghjklmnpqrstvwxz2456789";

export function createCluster({ replicas = 3, version = "1.28", seed = 42 } = {}): ClusterState {
  return { desired: replicas, version, pods: [], events: [], tick: 0, seed, nextIp: 10 };
}

function randomSuffix(state: ClusterState, length: number): string {
  const random = mulberry32(state.seed);
  let suffix = "";
  for (let i = 0; i < length; i++) suffix += ALPHABET[Math.floor(random() * ALPHABET.length)];
  state.seed = Math.floor(random() * 2 ** 31);
  return suffix;
}

function log(state: ClusterState, message: string): void {
  state.events = [message, ...state.events].slice(0, MAX_EVENTS);
}

function createPod(state: ClusterState, version: string): void {
  const hash = version.replace(/\D/g, "").padEnd(5, "7").slice(0, 5);
  const name = `nginx-deployment-${hash}-${randomSuffix(state, 5)}`;
  state.pods.push({
    name,
    ip: `10.42.0.${state.nextIp++}`,
    phase: "Pending",
    version,
    age: 0,
    served: 0,
  });
  log(state, `Normal  SuccessfulCreate  replicaset  Created pod: ${name}`);
}

function terminate(state: ClusterState, pod: Pod, reason: string): void {
  if (pod.phase === "Terminating") return;
  pod.phase = "Terminating";
  pod.age = 0;
  log(state, `Normal  Killing  pod/${pod.name}  ${reason}`);
}

const isActive = (pod: Pod) => pod.phase !== "Terminating";
const isReady = (pod: Pod) => pod.phase === "Running";

/** Avança fases e executa o laço de reconciliação do Deployment (maxSurge=1, maxUnavailable=0). */
function reconcile(state: ClusterState): void {
  for (const pod of state.pods) {
    pod.age++;
    if (pod.phase === "Pending" && pod.age >= PHASE_DURATION.Pending) {
      pod.phase = "ContainerCreating";
      pod.age = 0;
      log(state, `Normal  Scheduled  pod/${pod.name}  Successfully assigned to node k3s-01`);
    } else if (pod.phase === "ContainerCreating" && pod.age >= PHASE_DURATION.ContainerCreating) {
      pod.phase = "Running";
      pod.age = 0;
      log(state, `Normal  Started  pod/${pod.name}  Started container nginx:${pod.version}`);
    }
  }
  state.pods = state.pods.filter(
    (pod) => !(pod.phase === "Terminating" && pod.age >= PHASE_DURATION.Terminating),
  );

  const active = state.pods.filter(isActive);
  const outdated = active.filter((pod) => pod.version !== state.version);
  const current = active.filter((pod) => pod.version === state.version);

  if (outdated.length > 0) {
    // Rolling update: sobe 1 pod novo; quando ele fica pronto, encerra 1 antigo.
    const surging = current.some((pod) => !isReady(pod));
    if (!surging && active.length <= state.desired) {
      createPod(state, state.version);
    } else if (!surging && active.length > state.desired) {
      terminate(state, outdated[0]!, "Rolling update: substituindo versão anterior");
    }
    return;
  }

  if (active.length < state.desired) {
    for (let i = active.length; i < state.desired; i++) createPod(state, state.version);
  } else if (active.length > state.desired) {
    // Remove primeiro os que ainda não estão prontos e depois os mais novos.
    const victims = [...active]
      .sort(
        (a, b) =>
          Number(isReady(a)) - Number(isReady(b)) || state.pods.indexOf(b) - state.pods.indexOf(a),
      )
      .slice(0, active.length - state.desired);
    victims.forEach((pod) => terminate(state, pod, "Scaling down"));
  }
}

export function clusterReducer(previous: ClusterState, action: ClusterAction): ClusterState {
  const state: ClusterState = {
    ...previous,
    pods: previous.pods.map((pod) => ({ ...pod })),
    events: [...previous.events],
  };

  switch (action.type) {
    case "tick":
      state.tick++;
      reconcile(state);
      return state;
    case "scale": {
      const replicas = Math.max(0, Math.min(MAX_REPLICAS, Math.round(action.replicas)));
      if (replicas !== state.desired) {
        log(state, `Normal  ScalingReplicaSet  deployment/nginx-deployment  Scaled to ${replicas}`);
        state.desired = replicas;
      }
      return state;
    }
    case "delete": {
      const pod = state.pods.find((candidate) => candidate.name === action.name);
      if (pod) terminate(state, pod, "kubectl delete pod (manual)");
      return state;
    }
    case "request": {
      // kube-proxy (modo iptables/nftables) escolhe um endpoint pronto de forma aleatória.
      const endpoints = state.pods.filter(isReady);
      if (endpoints.length === 0) {
        state.lastServedBy = undefined;
        state.lastRequestFailed = true;
        log(state, "Warning  GET /  503 Service Unavailable — nenhum endpoint pronto");
        return state;
      }
      const random = mulberry32(state.seed);
      const target = endpoints[Math.floor(random() * endpoints.length)]!;
      state.seed = Math.floor(random() * 2 ** 31);
      target.served++;
      state.lastServedBy = target.name;
      state.lastRequestFailed = false;
      log(state, `Normal  GET /  200 OK  ← ${target.name} (${target.ip})`);
      return state;
    }
    case "rollout":
      if (action.version !== state.version) {
        state.version = action.version;
        log(state, `Normal  ScalingReplicaSet  rollout iniciado: nginx:${action.version}`);
      }
      return state;
    case "reset":
      return createCluster({ replicas: 3, seed: previous.seed });
  }
}

export function summarize(state: ClusterState) {
  const ready = state.pods.filter(isReady).length;
  return {
    ready,
    desired: state.desired,
    total: state.pods.length,
    upToDate: state.pods.filter((p) => isActive(p) && p.version === state.version).length,
  };
}
