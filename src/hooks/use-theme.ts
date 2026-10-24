"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-theme-preference"],
  });
  return () => observer.disconnect();
}

function readSnapshot(): string {
  const { theme, themePreference } = document.documentElement.dataset;
  return `${theme ?? "light"}|${themePreference ?? "system"}`;
}

function applyPreference(preference: ThemePreference): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(preference, prefersDark);
  root.dataset.themePreference = preference;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage unavailable (private/blocked mode): the theme applies to this session only.
  }
}

export function useTheme(): {
  theme: ResolvedTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
} {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "light|system");
  const [theme, rawPreference] = snapshot.split("|");
  const preference: ThemePreference = isThemePreference(rawPreference) ? rawPreference : "system";

  // Follow operating-system changes while the preference is "system".
  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyPreference("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => applyPreference(next), []);

  return { theme: theme === "dark" ? "dark" : "light", preference, setPreference };
}
