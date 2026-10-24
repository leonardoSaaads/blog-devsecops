import { MousePointerClick } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Numbered interactive figure, embedded in the article flow (no need to leave the page).
 * The number ("Figure n.") comes from the article's CSS counter, as in a paper.
 */
export function InteractiveFigure({
  title,
  description,
  actions,
  children,
  className,
  testId,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  const captionId = useId();
  return (
    <figure
      aria-labelledby={captionId}
      className={cn("not-prose figure-numbered figure-wide my-12", className)}
      data-testid={testId}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_40px_-24px_rgb(15_23_42/0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-[linear-gradient(90deg,var(--accent-soft),transparent_70%)] px-5 py-2.5">
          <p className="smallcaps inline-flex items-center gap-1.5 text-xs font-semibold text-accent-strong">
            <MousePointerClick className="size-3.5" aria-hidden="true" /> Interactive figure
          </p>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
      <figcaption
        id={captionId}
        className="mt-3 px-1 font-serif text-[0.95rem] leading-relaxed text-muted-foreground"
      >
        <span className="figure-label" />
        <span className="font-semibold text-foreground">{title}.</span>
        {description && <> {description}</>}
      </figcaption>
    </figure>
  );
}

const controlButtonBase =
  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export const controlButton = `${controlButtonBase} border-border bg-card`;

/** Toggle button: state colors are mutually exclusive (no conflicting classes). */
export function controlToggle(active: boolean, extra?: string): string {
  return cn(
    controlButtonBase,
    active ? "border-accent bg-accent-soft text-foreground" : "border-border bg-card",
    extra,
  );
}

export const primaryButton =
  "inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "success" | "danger" | "warning";
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-mono text-lg font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </dd>
      {hint && <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  testId?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output htmlFor={id} className="font-mono tabular-nums text-muted-foreground">
          {value}
          {unit ? ` ${unit}` : ""}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--accent)]"
        data-testid={testId}
      />
    </div>
  );
}
