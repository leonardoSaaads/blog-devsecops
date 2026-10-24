"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { nextPreference, type ThemePreference } from "@/lib/theme";

const LABELS: Record<ThemePreference, string> = {
  system: "Theme: system",
  light: "Theme: light",
  dark: "Theme: dark",
};

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const next = nextPreference(preference);
  const Icon = preference === "light" ? Sun : preference === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
      aria-label={`${LABELS[preference]}. Switch to ${LABELS[next].toLowerCase()}`}
      title={LABELS[preference]}
      data-testid="theme-toggle"
      data-preference={preference}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
