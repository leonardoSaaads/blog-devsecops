import { getAllPosts } from "@/lib/content/posts";
import { buildRssFeed, FEED_HEADERS } from "@/lib/feed";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const xml = buildRssFeed({
    title: site.title,
    description: site.description,
    siteUrl: site.url,
    feedUrl: absoluteUrl("/feed.xml"),
    items: getAllPosts().map((post) => ({
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/blog/${post.slug}`),
      date: post.updated ?? post.date,
      tags: post.tags,
    })),
  });
  return new Response(xml, { headers: FEED_HEADERS });
}
