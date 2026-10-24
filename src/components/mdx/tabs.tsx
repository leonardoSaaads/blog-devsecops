"use client";

import { Children, isValidElement, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tab({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Accessible tabs (WAI-ARIA pattern: ←/→ arrows, Home/End). */
export function Tabs({ labels, children }: { labels: string[]; children: ReactNode }) {
  const panels = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const next = (index + labels.length) % labels.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: labels.length - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    focusTab(target);
  };

  return (
    <div className="not-prose my-6 rounded-xl border border-border">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex gap-1 overflow-x-auto border-b border-border p-1.5"
        onKeyDown={onKeyDown}
      >
        {labels.map((label, index) => (
          <button
            key={label}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
              index === active
                ? "bg-accent-soft text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
          className="prose prose-sm max-w-none p-3 dark:prose-invert [&_figure]:my-0"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
