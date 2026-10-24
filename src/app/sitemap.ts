import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import { absoluteUrl } from "@/config/site";
import { isTagIndexable } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const lastModified = posts[0]?.updated ?? posts[0]?.date;

  const pages: MetadataRoute.Sitemap = ["/", "/blog", "/projects", "/tags", "/about"].map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.7,
    }),
  );

  return [
    ...pages,
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated ?? post.date,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // Thin keyword pages are `noindex` (see isTagIndexable) and stay out of the sitemap.
    ...getAllTags()
      .filter(({ count }) => isTagIndexable(count))
      .map(({ tag }) => ({
        url: absoluteUrl(`/tags/${tag}`),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];
}
