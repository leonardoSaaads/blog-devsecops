import "server-only";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import type { SearchEntry } from "@/lib/search";
import { getAllProducts } from "@/lib/shop/products";

const PAGES: SearchEntry[] = [
  {
    kind: "page",
    title: "Blog",
    description: "Todos os artigos",
    href: "/blog",
    keywords: ["artigos", "posts"],
  },
  {
    kind: "page",
    title: "Loja 3D",
    description: "Modelos 3D para impressão",
    href: "/shop",
    keywords: ["3d", "stl", "comprar", "impressao"],
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
    title: "Sobre",
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
    keywords: [...post.tags, ...post.labs],
  }));
  const products: SearchEntry[] = getAllProducts().map((product) => ({
    kind: "product",
    title: product.name,
    description: product.summary,
    href: `/shop/${product.slug}`,
    keywords: [product.category, ...product.tags],
  }));
  const tags: SearchEntry[] = getAllTags().map(({ tag, count }) => ({
    kind: "tag",
    title: `#${tag}`,
    description: `${count} ${count === 1 ? "artigo" : "artigos"}`,
    href: `/tags/${tag}`,
    keywords: [tag],
  }));
  return [...posts, ...products, ...PAGES, ...tags];
}
