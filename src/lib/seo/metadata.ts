import type { Metadata } from "next";
import { site } from "@/config/site";

/** RSS autodiscovery (`<link rel="alternate">`). */
export const FEED_ALTERNATE = {
  "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} — RSS` }],
};

/** Keeps a page out of search results while crawlers still follow its links. */
export const NOINDEX: Metadata["robots"] = { index: false, follow: true };

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path relative to `metadataBase` (canonical and `og:url`). */
  path: string;
  noindex?: boolean;
}

/**
 * Title, description, canonical URL, RSS link and social cards for a page.
 *
 * Next merges metadata shallowly: a page that sets `alternates` or `openGraph` replaces the
 * root layout's object, and a page that omits them inherits the home page's `og:url` and
 * `og:title`. Every page therefore restates the full set.
 */
export function pageMetadata({ title, description, path, noindex }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path, types: FEED_ALTERNATE },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.ogLocale,
      url: path,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    ...(noindex && { robots: NOINDEX }),
  };
}

/**
 * A keyword page that lists a single article duplicates that article's card: it stays
 * reachable for readers but out of search results and the sitemap until it grows.
 */
export const MIN_POSTS_TO_INDEX_TAG = 2;

export function isTagIndexable(postCount: number): boolean {
  return postCount >= MIN_POSTS_TO_INDEX_TAG;
}
