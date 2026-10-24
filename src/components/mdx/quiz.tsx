"use client";

import { CircleCheck, CircleX, GraduationCap } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface QuizProps {
  question: string;
  options: string[];
  /** Zero-based index of the correct option. */
  answer: number;
  explanation: string;
}

export function Quiz({ question, options, answer, explanation }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const name = useId();
  const correct = checked && selected === answer;

  return (
    <section
      className="not-prose my-8 rounded-2xl border border-border bg-card p-5"
      data-testid="quiz"
    >
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
        <GraduationCap className="size-4" aria-hidden="true" /> Quick check
      </p>
      <fieldset>
        <legend className="mb-3 font-semibold">{question}</legend>
        <div className="space-y-2">
          {options.map((option, index) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition",
                checked && index === answer && "border-success bg-success/10",
                checked && index === selected && index !== answer && "border-danger bg-danger/10",
                !checked &&
                  (selected === index
                    ? "border-accent bg-accent-soft"
                    : "border-border hover:border-accent"),
              )}
            >
              <input
                type="radio"
                name={name}
                value={index}
                checked={selected === index}
                onChange={() => {
                  setSelected(index);
                  setChecked(false);
                }}
                className="accent-[var(--accent)]"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={selected === null}
          onClick={() => setChecked(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check answer
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {checked &&
            (correct ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <CircleCheck className="size-4" aria-hidden="true" /> Correct!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-danger">
                <CircleX className="size-4" aria-hidden="true" /> Not quite.
              </span>
            ))}
        </p>
      </div>
      {checked && (
        <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{explanation}</p>
      )}
    </section>
  );
}
