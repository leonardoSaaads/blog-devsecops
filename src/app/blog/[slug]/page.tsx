import "katex/dist/katex.min.css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverArt, artCaption } from "@/components/art/cover-art";
import { CiteThis } from "@/components/blog/cite-this";
import { Comments } from "@/components/blog/comments";
import { PostCard } from "@/components/blog/post-card";
import { ReferenceList } from "@/components/blog/reference-list";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { JsonLd } from "@/components/json-ld";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import { CATEGORIES } from "@/lib/content/categories";
import { renderMdx } from "@/lib/content/mdx";
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  type PostMeta,
} from "@/lib/content/posts";
import { cn, formatDate } from "@/lib/format";
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
      section: CATEGORIES[post.category].label,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

function AdjacentLink({ post, direction }: { post: PostMeta; direction: "prev" | "next" }) {
  const next = direction === "next";
  return (
    <Link
      href={`/blog/${post.slug}`}
      rel={direction}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition hover:border-accent hover:shadow-md",
        next && "flex-row-reverse text-right",
      )}
    >
      <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-plate">
        <CoverArt motif={post.art} seed={post.slug} decorative />
      </span>
      <span className="min-w-0">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {next ? (
            <>
              Próximo <ArrowRight className="size-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Anterior
            </>
          )}
        </span>
        <span className="mt-0.5 line-clamp-2 block font-serif font-semibold leading-snug group-hover:text-accent-strong">
          {post.title}
        </span>
      </span>
    </Link>
  );
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { Content, toc } = await renderMdx(post.body);
  const { newer, older } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const category = CATEGORIES[post.category];

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <div
        className="reading-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-gradient-to-r from-accent to-signal"
        aria-hidden="true"
      />

      <article>
        <header
          className="relative isolate overflow-hidden bg-plate text-slate-100"
          data-testid="post-hero"
        >
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <CoverArt motif={post.art} seed={post.slug} decorative className="art-reveal" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050812]/95 via-[#050812]/80 to-[#050812]/30" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050812]/90 to-transparent" />
          </div>
          <div className="container-page pb-32 pt-8 lg:pt-12">
            <nav aria-label="Trilha de navegação" className="text-sm text-slate-400">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-white">
                    Início
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Artigos
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="page"
                  className="max-w-[16rem] truncate text-slate-200 sm:max-w-md"
                >
                  {post.title}
                </li>
              </ol>
            </nav>

            <p className="smallcaps mt-12 text-sm font-semibold tracking-[0.14em] text-sky-300">
              <Link href={`/blog?area=${post.category}`} className="hover:text-white">
                {category.label}
              </Link>
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 max-w-3xl font-serif text-xl leading-relaxed text-slate-300">
              {post.description}
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm">
              <Image
                src="/profile-image.jpg"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border border-white/30 object-cover"
              />
              <p className="leading-tight">
                <span className="block font-semibold text-white">{site.author.name}</span>
                <span className="text-slate-400">
                  <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes}{" "}
                  min de leitura
                </span>
              </p>
            </div>
            <p className="mt-10 text-right text-xs text-slate-400">
              Capa — {artCaption(post.art, post.slug)}
            </p>
          </div>
        </header>

        <div className="container-page relative -mt-20">
          <section
            aria-labelledby="resumo"
            className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-slate-900/15 sm:p-10"
            data-testid="abstract"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
              <div>
                <h2 id="resumo" className="smallcaps text-sm font-semibold text-accent-strong">
                  Resumo
                </h2>
                <p className="mt-3 font-serif text-lg leading-relaxed text-pretty hyphens-auto">
                  {post.abstract}
                </p>
                <p className="mt-5 text-sm leading-relaxed">
                  <span className="font-semibold">Palavras-chave: </span>
                  {post.tags.map((tag, index) => (
                    <span key={tag}>
                      <Link
                        href={`/tags/${tag}`}
                        className="text-accent-strong underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                      >
                        {tag}
                      </Link>
                      {index < post.tags.length - 1 ? "; " : "."}
                    </span>
                  ))}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 text-sm lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div>
                  <dt className="smallcaps text-xs text-muted-foreground">Autor</dt>
                  <dd className="mt-0.5 font-medium">{site.author.name}</dd>
                  <dd className="text-muted-foreground">UFRN</dd>
                </div>
                <div>
                  <dt className="smallcaps text-xs text-muted-foreground">Publicado em</dt>
                  <dd className="mt-0.5">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </dd>
                </div>
                {post.updated && (
                  <div data-testid="updated-date">
                    <dt className="smallcaps text-xs text-muted-foreground">Revisado em</dt>
                    <dd className="mt-0.5">
                      <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="smallcaps text-xs text-muted-foreground">Conteúdo</dt>
                  <dd className="mt-0.5">
                    {post.figures > 0
                      ? `${post.figures} ${post.figures === 1 ? "figura interativa" : "figuras interativas"}`
                      : "Texto"}
                  </dd>
                  <dd className="text-muted-foreground">{post.references.length} referências</dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="pontos-chave" className="mx-auto mt-8 max-w-5xl">
            <h2 id="pontos-chave" className="smallcaps text-sm font-semibold text-muted-foreground">
              Pontos-chave
            </h2>
            <ol
              className={cn(
                "mt-3 grid gap-4 sm:grid-cols-2",
                post.keyPoints.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
              )}
              data-testid="key-points"
            >
              {post.keyPoints.map((point, index) => (
                <li
                  key={point}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur"
                >
                  <span
                    className="font-serif text-3xl font-semibold text-signal tabular-nums"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-[0.95rem] leading-relaxed">{point}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mx-auto mt-16 w-full max-w-[84rem] px-4 sm:px-6 xl:grid xl:grid-cols-[12rem_minmax(0,42rem)_17rem] xl:gap-x-10">
          <aside className="hidden xl:block" aria-label="Navegação do artigo">
            <TableOfContents items={toc} variant="aside" />
          </aside>

          <div className="mx-auto w-full min-w-0 max-w-[42rem] xl:mx-0">
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
              <p className="font-serif text-muted-foreground">
                Gostou? Compartilhe com quem está estudando o tema.
              </p>
              <ShareButtons title={post.title} url={url} />
            </div>

            <nav aria-label="Artigos adjacentes" className="mt-10 grid gap-4 sm:grid-cols-2">
              {older ? <AdjacentLink post={older} direction="prev" /> : <span />}
              {newer && <AdjacentLink post={newer} direction="next" />}
            </nav>

            <Comments />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-page mt-24" aria-labelledby="relacionados">
          <h2 id="relacionados" className="mb-8 font-serif text-3xl font-semibold tracking-tight">
            Continue lendo
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
