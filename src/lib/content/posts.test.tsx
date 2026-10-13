import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import { renderMdx } from "./mdx";
import { POSTS_DIRECTORY, getAdjacentPosts, getAllPosts, getAllTags, getPostBySlug, getRelatedPosts, parsePostFile } from "./posts";

const files = fs.readdirSync(POSTS_DIRECTORY).filter((file) => file.endsWith(".mdx"));
const posts = files.map((file) => parsePostFile(file, fs.readFileSync(path.join(POSTS_DIRECTORY, file), "utf8")));

/** Corpo sem blocos de código (exemplos de sintaxe não contam como citações). */
const withoutCode = (body: string) => body.replace(/```[\s\S]*?```/g, "");

describe("conteúdo dos artigos", () => {
  it("todos os artigos têm frontmatter válido e referências", () => {
    expect(posts.length).toBeGreaterThanOrEqual(8);
    for (const post of posts) {
      expect(post.references.length, post.slug).toBeGreaterThan(0);
      expect(post.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("toda citação <Cite> aponta para uma referência existente e toda referência é citada", () => {
    for (const post of posts) {
      const ids = new Set(post.references.map((ref) => ref.id));
      const cited = [...withoutCode(post.body).matchAll(/<Cite id="([^"]+)"/g)].flatMap((match) => match[1]!.split(",").map((id) => id.trim()));
      for (const id of cited) expect(ids.has(id), `${post.slug}: citação órfã ${id}`).toBe(true);
      for (const id of ids) expect(cited.includes(id), `${post.slug}: referência nunca citada ${id}`).toBe(true);
    }
  });

  it("imagens locais referenciadas existem em public/", () => {
    for (const post of posts) {
      for (const [, src] of post.body.matchAll(/src="(\/[^"]+)"/g)) {
        expect(fs.existsSync(path.join(process.cwd(), "public", src!)), `${post.slug}: ${src}`).toBe(true);
      }
    }
  });

  it("links internos para artigos apontam para slugs existentes", () => {
    const slugs = new Set(posts.map((post) => post.slug));
    for (const post of posts) {
      for (const [, slug] of post.body.matchAll(/\]\(\/blog\/([^)#]+)\)/g)) {
        expect(slugs.has(slug!), `${post.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it.each(posts.map((post) => [post.slug, post] as const))("compila e renderiza %s", async (_slug, post) => {
    const { Content, toc } = await renderMdx(post.body);
    const html = renderToStaticMarkup(<Content components={getMdxComponents(post.references)} />);
    expect(html.length).toBeGreaterThan(2000);
    expect(toc.length).toBeGreaterThan(1);
    expect(new Set(toc.map((item) => item.id)).size).toBe(toc.length);
    // Nenhum bloco de código deve cair em linguagem desconhecida sem realce
    expect(html).not.toContain("undefined");
  }, 60_000);
});

describe("consultas de artigos", () => {
  it("ordena do mais recente para o mais antigo", () => {
    const dates = getAllPosts().map((post) => post.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("busca por slug apenas na lista carregada (sem path traversal)", () => {
    expect(getPostBySlug("../../package")).toBeUndefined();
    expect(getPostBySlug("comandos-linux")?.title).toContain("Linux");
  });

  it("agrega tags e relaciona artigos", () => {
    const tags = getAllTags();
    expect(tags.find((tag) => tag.tag === "devops")?.count).toBeGreaterThan(2);
    const related = getRelatedPosts("cloudflared-tunnel-tutorail");
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((post) => post.slug === "cloudflared-tunnel-tutorail")).toBe(false);
  });

  it("calcula artigos adjacentes", () => {
    const all = getAllPosts();
    const middle = all[2]!;
    const { newer, older } = getAdjacentPosts(middle.slug);
    expect(newer?.slug).toBe(all[1]!.slug);
    expect(older?.slug).toBe(all[3]!.slug);
  });

  it("rejeita frontmatter inválido com mensagem útil", () => {
    expect(() => parsePostFile("x.mdx", "---\ntitle: 'Oi'\n---\ncorpo")).toThrow(/Frontmatter inválido em content\/posts\/x\.mdx/);
    expect(() => parsePostFile("Slug Inválido.mdx", "---\n---\n")).toThrow(/Slug inválido/);
  });
});
