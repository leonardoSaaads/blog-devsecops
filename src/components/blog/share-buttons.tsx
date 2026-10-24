"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { useClientValue } from "@/hooks/use-client-value";
import { LinkedinIcon } from "@/components/icons/brand-icons";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  // Detected on the client only to avoid a server/client mismatch.
  const canShare = useClientValue(() => "share" in navigator, false);
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const buttonClass =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition hover:border-accent";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share this article" role="group">
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <LinkedinIcon className="size-4" /> LinkedIn
      </a>
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
        {copied ? "Link copied" : "Copy link"}
      </button>
      {canShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => undefined)}
          className={buttonClass}
        >
          <Share2 className="size-4" aria-hidden="true" /> Share
        </button>
      )}
    </div>
  );
}
