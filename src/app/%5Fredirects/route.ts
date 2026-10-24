import { getAllTags } from "@/lib/content/posts";
import { cloudflareRedirectsFile } from "@/lib/hosting/cloudflare";

// Exported as `out/_redirects` (the `%5F` folder produces the `_redirects` segment).
export const dynamic = "force-static";

export function GET() {
  return new Response(cloudflareRedirectsFile(getAllTags().map(({ tag }) => tag)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
