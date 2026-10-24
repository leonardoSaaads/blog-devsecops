import { getAllPosts } from "@/lib/content/posts";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { absoluteUrl, site } from "@/config/site";

export const dynamic = "force-static";

export function GET() {
  const text = buildLlmsTxt({
    title: site.title,
    summary: site.description,
    details: `Written by ${site.author.name} (${site.author.role}). Articles are in US English, cite their sources in IEEE style and are revised when the technology changes; each page states its publication and revision dates.`,
    sections: [
      {
        heading: "Articles",
        links: getAllPosts().map((post) => ({
          title: post.title,
          url: absoluteUrl(`/blog/${post.slug}`),
          description: post.description,
        })),
      },
      {
        heading: "Optional",
        links: [
          { title: "About the author", url: absoluteUrl("/about") },
          { title: "Projects", url: absoluteUrl("/projects") },
          { title: "RSS feed", url: absoluteUrl("/feed.xml") },
        ],
      },
    ],
  });
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
