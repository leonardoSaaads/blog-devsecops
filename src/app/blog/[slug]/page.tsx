import "katex/dist/katex.min.css";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, FlaskConical, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiteThis } from "@/components/blog/cite-this";
import { Comments } from "@/components/blog/comments";
import { PostCard } from "@/components/blog/post-card";
import { ReferenceList } from "@/components/blog/reference-list";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { TagBadge } from "@/components/blog/tag-badge";
import { JsonLd } from "@/components/json-ld";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import { renderMdx } from "@/lib/content/mdx";
import { getAdjacentPosts, getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/content/posts";
import { formatDate } from "@/lib/format";
import { absoluteUrl, site } from "@/lib/site";
import { blogPostingJsonLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.author.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { Content, toc } = await renderMdx(post.body);
  const { newer, older } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <div
        className="reading-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600"
        aria-hidden="true"
      />

      <article className="container-page pt-10">
        <header className="mx-auto max-w-3xl xl:mx-0 xl:max-w-none">
          <nav aria-label="Trilha de navegação" className="mb-6 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="truncate text-foreground">
                {post.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{post.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>
              por <strong className="font-medium text-foreground">{site.author.name}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
            {post.updated && (
              <span className="inline-flex items-center gap-1.5" data-testid="updated-date">
                <RefreshCw className="size-4" aria-hidden="true" />
                atualizado em <time dateTime={post.updated}>{formatDate(post.updated)}</time>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" /> {post.readingMinutes} min de leitura
            </span>
          </div>

          {post.labs.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-accent-soft/40 px-4 py-3 text-sm">
              <FlaskConical className="size-4 text-accent" aria-hidden="true" />
              <span className="font-medium">Laboratórios neste artigo:</span>
              <span className="text-muted-foreground">{post.labs.join(" · ")}</span>
            </div>
          )}
        </header>

        <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="mx-auto w-full max-w-3xl min-w-0 xl:mx-0">
            <TableOfContents items={toc} />
            <div
              className="article prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:underline-offset-4 prose-img:rounded-xl"
              data-testid="post-content"
            >
              <Content components={getMdxComponents(post.references)} />
            </div>

            <ReferenceList references={post.references} />
            <CiteThis
              author={site.author.citationName}
              title={post.title}
              year={Number(post.date.slice(0, 4))}
              url={url}
            />

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Gostou? Compartilhe com quem está começando.
              </p>
              <ShareButtons title={post.title} url={url} />
            </div>

            <nav aria-label="Artigos adjacentes" className="mt-10 grid gap-4 sm:grid-cols-2">
              {older ? (
                <Link
                  href={`/blog/${older.slug}`}
                  className="group rounded-xl border border-border p-4 transition hover:border-accent"
                  rel="prev"
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" aria-hidden="true" /> Anterior
                  </span>
                  <span className="mt-1 block font-medium group-hover:text-accent-strong">
                    {older.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="group rounded-xl border border-border p-4 text-right transition hover:border-accent"
                  rel="next"
                >
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    Próximo <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="mt-1 block font-medium group-hover:text-accent-strong">
                    {newer.title}
                  </span>
                </Link>
              )}
            </nav>

            <Comments />
          </div>

          <aside className="hidden xl:block" aria-label="Navegação do artigo">
            <TableOfContents items={toc} variant="aside" />
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="relacionados">
          <h2 id="relacionados" className="mb-6 text-2xl font-bold tracking-tight">
            Continue lendo
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <PostCard post={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
