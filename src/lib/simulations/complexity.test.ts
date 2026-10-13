import { describe, expect, it } from "vitest";
import { crossover, estimateSeconds, formatDuration } from "./complexity";

describe("complexidade × linguagem", () => {
  it("estima o tempo como operações × custo", () => {
    expect(estimateSeconds("n", 1e9, 1)).toBeCloseTo(1, 9);
    expect(estimateSeconds("n2", 1e5, 1)).toBeCloseTo(10, 9);
  });

  it("formata durações em português", () => {
    expect(formatDuration(5e-9)).toBe("5 ns");
    expect(formatDuration(0.0123)).toBe("12,3 ms");
    expect(formatDuration(90)).toBe("1,5 min");
    expect(formatDuration(3 * 365.25 * 86_400)).toBe("3 anos");
    expect(formatDuration(Infinity)).toBe("> idade do universo");
  });

  it("O(n log n) em linguagem 50× mais lenta vence O(n²) rápido a partir de ~440 elementos", () => {
    const n = crossover("nlogn", 50, "n2", 1);
    expect(n).toBeGreaterThan(400);
    expect(n).toBeLessThan(480);
  });

  it("sem cruzamento quando o algoritmo 'melhor' é igual", () => {
    expect(crossover("n", 50, "n", 1)).toBeNull();
  });
});
