/**
 * Cloudflare configuration files (Workers Static Assets) generated at build time.
 *
 * A static export has no server to apply Next's `headers()`/`redirects()` or the headers
 * returned by routes. Cloudflare reads `_headers` and `_redirects` from the root of the
 * assets directory (they are not served publicly).
 */
import { ART_CACHE_CONTROL } from "@/lib/art/url";
import { FEED_HEADERS } from "@/lib/seo/feed";
import { VARIANTS_DIR } from "@/lib/images/variants.mts";
import { buildSecurityHeaders, type HeaderRule } from "@/lib/security/headers";
import { buildRedirects, type RedirectRule } from "./redirects";

/** Platform limits: the build fails instead of publishing rules that would be ignored. */
export const CLOUDFLARE_LIMITS = {
  headerRules: 100,
  redirectRules: 2000,
  lineLength: 2000,
} as const;

const IMMUTABLE = "public, max-age=31536000, immutable";
const OG_IMAGE = [{ key: "Content-Type", value: "image/png" }];

/** Type and cache headers for files whose headers the static export does not keep. */
export function buildAssetHeaders(): HeaderRule[] {
  return [
    // Content-hashed names: they can be cached forever.
    { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: IMMUTABLE }] },
    { source: "/art/:path*", headers: [{ key: "Cache-Control", value: ART_CACHE_CONTROL }] },
    // Image variants: no hash in the name, but they rarely change (revalidated via ETag).
    {
      source: `/${VARIANTS_DIR}/:path*`,
      headers: [{ key: "Cache-Control", value: ART_CACHE_CONTROL }],
    },
    {
      source: "/feed.xml",
      headers: Object.entries(FEED_HEADERS).map(([key, value]) => ({ key, value })),
    },
    // Open Graph images are exported without an extension (the type would not be inferred).
    { source: "/opengraph-image", headers: OG_IMAGE },
    { source: "/blog/:slug/opengraph-image", headers: OG_IMAGE },
  ];
}

/** Converts a Next route pattern (`/:path*`) to Cloudflare syntax (`/*`). */
export function toCloudflarePath(source: string): string {
  const path = source.replace(/\/:\w+\*$/, "/*");
  if (!path.startsWith("/") || /[()+?\s]|\*(?!$)|:\w+\*/.test(path)) {
    throw new Error(`Route pattern with no Cloudflare equivalent: ${source}`);
  }
  return path;
}

function assertSafe(value: string, context: string): void {
  // Line breaks would allow injecting rules into the file.
  if (/[\r\n]/.test(value)) throw new Error(`Line break not allowed in ${context}`);
}

function assertLimits(lines: readonly string[], rules: number, maxRules: number, file: string) {
  if (rules > maxRules) throw new Error(`${file}: ${rules} rules exceed the limit of ${maxRules}`);
  const long = lines.find((line) => line.length > CLOUDFLARE_LIMITS.lineLength);
  if (long) throw new Error(`${file}: line exceeds ${CLOUDFLARE_LIMITS.lineLength} characters`);
}

/**
 * In Next, a later rule overrides a header with the same name; on Cloudflare the values
 * would be joined with a comma (two CSPs = the intersection of both policies).
 * `! Name` detaches the inherited value before setting the new one.
 */
export function serializeHeadersFile(rules: readonly HeaderRule[]): string {
  const defined = new Set<string>();
  const blocks = rules.map(({ source, headers }) => {
    const lines = headers.flatMap(({ key, value }) => {
      assertSafe(`${key}: ${value}`, `header for ${source}`);
      return defined.has(key.toLowerCase())
        ? [`! ${key}`, `${key}: ${value}`]
        : [`${key}: ${value}`];
    });
    headers.forEach(({ key }) => defined.add(key.toLowerCase()));
    return [toCloudflarePath(source), ...lines.map((line) => `  ${line}`)];
  });
  assertLimits(blocks.flat(), rules.length, CLOUDFLARE_LIMITS.headerRules, "_headers");
  return `${blocks.map((block) => block.join("\n")).join("\n\n")}\n`;
}

export function serializeRedirectsFile(rules: readonly RedirectRule[]): string {
  const lines = rules.map(({ source, destination }) => {
    if (!source.startsWith("/") || /\s/.test(source) || /\s/.test(destination)) {
      throw new Error(`Invalid redirect: ${source} -> ${destination}`);
    }
    return `${source} ${destination} 308`;
  });
  assertLimits(lines, rules.length, CLOUDFLARE_LIMITS.redirectRules, "_redirects");
  return `${lines.join("\n")}\n`;
}

/** `_headers` content: security (same source as `next dev`) + asset type/cache. */
export function cloudflareHeadersFile(): string {
  return serializeHeadersFile([...buildSecurityHeaders({ isDev: false }), ...buildAssetHeaders()]);
}

/** `_redirects` content: legacy links and old uppercase tags. */
export function cloudflareRedirectsFile(tags: readonly string[]): string {
  return serializeRedirectsFile(buildRedirects(tags));
}
