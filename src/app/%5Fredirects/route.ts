import { getAllTags } from "@/lib/content/posts";
import { cloudflareRedirectsFile } from "@/lib/hosting/cloudflare";

// Exportado como `out/_redirects` (a pasta `%5F` produz o segmento `_redirects`).
export const dynamic = "force-static";

export function GET() {
  return new Response(cloudflareRedirectsFile(getAllTags().map(({ tag }) => tag)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
