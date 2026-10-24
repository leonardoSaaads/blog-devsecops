import { cloudflareHeadersFile } from "@/lib/hosting/cloudflare";

// Exported as `out/_headers` (the `%5F` folder produces the `_headers` segment).
export const dynamic = "force-static";

export function GET() {
  return new Response(cloudflareHeadersFile(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
