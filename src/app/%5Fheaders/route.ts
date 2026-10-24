import { cloudflareHeadersFile } from "@/lib/hosting/cloudflare";

// Exportado como `out/_headers` (a pasta `%5F` produz o segmento `_headers`).
export const dynamic = "force-static";

export function GET() {
  return new Response(cloudflareHeadersFile(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
