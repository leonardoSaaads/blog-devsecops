import "server-only";
import { CATEGORIES, categoriesInUse } from "@/lib/content/categories";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import type { SearchEntry } from "@/lib/search/query";

const PAGES: SearchEntry[] = [
  {
    kind: "page",
    title: "Articles",
    description: "All articles",
    href: "/blog",
    keywords: ["articles", "posts", "blog"],
  },
  {
    kind: "page",
    title: "Topics",
    description: "Areas of study and keywords",
    href: "/tags",
    keywords: ["tags", "topics", "areas"],
  },
  {
    kind: "page",
    title: "Projects",
    description: "Open-source projects",
    href: "/projects",
    keywords: ["github", "portfolio"],
  },
  {
    kind: "page",
    title: "About the author",
    description: "Who writes this blog",
    href: "/about",
    keywords: ["contact", "author", "linkedin"],
  },
];

/** Lean index sent to the client for the command palette (Ctrl+K). */
export function buildSearchIndex(): SearchEntry[] {
  const posts: SearchEntry[] = getAllPosts().map((post) => ({
    kind: "post",
    title: post.title,
    description: post.description,
    href: `/blog/${post.slug}`,
    keywords: [...post.tags, CATEGORIES[post.category].label],
  }));
  const tags: SearchEntry[] = getAllTags().map(({ tag, count }) => ({
    kind: "tag",
    title: `#${tag}`,
    description: `${count} ${count === 1 ? "article" : "articles"}`,
    href: `/tags/${tag}`,
    keywords: [tag],
  }));
  const areas: SearchEntry[] = categoriesInUse(getAllPosts()).map((id) => ({
    kind: "page",
    title: `Area: ${CATEGORIES[id].label}`,
    description: CATEGORIES[id].description,
    href: `/blog?area=${id}`,
    keywords: [id],
  }));
  return [...posts, ...PAGES, ...areas, ...tags];
}
