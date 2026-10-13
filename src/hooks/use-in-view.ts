"use client";

import { useEffect, useState, type RefObject } from "react";

/** Indica se o elemento está visível e a aba está ativa — usado para pausar simulações. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "100px"): boolean {
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return inView && pageVisible;
}
