import "server-only";
import { CATEGORIES, CATEGORY_IDS } from "@/lib/content/categories";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import type { SearchEntry } from "@/lib/search/query";

const PAGES: SearchEntry[] = [
  {
    kind: "page",
    title: "Artigos",
    description: "Todos os artigos",
    href: "/blog",
    keywords: ["artigos", "posts"],
  },
  {
    kind: "page",
    title: "Tópicos",
    description: "Áreas de estudo e palavras-chave",
    href: "/tags",
    keywords: ["tags", "temas", "areas"],
  },
  {
    kind: "page",
    title: "Projetos",
    description: "Projetos open source",
    href: "/projects",
    keywords: ["github", "portfolio"],
  },
  {
    kind: "page",
    title: "Sobre o autor",
    description: "Quem escreve este blog",
    href: "/about",
    keywords: ["contato", "autor", "linkedin"],
  },
];

/** Índice enxuto enviado ao cliente para a paleta de comandos (Ctrl+K). */
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
    description: `${count} ${count === 1 ? "artigo" : "artigos"}`,
    href: `/tags/${tag}`,
    keywords: [tag],
  }));
  const areas: SearchEntry[] = CATEGORY_IDS.map((id) => ({
    kind: "page",
    title: `Área: ${CATEGORIES[id].label}`,
    description: CATEGORIES[id].description,
    href: `/blog?area=${id}`,
    keywords: [id],
  }));
  return [...posts, ...PAGES, ...areas, ...tags];
}
