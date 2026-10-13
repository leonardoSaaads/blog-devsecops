import { describe, expect, it } from "vitest";
import {
  counterIncrease,
  extrapolatedRate,
  generateCounter,
  instantRate,
  naiveDelta,
  rateSeries,
  selectRange,
  type Sample,
} from "./promql";

const linear = (rate: number, step = 15, duration = 600): Sample[] =>
  Array.from({ length: duration / step + 1 }, (_, index) => ({
    t: index * step,
    v: 1000 + rate * index * step,
  }));

describe("PromQL: rate e increase", () => {
  it("janela é aberta à esquerda (Prometheus 3)", () => {
    expect(selectRange(linear(1), 0, 60).map((sample) => sample.t)).toEqual([15, 30, 45, 60]);
  });

  it("rate de um contador linear é exatamente a inclinação", () => {
    const samples = linear(10);
    expect(extrapolatedRate(samples, 0, 60)).toBeCloseTo(10, 9);
    expect(extrapolatedRate(samples, 240, 540)).toBeCloseTo(10, 9);
  });

  it("increase = rate × duração da janela", () => {
    const samples = linear(4);
    expect(extrapolatedRate(samples, 60, 360, false)).toBeCloseTo(4 * 300, 6);
  });

  it("resets são corrigidos; a diferença ingênua fica negativa", () => {
    const samples: Sample[] = [
      { t: 15, v: 100 },
      { t: 30, v: 250 },
      { t: 45, v: 30 }, // reinício do processo
      { t: 60, v: 180 },
    ];
    expect(counterIncrease(samples)).toBe(150 + 30 + 150);
    expect(naiveDelta(samples, 0, 60)).toBe(80);
    const withReset = generateCounter({ duration: 600, step: 15, ratePerSecond: 5, resetAt: 300 });
    expect(naiveDelta(withReset, 240, 360)).toBeLessThan(0);
    expect(extrapolatedRate(withReset, 240, 360)).toBeGreaterThan(0);
  });

  it("irate usa as duas últimas amostras", () => {
    expect(instantRate(linear(3), 0, 120)).toBeCloseTo(3, 9);
  });

  it("janela menor que dois intervalos não tem amostras suficientes", () => {
    expect(extrapolatedRate(linear(1), 0, 15)).toBeNull();
  });

  it("série de rate cobre o período e nunca é negativa", () => {
    const samples = generateCounter({ duration: 900, step: 15, ratePerSecond: 8, resetAt: 450 });
    const series = rateSeries(samples, 60, 15);
    expect(series.length).toBeGreaterThan(50);
    expect(series.every((point) => point.value >= 0)).toBe(true);
  });
});
