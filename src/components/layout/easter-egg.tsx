"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

/** Advances the Konami code recognizer; returns the new index. */
export function advanceSequence(progress: number, key: string): number {
  const expected = KONAMI_SEQUENCE[progress];
  if (key.toLowerCase() === expected?.toLowerCase()) return progress + 1;
  return key === KONAMI_SEQUENCE[0] ? 1 : 0;
}

/** ↑ ↑ ↓ ↓ ← → ← → B A — another Leonardo shows up. */
export function EasterEgg() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let progress = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      progress = advanceSequence(progress, event.key);
      if (progress === KONAMI_SEQUENCE.length) {
        progress = 0;
        setVisible(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex max-w-xs items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-2xl"
    >
      <Image src="/easter-egg.png" alt="Portrait of Leonardo da Vinci" width={72} height={64} />
      <p className="text-sm">
        <strong>Another Leonardo</strong> approves your Konami code. Engineering is art, too.
      </p>
    </div>
  );
}
