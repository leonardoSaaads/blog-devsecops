import {
  berToQ,
  cascadedOsnrDb,
  channelFrequencyTHz,
  channelRange,
  combineSnrDb,
  constellation,
  erfc,
  frequencyToWavelengthNm,
  nearestChannel,
  osnrToSnrDb,
  qToBer,
  qToDb,
  referenceNoiseDbm,
  simulateConstellation,
  theoreticalSer,
  wavelengthToFrequencyTHz,
} from "./optics";

describe("grid DWDM (ITU-T G.694.1)", () => {
  it("ancora em 193,1 THz ≈ 1552,52 nm", () => {
    expect(channelFrequencyTHz(0, 100)).toBe(193.1);
    expect(frequencyToWavelengthNm(193.1)).toBeCloseTo(1552.52, 2);
  });

  it("calcula canais vizinhos e o inverso", () => {
    expect(channelFrequencyTHz(1, 50)).toBeCloseTo(193.15, 10);
    expect(channelFrequencyTHz(-2, 100)).toBeCloseTo(192.9, 10);
    expect(nearestChannel(wavelengthToFrequencyTHz(1550.12), 100)).toBe(3);
  });

  it("conta canais na banda C", () => {
    expect(channelRange(100).count).toBe(44);
    // 1530–1565 nm ≈ 4,38 THz; sistemas de 88/96 canais usam a banda C estendida.
    expect(channelRange(50).count).toBe(87);
    expect(channelRange(50, { min: 1528.77, max: 1566.73 }).count).toBe(96);
  });
});

describe("OSNR", () => {
  it("ruído de referência ≈ −58 dBm em 0,1 nm @1550 nm", () => {
    expect(referenceNoiseDbm()).toBeCloseTo(-57.95, 1);
  });

  it("regra 58 + P − perda − NF − 10·log N", () => {
    const osnr = cascadedOsnrDb({ launchPowerDbm: 1, spanLossDb: 22, noiseFigureDb: 5, spans: 10 });
    expect(osnr).toBeCloseTo(58 + 1 - 22 - 5 - 10, 0);
    // Dobrar o número de spans custa ~3 dB.
    const doubled = cascadedOsnrDb({
      launchPowerDbm: 1,
      spanLossDb: 22,
      noiseFigureDb: 5,
      spans: 20,
    });
    expect(osnr - doubled).toBeCloseTo(3.01, 2);
  });

  it("combina contribuições de ruído (GSNR)", () => {
    expect(combineSnrDb([20, 20])).toBeCloseTo(16.99, 2);
  });

  it("converte OSNR em SNR por símbolo", () => {
    expect(osnrToSnrDb(15, 12.5)).toBeCloseTo(15, 10);
    expect(osnrToSnrDb(15, 64)).toBeCloseTo(15 - 7.09, 2);
  });
});

describe("Q-factor e BER", () => {
  it("erfc tem precisão adequada", () => {
    expect(erfc(0)).toBeCloseTo(1, 6);
    expect(erfc(1)).toBeCloseTo(0.157299207, 6);
    expect(erfc(-1)).toBeCloseTo(1.842700793, 6);
  });

  it("valores clássicos: Q=6 → ~1e-9; Q=7 → ~1,3e-12", () => {
    expect(qToBer(6)).toBeCloseTo(9.87e-10, 11);
    expect(qToBer(7) / 1.28e-12).toBeCloseTo(1, 1);
  });

  it("limiar de FEC: BER 1e-2 ↔ Q ≈ 2,33 (7,3 dB)", () => {
    const q = berToQ(1e-2);
    expect(q).toBeCloseTo(2.326, 3);
    expect(qToDb(q)).toBeCloseTo(7.33, 2);
    expect(berToQ(qToBer(4.5))).toBeCloseTo(4.5, 6);
  });
});

describe("constelações", () => {
  it("normaliza a energia média para 1", () => {
    for (const mod of ["QPSK", "16QAM", "64QAM"] as const) {
      const points = constellation(mod);
      const energy = points.reduce((sum, p) => sum + p.i ** 2 + p.q ** 2, 0) / points.length;
      expect(energy).toBeCloseTo(1, 10);
    }
    expect(constellation("16QAM")).toHaveLength(16);
  });

  it("simulação é determinística e próxima da SER teórica", () => {
    const a = simulateConstellation({ modulation: "16QAM", snrDb: 14, symbols: 20000, seed: 7 });
    const b = simulateConstellation({ modulation: "16QAM", snrDb: 14, symbols: 20000, seed: 7 });
    expect(a.ser).toBe(b.ser);
    const expected = theoreticalSer("16QAM", 10 ** 1.4);
    expect(Math.abs(a.ser - expected) / expected).toBeLessThan(0.15);
  });

  it("SNR alto praticamente elimina erros em QPSK", () => {
    expect(
      simulateConstellation({ modulation: "QPSK", snrDb: 25, symbols: 5000 }).symbolErrors,
    ).toBe(0);
  });
});
