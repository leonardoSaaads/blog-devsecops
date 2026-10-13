import type { PostMeta } from "@/lib/content/posts";
import { referenceToPlainText } from "@/lib/content/references";
import type { Product } from "@/lib/shop/schema";
import { absoluteUrl, site } from "@/lib/site";

/** Serializa JSON-LD com escape de `<` para impedir quebra do `<script>` (XSS). */
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
    inLanguage: "pt-BR",
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    keywords: post.tags.join(", "),
    author: { "@type": "Person", name: site.author.name, url: site.author.linkedin },
    publisher: { "@type": "Person", name: site.author.name },
    citation: post.references.map((ref) => ({
      "@type": "CreativeWork",
      name: referenceToPlainText(ref),
      ...(ref.url ? { url: ref.url } : {}),
    })),
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    category: product.category,
    url: absoluteUrl(`/shop/${product.slug}`),
    ...(product.poster ? { image: absoluteUrl(product.poster) } : {}),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: (product.price.amount / 100).toFixed(2),
      priceCurrency: product.price.currency,
      availability:
        product.status === "available"
          ? "https://schema.org/InStock"
          : product.status === "made-to-order"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/shop/${product.slug}`),
    },
  };
}
