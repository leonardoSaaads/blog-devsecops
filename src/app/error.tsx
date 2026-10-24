"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-mono text-sm text-danger">Unexpected error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Something went wrong while loading this page.
        </h1>
        {/* Never show internal error details; only the identifier for support. */}
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Try again
        </button>
      </div>
    </div>
  );
}
