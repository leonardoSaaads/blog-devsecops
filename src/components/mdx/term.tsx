"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MARGIN = 8;

/**
 * Technical term with a pop-up definition (inline glossary).
 * Opens on hover, focus or tap; closes with Esc (WCAG 1.4.13).
 * When closed, the pop-up leaves the layout (display: none) and stays available via aria-describedby.
 */
export function Term({ children, def }: { children: ReactNode; def: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const tooltipRef = useRef<HTMLSpanElement>(null);

  // Keeps the pop-up inside the viewport (no horizontal scroll on narrow screens).
  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!open || !tooltip) return;
    tooltip.style.translate = "";
    const { left, right } = tooltip.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const shift =
      right > viewport - MARGIN ? viewport - MARGIN - right : left < MARGIN ? MARGIN - left : 0;
    if (shift !== 0) tooltip.style.translate = `${Math.round(shift)}px 0`;
  }, [open]);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="cursor-help font-[inherit] text-[inherit] underline decoration-accent decoration-dotted decoration-2 underline-offset-4"
        data-testid="term"
      >
        {children}
      </button>
      <span
        ref={tooltipRef}
        id={id}
        role="tooltip"
        hidden={!open}
        className="absolute bottom-full left-0 z-30 mb-2 w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-border bg-card px-3 py-2 font-sans text-sm leading-snug text-foreground shadow-xl"
      >
        {def}
      </span>
    </span>
  );
}
