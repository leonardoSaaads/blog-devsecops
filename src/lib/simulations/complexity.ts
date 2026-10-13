/**
 * Modelo didático "custo por operação × número de operações": compara o efeito
 * da complexidade assintótica com o da velocidade da linguagem.
 */

export const COMPLEXITIES = [
  { id: "log", label: "O(log n)", ops: (n: number) => Math.max(1, Math.log2(n)) },
  { id: "n", label: "O(n)", ops: (n: number) => n },
  { id: "nlogn", label: "O(n log n)", ops: (n: number) => n * Math.max(1, Math.log2(n)) },
  { id: "n2", label: "O(n²)", ops: (n: number) => n * n },
  { id: "2n", label: "O(2ⁿ)", ops: (n: number) => 2 ** Math.min(n, 1100) },
] as const;

export type ComplexityId = (typeof COMPLEXITIES)[number]["id"];

export function complexity(id: ComplexityId) {
  return COMPLEXITIES.find((item) => item.id === id)!;
}

/** Tempo estimado em segundos para `n` elementos com custo `nsPerOp` por operação. */
export function estimateSeconds(id: ComplexityId, n: number, nsPerOp: number): number {
  return (complexity(id).ops(n) * nsPerOp) / 1e9;
}

const AGE_OF_UNIVERSE_S = 13.8e9 * 365.25 * 86_400;

/** Duração legível em português (de nanossegundos a "mais que a idade do universo"). */
export function formatDuration(seconds: number): string {
  const number = (value: number) =>
    new Intl.NumberFormat("pt-BR", { maximumSignificantDigits: value < 10 ? 2 : 3 }).format(value);
  if (!Number.isFinite(seconds) || seconds > AGE_OF_UNIVERSE_S) return "> idade do universo";
  const units: Array<[number, string]> = [
    [365.25 * 86_400, "anos"],
    [86_400, "dias"],
    [3600, "h"],
    [60, "min"],
    [1, "s"],
    [1e-3, "ms"],
    [1e-6, "µs"],
    [1e-9, "ns"],
  ];
  for (const [size, unit] of units) {
    if (seconds >= size) return `${number(seconds / size)} ${unit}`;
  }
  return `${number(seconds / 1e-9)} ns`;
}

/**
 * Menor `n` a partir do qual o algoritmo `better` na linguagem lenta vence o algoritmo
 * `worse` na linguagem rápida (busca binária; assume que o cruzamento existe e é único).
 */
export function crossover(
  better: ComplexityId,
  slowNsPerOp: number,
  worse: ComplexityId,
  fastNsPerOp: number,
  max = 1e12,
): number | null {
  const wins = (n: number) =>
    estimateSeconds(better, n, slowNsPerOp) < estimateSeconds(worse, n, fastNsPerOp);
  if (!wins(max)) return null;
  let lo = 2;
  let hi = max;
  if (wins(lo)) return lo;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (wins(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}
