/**
 * Cabeçalhos HTTP de segurança aplicados a todas as rotas.
 *
 * Observação sobre `script-src 'unsafe-inline'`: o site é 100% estático (SSG).
 * CSP baseada em nonce exigiria renderização dinâmica por requisição, anulando
 * cache em CDN. Mitigamos o risco com conteúdo confiável (MDX versionado),
 * ausência de HTML de terceiros e diretivas restritivas para todo o resto.
 */

type Directives = Record<string, readonly string[]>;

export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

export const PYODIDE_CDN = "https://cdn.jsdelivr.net";
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
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  });
}

/**
 * Workers de execução de código possuem CSP própria (entregue com o script).
 * - JS: pode avaliar o código digitado, mas não tem acesso à rede.
 * - Python: precisa baixar o runtime Pyodide (WASM) de uma única origem fixa.
 */
export const WORKER_CSP = {
  javascript: serializeCsp({
    "default-src": ["'none'"],
    "script-src": ["'unsafe-eval'"],
  }),
  python: serializeCsp({
    "default-src": ["'none'"],
    "script-src": [PYODIDE_CDN, "'unsafe-eval'", "'wasm-unsafe-eval'"],
    "connect-src": [PYODIDE_CDN],
  }),
} as const;

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

  return [
    { source: "/:path*", headers: common },
    // Regras posteriores sobrescrevem a CSP global para os workers.
    {
      source: "/workers/js-runner.js",
      headers: [{ key: "Content-Security-Policy", value: WORKER_CSP.javascript }],
    },
    {
      source: "/workers/py-runner.mjs",
      headers: [{ key: "Content-Security-Policy", value: WORKER_CSP.python }],
    },
  ];
}
