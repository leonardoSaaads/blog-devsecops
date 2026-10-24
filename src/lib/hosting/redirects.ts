/** Permanent (308) redirects from old URLs to current ones. */
export interface RedirectRule {
  source: string;
  destination: string;
  permanent: true;
}

const rule = (source: string, destination: string): RedirectRule => ({
  source,
  destination,
  permanent: true,
});

/** Links that changed when the blog was rebuilt or translated. */
export const LEGACY_REDIRECTS: readonly RedirectRule[] = [
  // Portuguese slugs and tags from before the English translation (October 2026).
  rule("/blog/comandos-linux", "/blog/linux-fundamentals"),
  rule("/blog/dwdm_intoduction", "/blog/dwdm-introduction"),
  rule("/tags/seguranca", "/tags/security"),
  rule("/tags/optica", "/tags/optics"),
  rule("/tags/telecomunicacoes", "/tags/telecommunications"),
];

/**
 * The old blog published uppercase tags (e.g., /tags/DEVOPS). Without a server, the
 * normalization becomes one explicit rule per current tag.
 */
export function legacyTagRedirects(tags: readonly string[]): RedirectRule[] {
  return tags
    .filter((tag) => tag !== tag.toUpperCase())
    .map((tag) => ({
      source: `/tags/${tag.toUpperCase()}`,
      destination: `/tags/${tag}`,
      permanent: true as const,
    }));
}

export function buildRedirects(tags: readonly string[] = []): RedirectRule[] {
  return [...LEGACY_REDIRECTS, ...legacyTagRedirects(tags)];
}
