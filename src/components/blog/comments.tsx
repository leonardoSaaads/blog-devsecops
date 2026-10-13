"use client";

import Giscus from "@giscus/react";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { site } from "@/lib/site";

/**
 * Comentários via Giscus (GitHub Discussions). O iframe só é carregado quando a
 * seção se aproxima da área visível — nenhum script de terceiros no carregamento inicial.
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
    <section ref={ref} aria-labelledby="comentarios" className="mt-16 border-t border-border pt-10">
      <h2
        id="comentarios"
        className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight"
      >
        <MessageSquare className="size-5 text-accent" aria-hidden="true" /> Comentários
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
          lang="pt"
          loading="lazy"
        />
      ) : (
        <p className="text-sm text-muted-foreground">Carregando comentários…</p>
      )}
    </section>
  );
}
