import { gaussian, mulberry32 } from "./random";

export const SPEED_OF_LIGHT = 299_792_458; // m/s
export const PLANCK = 6.62607015e-34; // J·s
/** Frequência de ancoragem do grid DWDM (ITU-T G.694.1). */
export const GRID_ANCHOR_THZ = 193.1;
export const FIXED_GRID_SPACINGS_GHZ = [100, 50, 25, 12.5] as const;
/** Banda C convencional. */
export const C_BAND_NM = { min: 1530, max: 1565 } as const;

// ---------------------------------------------------------------- grid DWDM

export function channelFrequencyTHz(n: number, spacingGHz: number): number {
  return GRID_ANCHOR_THZ + (n * spacingGHz) / 1000;
}

export function frequencyToWavelengthNm(frequencyTHz: number): number {
  return SPEED_OF_LIGHT / (frequencyTHz * 1e12) / 1e-9;
}

export function wavelengthToFrequencyTHz(wavelengthNm: number): number {
  return SPEED_OF_LIGHT / (wavelengthNm * 1e-9) / 1e12;
}

/** Índice n do canal mais próximo de uma frequência. */
export function nearestChannel(frequencyTHz: number, spacingGHz: number): number {
  return Math.round(((frequencyTHz - GRID_ANCHOR_THZ) * 1000) / spacingGHz);
}

/** Faixa de índices n cujos canais caem dentro de uma janela em nm. */
export function channelRange(spacingGHz: number, band: { min: number; max: number } = C_BAND_NM) {
  const fMin = wavelengthToFrequencyTHz(band.max);
  const fMax = wavelengthToFrequencyTHz(band.min);
  const first = Math.ceil(((fMin - GRID_ANCHOR_THZ) * 1000) / spacingGHz);
  const last = Math.floor(((fMax - GRID_ANCHOR_THZ) * 1000) / spacingGHz);
  return { first, last, count: last - first + 1 };
}

// ------------------------------------------------------------- conversões dB

export const dbToLinear = (db: number) => 10 ** (db / 10);
export const linearToDb = (value: number) => 10 * Math.log10(value);

// -------------------------------------------------------------------- OSNR

/** Potência de ruído de referência hν·B_ref em dBm (≈ −58 dBm em 1550 nm, 12,5 GHz). */
export function referenceNoiseDbm(wavelengthNm = 1550, referenceBandwidthGHz = 12.5): number {
  const frequency = SPEED_OF_LIGHT / (wavelengthNm * 1e-9);
  const watts = PLANCK * frequency * referenceBandwidthGHz * 1e9;
  return linearToDb(watts * 1000);
}

export interface LinkParameters {
  launchPowerDbm: number;
  spanLossDb: number;
  noiseFigureDb: number;
  spans: number;
  wavelengthNm?: number;
  referenceBandwidthGHz?: number;
}

/**
 * OSNR (dB, em B_ref = 0,1 nm ≈ 12,5 GHz) de uma cadeia de N amplificadores idênticos
 * que compensam exatamente a perda do span:
 * OSNR = P_in − NF − 10·log10(hν·B_ref) − 10·log10(N), com P_in = P_lanç − perda.
 */
export function cascadedOsnrDb({
  launchPowerDbm,
  spanLossDb,
  noiseFigureDb,
  spans,
  wavelengthNm = 1550,
  referenceBandwidthGHz = 12.5,
}: LinkParameters): number {
  if (spans < 1) throw new Error("spans deve ser ≥ 1");
  const inputPower = launchPowerDbm - spanLossDb;
  return (
    inputPower -
    noiseFigureDb -
    referenceNoiseDbm(wavelengthNm, referenceBandwidthGHz) -
    linearToDb(spans)
  );
}

/** Soma de contribuições de ruído: 1/SNR_total = Σ 1/SNR_i. */
export function combineSnrDb(valuesDb: number[]): number {
  const inverse = valuesDb.reduce((sum, value) => sum + 1 / dbToLinear(value), 0);
  return -linearToDb(inverse);
}

/** SNR por símbolo (por polarização) a partir do OSNR: SNR = OSNR·B_ref/R_s. */
export function osnrToSnrDb(
  osnrDb: number,
  symbolRateGBd: number,
  referenceBandwidthGHz = 12.5,
): number {
  return osnrDb + linearToDb(referenceBandwidthGHz / symbolRateGBd);
}

// ------------------------------------------------------------------ Q e BER

/** Função erro complementar (aproximação de Chebyshev, erro relativo < 1,2·10⁻⁷). */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/** BER = ½·erfc(Q/√2). */
export function qToBer(q: number): number {
  return 0.5 * erfc(q / Math.SQRT2);
}

/** Inversa numérica de `qToBer` (bisseção; BER em (0, 0,5)). */
export function berToQ(ber: number): number {
  if (!(ber > 0 && ber < 0.5)) throw new Error("BER deve estar no intervalo (0; 0,5)");
  let low = 0;
  let high = 40;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    if (qToBer(mid) > ber) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** Q² em dB, convenção de mercado: 20·log10(Q). */
export const qToDb = (q: number) => 20 * Math.log10(q);
export const dbToQ = (db: number) => 10 ** (db / 20);

// --------------------------------------------------------------- modulação

export type Modulation = "QPSK" | "16QAM" | "64QAM";
export interface Point {
  i: number;
  q: number;
}

export const MODULATION_ORDER: Record<Modulation, number> = { QPSK: 4, "16QAM": 16, "64QAM": 64 };

export function bitsPerSymbol(modulation: Modulation): number {
  return Math.log2(MODULATION_ORDER[modulation]);
}

/** Constelação quadrada M-QAM com energia média unitária. */
export function constellation(modulation: Modulation): Point[] {
  const side = Math.sqrt(MODULATION_ORDER[modulation]);
  const levels = Array.from({ length: side }, (_, k) => 2 * k - side + 1);
  const points = levels.flatMap((i) => levels.map((q) => ({ i, q })));
  const energy = points.reduce((sum, p) => sum + p.i ** 2 + p.q ** 2, 0) / points.length;
  const scale = 1 / Math.sqrt(energy);
  return points.map((p) => ({ i: p.i * scale, q: p.q * scale }));
}

/** SER teórica de M-QAM quadrada em AWGN (SNR por símbolo, linear). */
export function theoreticalSer(modulation: Modulation, snrLinear: number): number {
  const m = MODULATION_ORDER[modulation];
  const qFunc = (x: number) => 0.5 * erfc(x / Math.SQRT2);
  const p = 2 * (1 - 1 / Math.sqrt(m)) * qFunc(Math.sqrt((3 * snrLinear) / (m - 1)));
  return 1 - (1 - p) ** 2;
}

export interface ConstellationSimulation {
  ideal: Point[];
  received: Array<Point & { error: boolean }>;
  symbolErrors: number;
  ser: number;
}

/** Simula símbolos aleatórios com ruído gaussiano aditivo e decisão por mínima distância. */
export function simulateConstellation({
  modulation,
  snrDb,
  symbols,
  seed = 1,
}: {
  modulation: Modulation;
  snrDb: number;
  symbols: number;
  seed?: number;
}): ConstellationSimulation {
  const ideal = constellation(modulation);
  const random = mulberry32(seed);
  // Energia de símbolo unitária → variância do ruído por dimensão = 1/(2·SNR).
  const sigma = Math.sqrt(1 / (2 * dbToLinear(snrDb)));
  let symbolErrors = 0;

  const received = Array.from({ length: symbols }, () => {
    const sent = ideal[Math.floor(random() * ideal.length)]!;
    const point = { i: sent.i + sigma * gaussian(random), q: sent.q + sigma * gaussian(random) };
    let nearest = ideal[0]!;
    let best = Infinity;
    for (const candidate of ideal) {
      const distance = (candidate.i - point.i) ** 2 + (candidate.q - point.q) ** 2;
      if (distance < best) {
        best = distance;
        nearest = candidate;
      }
    }
    const error = nearest !== sent;
    if (error) symbolErrors++;
    return { ...point, error };
  });

  return { ideal, received, symbolErrors, ser: symbolErrors / symbols };
}
