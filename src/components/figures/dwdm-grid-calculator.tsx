"use client";

import { useId, useMemo, useState } from "react";
import {
  C_BAND_NM,
  FIXED_GRID_SPACINGS_GHZ,
  channelFrequencyTHz,
  channelRange,
  frequencyToWavelengthNm,
  nearestChannel,
  wavelengthToFrequencyTHz,
} from "@/lib/simulations/optics";
import { linearScale } from "./chart-utils";
import { InteractiveFigure, RangeField, Stat, controlToggle } from "./interactive-figure";

const WIDTH = 640;
const HEIGHT = 70;

export function DwdmGridCalculator() {
  const [spacing, setSpacing] = useState<number>(100);
  const [channel, setChannel] = useState(0);
  const [wavelengthInput, setWavelengthInput] = useState("1550.12");
  const wavelengthId = useId();

  const range = useMemo(() => channelRange(spacing), [spacing]);
  const frequency = channelFrequencyTHz(channel, spacing);
  const wavelength = frequencyToWavelengthNm(frequency);
  const inBand = wavelength >= C_BAND_NM.min && wavelength <= C_BAND_NM.max;

  const parsedWavelength = Number(wavelengthInput.trim());
  const lookup =
    Number.isFinite(parsedWavelength) && parsedWavelength > 1200 && parsedWavelength < 1700
      ? nearestChannel(wavelengthToFrequencyTHz(parsedWavelength), spacing)
      : undefined;

  const x = linearScale([C_BAND_NM.min, C_BAND_NM.max], [12, WIDTH - 12]);
  const ticks = useMemo(() => {
    const list: number[] = [];
    for (let n = range.first; n <= range.last; n++)
      list.push(frequencyToWavelengthNm(channelFrequencyTHz(n, spacing)));
    return list;
  }, [range, spacing]);

  const changeSpacing = (value: number) => {
    // Keep the same center frequency when switching spacing (closest channel).
    setChannel(nearestChannel(frequency, value));
    setSpacing(value);
  };

  return (
    <InteractiveFigure
      title="DWDM grid calculator (ITU-T G.694.1)"
      description="f = 193.1 THz + n·Δf and λ = c/f. Pick a spacing and step through the C-band channels."
      testId="dwdm-grid"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Channel spacing">
          {FIXED_GRID_SPACINGS_GHZ.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={spacing === value}
              onClick={() => changeSpacing(value)}
              className={controlToggle(spacing === value)}
            >
              {value} GHz
            </button>
          ))}
        </div>

        <RangeField
          label={`Channel index n (C-band: ${range.first} to ${range.last} — ${range.count} channels)`}
          value={channel}
          min={range.first}
          max={range.last}
          onChange={setChannel}
          testId="dwdm-channel"
        />

        <dl className="grid gap-3 sm:grid-cols-3">
          <Stat label="Center frequency" value={`${frequency.toFixed(4)} THz`} />
          <Stat label="Wavelength (vacuum)" value={`${wavelength.toFixed(3)} nm`} />
          <Stat
            label="C-band (1530–1565 nm)"
            value={inBand ? "inside" : "outside"}
            tone={inBand ? "success" : "warning"}
          />
        </dl>

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label={`C-band spectrum with ${range.count} channels; selected channel at ${wavelength.toFixed(2)} nm`}
        >
          <rect
            x={x(C_BAND_NM.min)}
            y={14}
            width={x(C_BAND_NM.max) - x(C_BAND_NM.min)}
            height={34}
            rx={6}
            className="fill-accent-soft"
          />
          {ticks.map((lambda) => (
            <line
              key={lambda}
              x1={x(lambda)}
              x2={x(lambda)}
              y1={20}
              y2={42}
              className="stroke-muted-foreground/40"
              strokeWidth={spacing < 50 ? 0.5 : 1}
            />
          ))}
          {inBand && (
            <line
              x1={x(wavelength)}
              x2={x(wavelength)}
              y1={8}
              y2={54}
              className="stroke-accent"
              strokeWidth={3}
            />
          )}
          <text x={x(C_BAND_NM.min)} y={66} className="fill-muted-foreground text-[11px]">
            1530 nm
          </text>
          <text
            x={x(C_BAND_NM.max)}
            y={66}
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            1565 nm
          </text>
        </svg>

        <div className="rounded-xl border border-border p-4 text-sm">
          <label htmlFor={wavelengthId} className="font-medium">
            Which channel is closest to
          </label>
          <input
            id={wavelengthId}
            value={wavelengthInput}
            onChange={(event) => setWavelengthInput(event.target.value)}
            inputMode="decimal"
            className="mx-2 h-9 w-28 rounded-lg border border-border bg-background px-2 font-mono outline-none focus:ring-4 focus:ring-[var(--ring)]"
          />
          nm?{" "}
          {lookup !== undefined ? (
            <span className="font-mono" data-testid="dwdm-lookup">
              n = {lookup} → {channelFrequencyTHz(lookup, spacing).toFixed(4)} THz
              <button
                type="button"
                className="ml-2 text-accent-strong underline-offset-4 hover:underline"
                onClick={() => setChannel(lookup)}
              >
                select
              </button>
            </span>
          ) : (
            <span className="text-danger">enter a value between 1200 and 1700 nm</span>
          )}
        </div>
      </div>
    </InteractiveFigure>
  );
}
