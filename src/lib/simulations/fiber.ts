/**
 * Óptica geométrica e modal de fibras (modelo de índice degrau equivalente).
 * Valores típicos: G.652.D (monomodo) e OM4 50/125 µm (multimodo de índice gradual).
 */

export interface FiberType {
  id: "single" | "multi";
  label: string;
  /** Diâmetros em µm. */
  core: number;
  cladding: number;
  coating: number;
  numericalAperture: number;
  /** Índice da casca no comprimento de onda de operação. */
  claddingIndex: number;
  /** Comprimento de onda de operação em µm. */
  wavelength: number;
  profile: "step" | "graded";
}

export const FIBERS: Record<FiberType["id"], FiberType> = {
  single: {
    id: "single",
    label: "Monomodo (ITU-T G.652.D)",
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
    label: "Multimodo (OM4 50/125)",
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

/** Ângulo crítico na interface núcleo/casca (graus, em relação à normal). */
export function criticalAngle(fiber: FiberType): number {
  return Math.asin(fiber.claddingIndex / coreIndex(fiber)) * DEG;
}

/** Meio-ângulo do cone de aceitação no ar (graus). */
export function acceptanceAngle(fiber: FiberType): number {
  return Math.asin(fiber.numericalAperture) * DEG;
}

/** Frequência normalizada V = π·d·NA/λ. */
export function vNumber(fiber: FiberType, wavelength = fiber.wavelength): number {
  return (Math.PI * fiber.core * fiber.numericalAperture) / wavelength;
}

/** Comprimento de onda de corte (µm): abaixo dele a fibra deixa de ser monomodo. */
export function cutoffWavelength(fiber: FiberType): number {
  return (Math.PI * fiber.core * fiber.numericalAperture) / 2.405;
}

/** Número aproximado de modos guiados (V²/2 degrau; V²/4 gradual). */
export function modeCount(fiber: FiberType, wavelength = fiber.wavelength): number {
  const v = vNumber(fiber, wavelength);
  if (v < 2.405) return 1;
  return Math.round((v * v) / (fiber.profile === "step" ? 2 : 4));
}

/**
 * Trajetória 2D de um raio: zigue-zague (índice degrau) ou senoide (índice gradual),
 * confinado em |y| ≤ raio. `angle` é o ângulo de propagação em relação ao eixo (graus).
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
  const period = (4 * radius) / slope; // ida e volta entre as paredes
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
