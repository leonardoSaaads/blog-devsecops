import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import { renderMdx } from "./mdx";
import { POSTS_DIRECTORY, getAdjacentPosts, getAllPosts, getAllTags, getPostBySlug, getRelatedPosts, parsePostFile } from "./posts";

const files = fs.readdirSync(POSTS_DIRECTORY).filter((file) => file.endsWith(".mdx"));
const posts = files.map((file) => parsePostFile(file, fs.readFileSync(path.join(POSTS_DIRECTORY, file), "utf8")));

/** Body without code blocks (syntax examples do not count as citations). */
const withoutCode = (body: string) => body.replace(/```[\s\S]*?```/g, "");

describe("article content", () => {
  it("every article has valid frontmatter and references", () => {
    expect(posts.length).toBeGreaterThanOrEqual(2);
    for (const post of posts) {
      expect(post.references.length, post.slug).toBeGreaterThan(0);
      expect(post.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("every <Cite> points to an existing reference and every reference is cited", () => {
    for (const post of posts) {
      const ids = new Set(post.references.map((ref) => ref.id));
      const cited = [...withoutCode(post.body).matchAll(/<Cite id="([^"]+)"/g)].flatMap((match) => match[1]!.split(",").map((id) => id.trim()));
      for (const id of cited) expect(ids.has(id), `${post.slug}: orphan citation ${id}`).toBe(true);
      for (const id of ids) expect(cited.includes(id), `${post.slug}: reference never cited ${id}`).toBe(true);
    }
  });

  it("referenced local images exist in public/", () => {
    for (const post of posts) {
      for (const [, src] of post.body.matchAll(/src="(\/[^"]+)"/g)) {
        expect(fs.existsSync(path.join(process.cwd(), "public", src!)), `${post.slug}: ${src}`).toBe(true);
      }
    }
  });

  it("internal article links point to existing slugs", () => {
    const slugs = new Set(posts.map((post) => post.slug));
    for (const post of posts) {
      for (const [, slug] of post.body.matchAll(/\]\(\/blog\/([^)#]+)\)/g)) {
        expect(slugs.has(slug!), `${post.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it.each(posts.map((post) => [post.slug, post] as const))("compiles and renders %s", async (_slug, post) => {
    const { Content, toc } = await renderMdx(post.body);
    const html = renderToStaticMarkup(<Content components={getMdxComponents(post.references)} />);
    expect(html.length).toBeGreaterThan(2000);
    expect(toc.length).toBeGreaterThan(1);
    expect(new Set(toc.map((item) => item.id)).size).toBe(toc.length);
    // No code block may fall back to an unknown language without highlighting
    expect(html).not.toContain("undefined");
  }, 60_000);
});

describe("article queries", () => {
  it("sorts from newest to oldest", () => {
    const dates = getAllPosts().map((post) => post.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("looks up slugs only in the loaded list (no path traversal)", () => {
    expect(getPostBySlug("../../package")).toBeUndefined();
    expect(getPostBySlug("linux-fundamentals")?.title).toContain("Linux");
    expect(getPostBySlug("dwdm-introduction")?.title).toContain("DWDM");
  });

  it("aggregates tags and relates articles", () => {
    const tags = getAllTags();
    expect(tags.find((tag) => tag.tag === "linux")?.count).toBeGreaterThanOrEqual(1);
    const current = getPostBySlug("linux-fundamentals")!;
    for (const post of getRelatedPosts(current.slug)) {
      expect(post.slug).not.toBe(current.slug);
      expect(post.tags.some((tag) => current.tags.includes(tag))).toBe(true);
    }
  });

  it("computes adjacent articles", () => {
    const all = getAllPosts();
    expect(getAdjacentPosts(all[0]!.slug)).toMatchObject({ newer: undefined, older: all[1] });
    expect(getAdjacentPosts(all[1]!.slug).newer?.slug).toBe(all[0]!.slug);
  });

  it("rejects invalid frontmatter with a helpful message", () => {
    expect(() => parsePostFile("x.mdx", "---\ntitle: 'Hi'\n---\nbody")).toThrow(/Invalid frontmatter in content\/posts\/x\.mdx/);
    expect(() => parsePostFile("Invalid Slug.mdx", "---\n---\n")).toThrow(/Invalid slug/);
  });
});
