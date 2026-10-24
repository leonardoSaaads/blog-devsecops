/**
 * Geometric and modal fiber optics (equivalent step-index model).
 * Typical values: G.652.D (single-mode) and OM4 50/125 µm (graded-index multimode).
 */

export interface FiberType {
  id: "single" | "multi";
  label: string;
  /** Diameters in µm. */
  core: number;
  cladding: number;
  coating: number;
  numericalAperture: number;
  /** Cladding index at the operating wavelength. */
  claddingIndex: number;
  /** Operating wavelength in µm. */
  wavelength: number;
  profile: "step" | "graded";
}

export const FIBERS: Record<FiberType["id"], FiberType> = {
  single: {
    id: "single",
    label: "Single-mode (ITU-T G.652.D)",
    core: 8.2,
    cladding: 125,
    coating: 250,
    numericalAperture: 0.12,
    claddingIndex: 1.444,
    wavelength: 1.55,
    profile: "step",
  },
  multi: {
    id: "multi",
    label: "Multimode (OM4 50/125)",
    core: 50,
    cladding: 125,
    coating: 250,
    numericalAperture: 0.2,
    claddingIndex: 1.453,
    wavelength: 0.85,
    profile: "graded",
  },
};

const DEG = 180 / Math.PI;

/** n₁ = √(NA² + n₂²). */
export function coreIndex(fiber: FiberType): number {
  return Math.sqrt(fiber.numericalAperture ** 2 + fiber.claddingIndex ** 2);
}

/** Critical angle at the core/cladding interface (degrees, from the normal). */
export function criticalAngle(fiber: FiberType): number {
  return Math.asin(fiber.claddingIndex / coreIndex(fiber)) * DEG;
}

/** Half-angle of the acceptance cone in air (degrees). */
export function acceptanceAngle(fiber: FiberType): number {
  return Math.asin(fiber.numericalAperture) * DEG;
}

/** Normalized frequency V = π·d·NA/λ. */
export function vNumber(fiber: FiberType, wavelength = fiber.wavelength): number {
  return (Math.PI * fiber.core * fiber.numericalAperture) / wavelength;
}

/** Cutoff wavelength (µm): below it the fiber is no longer single-mode. */
export function cutoffWavelength(fiber: FiberType): number {
  return (Math.PI * fiber.core * fiber.numericalAperture) / 2.405;
}

/** Approximate number of guided modes (V²/2 step-index; V²/4 graded-index). */
export function modeCount(fiber: FiberType, wavelength = fiber.wavelength): number {
  const v = vNumber(fiber, wavelength);
  if (v < 2.405) return 1;
  return Math.round((v * v) / (fiber.profile === "step" ? 2 : 4));
}

/**
 * 2D ray trajectory: zigzag (step-index) or sinusoid (graded-index), confined to
 * |y| ≤ radius. `angle` is the propagation angle relative to the axis (degrees).
 */
export function rayPath(
  profile: FiberType["profile"],
  {
    radius,
    length,
    angle,
    segments = 240,
  }: { radius: number; length: number; angle: number; segments?: number },
): Array<[number, number]> {
  const slope = Math.tan(angle / DEG);
  if (slope === 0)
    return [
      [0, 0],
      [length, 0],
    ];
  const period = (4 * radius) / slope; // there and back between the walls
  const points: Array<[number, number]> = [];
  for (let index = 0; index <= segments; index += 1) {
    const x = (index / segments) * length;
    const phase = (x / period) % 1;
    const y =
      profile === "step"
        ? radius * (phase < 0.25 ? 4 * phase : phase < 0.75 ? 2 - 4 * phase : 4 * phase - 4)
        : radius * Math.sin(2 * Math.PI * phase);
    points.push([x, y]);
  }
  return points;
}
