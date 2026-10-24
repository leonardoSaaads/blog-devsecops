"use client";

import { MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { site } from "@/config/site";

// Giscus code is only downloaded when the comments section approaches the viewport.
const Giscus = dynamic(() => import("@giscus/react"), { ssr: false });

/**
 * Comments via Giscus (GitHub Discussions). The iframe only loads when the section
 * approaches the viewport — no third-party script on the initial page load.
 */
export function Comments() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} aria-labelledby="comments" className="mt-16 border-t border-border pt-10">
      <h2
        id="comments"
        className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight"
      >
        <MessageSquare className="size-5 text-accent" aria-hidden="true" /> Comments
      </h2>
      {visible ? (
        <Giscus
          repo={site.giscus.repo}
          repoId={site.giscus.repoId}
          category={site.giscus.category}
          categoryId={site.giscus.categoryId}
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme === "dark" ? "dark_dimmed" : "light"}
          lang="en"
          loading="lazy"
        />
      ) : (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      )}
    </section>
  );
}
