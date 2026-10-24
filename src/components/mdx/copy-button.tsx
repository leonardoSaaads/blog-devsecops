"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

/** Copies the text of the sibling `<pre>` inside the same `<figure>`. */
export function CopyButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const pre = ref.current?.closest("figure")?.querySelector("pre");
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
      aria-label={copied ? "Code copied" : "Copy code"}
    >
      {copied ? (
        <Check className="size-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
