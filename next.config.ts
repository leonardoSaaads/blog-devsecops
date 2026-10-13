import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security/headers";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return buildSecurityHeaders({ isDev });
  },
  async redirects() {
    return [
      // Post "Hello World" substituído pelo artigo de bastidores do novo blog.
      { source: "/blog/hello-world", destination: "/blog/bastidores-do-blog", permanent: true },
    ];
  },
};

export default nextConfig;
