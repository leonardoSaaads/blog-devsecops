import { mulberry32 } from "./random";

/** Amostra de série temporal (t em segundos). */
export interface Sample {
  t: number;
  v: number;
}

/**
 * Gera um contador monotônico raspado a cada `step` segundos, com taxa média
 * `ratePerSecond`, variação aleatória e, opcionalmente, um reset (reinício do processo).
 */
export function generateCounter({
  duration,
  step,
  ratePerSecond,
  resetAt,
  seed = 7,
}: {
  duration: number;
  step: number;
  ratePerSecond: number;
  resetAt?: number;
  seed?: number;
}): Sample[] {
  const random = mulberry32(seed);
  const samples: Sample[] = [];
  let value = 1000;
  let didReset = false;
  for (let t = 0; t <= duration; t += step) {
    if (t > 0) {
      // Taxa varia suavemente (carga do sistema) com ruído de ±30 %.
      const load = 1 + 0.35 * Math.sin((2 * Math.PI * t) / (duration / 1.5));
      value += ratePerSecond * step * load * (0.7 + 0.6 * random());
    }
    if (resetAt !== undefined && !didReset && t >= resetAt) {
      value = ratePerSecond * step * random(); // processo reiniciou: contador volta a ~0
      didReset = true;
    }
    samples.push({ t, v: Math.round(value) });
  }
  return samples;
}

/** Seleção de intervalo como no Prometheus 3: (início, fim] — exclui a borda esquerda. */
export function selectRange(samples: readonly Sample[], start: number, end: number): Sample[] {
  return samples.filter((sample) => sample.t > start && sample.t <= end);
}

/** Aumento bruto entre a primeira e a última amostra, corrigindo resets de contador. */
export function counterIncrease(samples: readonly Sample[]): number {
  let total = 0;
  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1]!.v;
    const current = samples[index]!.v;
    total += current >= previous ? current - previous : current; // reset: recomeça do zero
  }
  return total;
}

/**
 * Port do `extrapolatedRate` do Prometheus para contadores: corrige resets e extrapola
 * até as bordas da janela (limitado a meio intervalo médio quando há lacunas).
 * Retorna a taxa por segundo (`rate`) ou o aumento total (`increase`).
 */
export function extrapolatedRate(
  samples: readonly Sample[],
  start: number,
  end: number,
  isRate = true,
): number | null {
  const window = selectRange(samples, start, end);
  if (window.length < 2) return null;
  const first = window[0]!;
  const last = window[window.length - 1]!;
  const result = counterIncrease(window);
  const sampledInterval = last.t - first.t;
  const averageBetween = sampledInterval / (window.length - 1);
  const threshold = averageBetween * 1.1;

  let durationToStart = first.t - start;
  const durationToEnd = end - last.t;
  // Contadores não extrapolam abaixo de zero.
  if (result > 0 && first.v >= 0) {
    const durationToZero = sampledInterval * (first.v / result);
    if (durationToZero < durationToStart) durationToStart = durationToZero;
  }
  let extrapolateTo = sampledInterval;
  extrapolateTo += durationToStart < threshold ? durationToStart : averageBetween / 2;
  extrapolateTo += durationToEnd < threshold ? durationToEnd : averageBetween / 2;

  const value = result * (extrapolateTo / sampledInterval);
  return isRate ? value / (end - start) : value;
}

/** `irate`: taxa instantânea a partir das duas últimas amostras da janela. */
export function instantRate(samples: readonly Sample[], start: number, end: number): number | null {
  const window = selectRange(samples, start, end);
  if (window.length < 2) return null;
  const a = window[window.length - 2]!;
  const b = window[window.length - 1]!;
  const delta = b.v >= a.v ? b.v - a.v : b.v;
  return delta / (b.t - a.t);
}

/** Diferença ingênua último − primeiro (o que `delta()` faria com um contador). */
export function naiveDelta(samples: readonly Sample[], start: number, end: number): number | null {
  const window = selectRange(samples, start, end);
  if (window.length < 2) return null;
  return window[window.length - 1]!.v - window[0]!.v;
}

/** Avalia `rate(x[window])` em cada passo de consulta, como um gráfico do Grafana. */
export function rateSeries(
  samples: readonly Sample[],
  window: number,
  step: number,
): Array<{ t: number; value: number }> {
  const end = samples[samples.length - 1]?.t ?? 0;
  const series: Array<{ t: number; value: number }> = [];
  for (let t = window; t <= end; t += step) {
    const value = extrapolatedRate(samples, t - window, t);
    if (value !== null) series.push({ t, value });
  }
  return series;
}
