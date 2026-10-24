import { absoluteUrl, site } from "@/config/site";

export const dynamic = "force-static";

/** RFC 9116 asks for an expiry under a year; every deploy renews it. */
const VALIDITY_DAYS = 180;

export function GET() {
  const expires = new Date(Date.now() + VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  const text = [
    `Contact: ${site.repository}/security/advisories/new`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, "Z")}`,
    "Preferred-Languages: en, pt",
    `Policy: ${site.repository}/blob/main/SECURITY.md`,
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
