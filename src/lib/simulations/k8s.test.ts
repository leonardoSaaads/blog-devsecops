import {
  clusterReducer,
  createCluster,
  summarize,
  type ClusterAction,
  type ClusterState,
} from "./k8s";

function run(state: ClusterState, ...actions: ClusterAction[]): ClusterState {
  return actions.reduce(clusterReducer, state);
}

function ticks(state: ClusterState, count: number): ClusterState {
  return run(state, ...Array.from({ length: count }, () => ({ type: "tick" }) as const));
}

describe("simulador de Deployment", () => {
  it("converge para o número desejado de réplicas prontas", () => {
    const state = ticks(createCluster({ replicas: 3 }), 6);
    expect(summarize(state)).toMatchObject({ ready: 3, desired: 3 });
    expect(new Set(state.pods.map((pod) => pod.ip)).size).toBe(3);
  });

  it("recria um pod excluído (self-healing)", () => {
    let state = ticks(createCluster({ replicas: 3 }), 6);
    const victim = state.pods[0]!.name;
    state = run(state, { type: "delete", name: victim });
    expect(state.pods.find((pod) => pod.name === victim)?.phase).toBe("Terminating");
    state = ticks(state, 6);
    expect(state.pods.some((pod) => pod.name === victim)).toBe(false);
    expect(summarize(state).ready).toBe(3);
  });

  it("escala para cima e para baixo respeitando o limite", () => {
    let state = ticks(createCluster({ replicas: 2 }), 6);
    state = ticks(run(state, { type: "scale", replicas: 99 }), 6);
    expect(summarize(state).ready).toBe(6);
    state = ticks(run(state, { type: "scale", replicas: 1 }), 6);
    expect(state.pods).toHaveLength(1);
  });

  it("Service só encaminha para pods prontos", () => {
    let state = run(createCluster({ replicas: 2 }), { type: "request" });
    expect(state.lastRequestFailed).toBe(true);
    state = run(ticks(state, 6), { type: "request" });
    expect(state.lastRequestFailed).toBe(false);
    expect(state.pods.find((pod) => pod.name === state.lastServedBy)?.phase).toBe("Running");
  });

  it("rolling update troca a versão sem reduzir pods prontos (maxUnavailable=0)", () => {
    let state = ticks(createCluster({ replicas: 3, version: "1.28" }), 6);
    state = run(state, { type: "rollout", version: "1.29" });
    for (let i = 0; i < 40; i++) {
      state = clusterReducer(state, { type: "tick" });
      expect(summarize(state).ready).toBeGreaterThanOrEqual(3);
    }
    const versions = state.pods.map((pod) => pod.version);
    expect(versions).toEqual(["1.29", "1.29", "1.29"]);
  });

  it("é determinístico para a mesma semente", () => {
    const a = ticks(createCluster({ seed: 7 }), 5);
    const b = ticks(createCluster({ seed: 7 }), 5);
    expect(a.pods.map((p) => p.name)).toEqual(b.pods.map((p) => p.name));
  });
});
