/** Redirecionamentos permanentes (308) de URLs antigas para as atuais. */
export interface RedirectRule {
  source: string;
  destination: string;
  permanent: true;
}

/** Links que mudaram na reconstrução do blog. */
export const LEGACY_REDIRECTS: readonly RedirectRule[] = [
  // Post "Hello World" substituído pelo artigo de bastidores do novo blog.
  { source: "/blog/hello-world", destination: "/blog/bastidores-do-blog", permanent: true },
];

/**
 * O blog antigo publicava tags em caixa alta (ex.: /tags/DEVOPS). Sem servidor,
 * a normalização vira uma regra explícita por tag atual.
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
