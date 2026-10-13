import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter";
import { estimateReadingMinutes } from "./reading-time";
import { postFrontmatterSchema, type PostFrontmatter } from "./schema";

export const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");
const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export interface PostMeta extends Omit<PostFrontmatter, "draft"> {
  slug: string;
  readingMinutes: number;
}

export interface Post extends PostMeta {
  body: string;
}

export interface TagSummary {
  tag: string;
  count: number;
}

export function parsePostFile(fileName: string, source: string): Post & { draft: boolean } {
  const slug = fileName.replace(/\.mdx$/, "");
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Slug inválido em content/posts/${fileName}`);
  }
  const { data, body } = parseFrontmatter(source);
  const result = postFrontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Frontmatter inválido em content/posts/${fileName}:\n${issues}`);
  }
  return { ...result.data, slug, body, readingMinutes: estimateReadingMinutes(body) };
}

function loadPosts(): Post[] {
  const includeDrafts = process.env.NODE_ENV !== "production";
  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => parsePostFile(file, fs.readFileSync(path.join(POSTS_DIRECTORY, file), "utf8")))
    .filter((post) => includeDrafts || !post.draft)
    .map(({ draft: _draft, ...post }) => post)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

// Em produção o conteúdo é imutável durante o build; em dev relemos a cada chamada.
let cache: Post[] | undefined;
function posts(): Post[] {
  if (process.env.NODE_ENV !== "production") return loadPosts();
  cache ??= loadPosts();
  return cache;
}

function toMeta({ body: _body, ...meta }: Post): PostMeta {
  return meta;
}

export function getAllPosts(): PostMeta[] {
  return posts().map(toMeta);
}

/** Busca por slug a partir da lista carregada — nunca monta caminhos com entrada externa. */
export function getPostBySlug(slug: string): Post | undefined {
  return posts().find((post) => post.slug === slug);
}

export function getAllTags(): TagSummary[] {
  const counts = new Map<string, number>();
  for (const post of posts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getAdjacentPosts(slug: string): { newer?: PostMeta; older?: PostMeta } {
  const all = getAllPosts();
  const index = all.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return { newer: all[index - 1], older: all[index + 1] };
}

/** Artigos relacionados ordenados pelo número de tags em comum (desempate: mais recente). */
export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const current = getPostBySlug(slug);
  if (!current) return [];
  return getAllPosts()
    .filter((post) => post.slug !== slug)
    .map((post) => ({ post, score: post.tags.filter((tag) => current.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map(({ post }) => post);
}
