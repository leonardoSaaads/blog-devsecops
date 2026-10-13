"use client";

import { Shuffle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import {
  MODULATION_ORDER,
  bitsPerSymbol,
  dbToLinear,
  osnrToSnrDb,
  simulateConstellation,
  theoreticalSer,
  type Modulation,
} from "@/lib/simulations/optics";
import {
  InteractiveFigure,
  RangeField,
  Stat,
  controlButton,
  controlToggle,
} from "./interactive-figure";

const MODULATIONS: Modulation[] = ["QPSK", "16QAM", "64QAM"];
const SYMBOL_RATES = [32, 64, 96];
const SYMBOLS = 3000;
const SIZE = 360;

function formatProbability(value: number): string {
  if (value === 0) return "0";
  return value < 1e-3 ? value.toExponential(1) : value.toFixed(4);
}

export function ConstellationViewer() {
  const [modulation, setModulation] = useState<Modulation>("16QAM");
  const [osnr, setOsnr] = useState(22);
  const [symbolRate, setSymbolRate] = useState(32);
  const [seed, setSeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  const snrDb = osnrToSnrDb(osnr, symbolRate);
  const simulation = useMemo(
    () => simulateConstellation({ modulation, snrDb, symbols: SYMBOLS, seed }),
    [modulation, snrDb, seed],
  );
  const theory = theoreticalSer(modulation, dbToLinear(snrDb));
  const grossRate = 2 * bitsPerSymbol(modulation) * symbolRate;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const styles = getComputedStyle(document.documentElement);
    const colors = {
      grid: styles.getPropertyValue("--border").trim(),
      point: styles.getPropertyValue("--accent").trim(),
      error: styles.getPropertyValue("--danger").trim(),
      ideal: styles.getPropertyValue("--foreground").trim(),
    };
    const ratio = window.devicePixelRatio || 1;
    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, SIZE, SIZE);

    const extent = 1.6;
    const toPx = (value: number) => ((value + extent) / (2 * extent)) * SIZE;

    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(SIZE / 2, 0);
    context.lineTo(SIZE / 2, SIZE);
    context.moveTo(0, SIZE / 2);
    context.lineTo(SIZE, SIZE / 2);
    context.stroke();

    for (const point of simulation.received) {
      context.fillStyle = point.error ? colors.error : colors.point;
      context.globalAlpha = point.error ? 0.9 : 0.45;
      context.fillRect(toPx(point.i) - 1, SIZE - toPx(point.q) - 1, 2.2, 2.2);
    }
    context.globalAlpha = 1;
    context.strokeStyle = colors.ideal;
    context.lineWidth = 1.5;
    for (const point of simulation.ideal) {
      const cx = toPx(point.i);
      const cy = SIZE - toPx(point.q);
      context.beginPath();
      context.moveTo(cx - 4, cy);
      context.lineTo(cx + 4, cy);
      context.moveTo(cx, cy - 4);
      context.lineTo(cx, cy + 4);
      context.stroke();
    }
  }, [simulation, theme]);

  return (
    <InteractiveFigure
      title="Constelações coerentes sob ruído"
      description="Simulação de símbolos com ruído gaussiano (AWGN) por polarização. Pontos em vermelho foram decididos errado pelo receptor."
      testId="constellation-viewer"
      actions={
        <button
          type="button"
          className={controlButton}
          onClick={() => setSeed((value) => value + 1)}
        >
          <Shuffle className="size-4" aria-hidden="true" /> Novas amostras
        </button>
      }
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <canvas
          ref={canvasRef}
          style={{ width: SIZE, height: SIZE }}
          className="mx-auto max-w-full rounded-xl border border-border bg-background"
          role="img"
          aria-label={`Constelação ${modulation} com SNR de ${snrDb.toFixed(1)} dB: ${simulation.symbolErrors} erros em ${SYMBOLS} símbolos`}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Formato de modulação">
            {MODULATIONS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={modulation === value}
                onClick={() => setModulation(value)}
                className={controlToggle(modulation === value)}
              >
                DP-{value}
              </button>
            ))}
          </div>
          <RangeField
            label="OSNR (0,1 nm)"
            value={osnr}
            min={6}
            max={36}
            step={0.5}
            unit="dB"
            onChange={setOsnr}
            testId="constellation-osnr"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Taxa de símbolos">
            {SYMBOL_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                aria-pressed={symbolRate === rate}
                onClick={() => setSymbolRate(rate)}
                className={controlToggle(symbolRate === rate, "font-mono text-xs")}
              >
                {rate} GBd
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <Stat
              label="SNR por símbolo"
              value={`${snrDb.toFixed(1)} dB`}
              hint="SNR = OSNR·B_ref/R_s"
            />
            <Stat
              label="Taxa bruta"
              value={`${grossRate} Gb/s`}
              hint={`2 pol. × ${bitsPerSymbol(modulation)} bit × ${symbolRate} GBd`}
            />
            <Stat
              label="SER simulada"
              value={<span data-testid="ser-simulated">{formatProbability(simulation.ser)}</span>}
              tone={simulation.ser > 1e-2 ? "danger" : "success"}
            />
            <Stat
              label="SER teórica"
              value={formatProbability(theory)}
              hint={`${MODULATION_ORDER[modulation]} pontos`}
            />
          </dl>
        </div>
      </div>
    </InteractiveFigure>
  );
}
