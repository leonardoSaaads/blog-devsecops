import type { NextConfig } from "next";
import { buildRedirects } from "./src/lib/hosting/redirects";
import { buildSecurityHeaders } from "./src/lib/security/headers";

const isDev = process.env.NODE_ENV === "development";

/**
 * Exportação estática (`out/`), servida pela Cloudflare como Workers Static Assets.
 * Não há servidor Node em produção: cabeçalhos e redirecionamentos são entregues
 * pelos arquivos `_headers` e `_redirects`, gerados no build a partir das mesmas
 * fontes usadas abaixo (ver `src/app/%5Fheaders` e `src/app/%5Fredirects`).
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // Sem servidor não há otimizador de imagens (`/_next/image`): as imagens de
    // `public/` são servidas como estão, cacheadas na CDN.
    unoptimized: true,
  },
  // `headers`/`redirects` não existem na exportação estática; no `next dev` mantêm
  // paridade com a produção (CSP incluída) para detectar violações cedo.
  ...(isDev && {
    async headers() {
      return buildSecurityHeaders({ isDev });
    },
    async redirects() {
      return buildRedirects();
    },
  }),
};

export default nextConfig;
