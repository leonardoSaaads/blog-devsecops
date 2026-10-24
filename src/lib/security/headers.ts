/**
 * Security HTTP headers applied to every route.
 *
 * About `script-src 'unsafe-inline'`: the site is 100% static (SSG). A nonce-based CSP
 * would require per-request rendering, defeating CDN caching. The risk is mitigated by
 * trusted content (versioned MDX), no third-party HTML and strict directives for
 * everything else.
 */

type Directives = Record<string, readonly string[]>;

export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

export const GISCUS_ORIGIN = "https://giscus.app";

export function serializeCsp(directives: Directives): string {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" ").trim())
    .join("; ");
}

export function buildContentSecurityPolicy({ isDev }: { isDev: boolean }): string {
  return serializeCsp({
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "media-src": ["'self'"],
    "connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
    "frame-src": [GISCUS_ORIGIN],
    // No page uses Web Workers: least privilege.
    "worker-src": ["'none'"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  });
}

export function buildSecurityHeaders({ isDev }: { isDev: boolean }): HeaderRule[] {
  const common = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy({ isDev }) },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), fullscreen=(self)",
    },
  ];

  return [{ source: "/:path*", headers: common }];
}
