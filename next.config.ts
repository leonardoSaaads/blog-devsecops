import type { NextConfig } from "next";
import { buildRedirects } from "./src/lib/hosting/redirects";
import { DEVICE_SIZES, IMAGE_SIZES } from "./src/lib/images/variants.mts";
import { buildSecurityHeaders } from "./src/lib/security/headers";

const isDev = process.env.NODE_ENV === "development";

/**
 * Static export (`out/`), served by Cloudflare as Workers Static Assets.
 * There is no Node server in production: headers and redirects are delivered by
 * the `_headers` and `_redirects` files, generated at build time from the same
 * sources used below (see `src/app/%5Fheaders` and `src/app/%5Fredirects`).
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // Without a server there is no optimizer (`/_next/image`): the loader points `srcset`
    // at WebP variants generated at build time by `scripts/optimize-images.mts`.
    loader: "custom",
    loaderFile: "./src/lib/images/loader.ts",
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
  },
  // `headers`/`redirects` do not exist in a static export; under `next dev` they keep
  // parity with production (CSP included) to catch violations early.
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
