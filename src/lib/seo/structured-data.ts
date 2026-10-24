import { CATEGORIES } from "@/lib/content/categories";
import type { PostMeta } from "@/lib/content/posts";
import { referenceToPlainText } from "@/lib/content/references";
import { absoluteUrl, site } from "@/config/site";

/** Serializes JSON-LD escaping `<` so it cannot break out of the `<script>` (XSS). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function blogPostingJsonLd(post: PostMeta) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: site.locale,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    keywords: post.tags.join(", "),
    abstract: post.abstract,
    articleSection: CATEGORIES[post.category].label,
    author: { "@type": "Person", name: site.author.name, url: site.author.linkedin },
    publisher: { "@type": "Person", name: site.author.name },
    citation: post.references.map((ref) => ({
      "@type": "CreativeWork",
      name: referenceToPlainText(ref),
      ...(ref.url ? { url: ref.url } : {}),
    })),
  };
}
