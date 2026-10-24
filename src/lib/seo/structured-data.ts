import { CATEGORIES } from "@/lib/content/categories";
import type { PostMeta } from "@/lib/content/posts";
import { referenceToPlainText } from "@/lib/content/references";
import { absoluteUrl, site } from "@/config/site";

/** Serializes JSON-LD escaping `<` so it cannot break out of the `<script>` (XSS). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const CONTEXT = "https://schema.org";
const PERSON_ID = absoluteUrl("/about#person");
const WEBSITE_ID = absoluteUrl("/#website");

/** The author, referenced by `@id` from every other node. */
export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.author.name,
    url: absoluteUrl("/about"),
    image: absoluteUrl("/profile-image.jpg"),
    jobTitle: "Telecommunications Engineer",
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Federal University of Rio Grande do Norte (UFRN)",
    },
    knowsAbout: ["DWDM", "Optical transport networks", "Linux", "DevOps", "Observability"],
    sameAs: [site.author.github, site.author.linkedin],
  };
}

const authorRef = { "@id": PERSON_ID };

/** Home page: the site and its author. */
export function websiteJsonLd() {
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: site.name,
        alternateName: site.title,
        url: absoluteUrl("/"),
        description: site.description,
        inLanguage: site.locale,
        author: authorRef,
        publisher: authorRef,
      },
      personJsonLd(),
    ],
  };
}

/** About page: a profile page whose main entity is the author. */
export function profilePageJsonLd() {
  return {
    "@context": CONTEXT,
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    inLanguage: site.locale,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: personJsonLd(),
  };
}

/** Breadcrumb trail; the last item is the current page. */
export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingJsonLd(post: PostMeta) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": CONTEXT,
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
    timeRequired: `PT${post.readingMinutes}M`,
    isAccessibleForFree: true,
    isPartOf: { "@id": WEBSITE_ID },
    author: personJsonLd(),
    publisher: authorRef,
    citation: post.references.map((ref) => ({
      "@type": "CreativeWork",
      name: referenceToPlainText(ref),
      ...(ref.url ? { url: ref.url } : {}),
    })),
  };
}
