import { describe, expect, it } from "vitest";
import {
  acceptanceAngle,
  coreIndex,
  criticalAngle,
  cutoffWavelength,
  FIBERS,
  modeCount,
  rayPath,
  vNumber,
} from "./fiber";

describe("óptica de fibras", () => {
  it("índice do núcleo e ângulos coerentes com a abertura numérica", () => {
    const fiber = FIBERS.multi;
    const n1 = coreIndex(fiber);
    expect(n1).toBeGreaterThan(fiber.claddingIndex);
    // sen(90° − θc)·n₁ = NA
    expect(Math.sin(((90 - criticalAngle(fiber)) * Math.PI) / 180) * n1).toBeCloseTo(
      fiber.numericalAperture,
      9,
    );
    expect(acceptanceAngle(fiber)).toBeCloseTo(11.54, 1);
  });

  it("G.652.D é monomodo em 1310 e 1550 nm, com corte abaixo de 1310 nm", () => {
    const fiber = FIBERS.single;
    expect(vNumber(fiber, 1.55)).toBeLessThan(2.405);
    expect(vNumber(fiber, 1.31)).toBeLessThan(2.405);
    expect(cutoffWavelength(fiber)).toBeLessThan(1.31);
    expect(modeCount(fiber)).toBe(1);
  });

  it("OM4 em 850 nm guia centenas de modos", () => {
    expect(vNumber(FIBERS.multi)).toBeCloseTo(36.96, 1);
    expect(modeCount(FIBERS.multi)).toBeGreaterThan(300);
  });

  it("raios ficam confinados no núcleo", () => {
    for (const profile of ["step", "graded"] as const) {
      const path = rayPath(profile, { radius: 2, length: 100, angle: 12 });
      expect(path.every(([, y]) => Math.abs(y) <= 2 + 1e-9)).toBe(true);
      expect(Math.max(...path.map(([, y]) => y))).toBeGreaterThan(1.9);
    }
    expect(rayPath("step", { radius: 1, length: 10, angle: 0 })).toEqual([
      [0, 0],
      [10, 0],
    ]);
  });
});
