export interface Scale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const scale = ((value: number) => r0 + ((value - d0) / (d1 - d0 || 1)) * (r1 - r0)) as Scale;
  scale.domain = domain;
  scale.range = range;
  return scale;
}

/** Marcas "bonitas" (1, 2, 5 × 10ⁿ) para eixos. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 5, 10].map((m) => m * magnitude).find((s) => span / s <= count) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

export function polyline(points: Array<[number, number]>): string {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}
