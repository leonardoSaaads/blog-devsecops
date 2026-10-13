import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CoverArt } from "@/components/art/cover-art";
import { CATEGORIES } from "@/lib/content/categories";
import type { PostMeta } from "@/lib/content/posts";
import { cn, formatShortDate } from "@/lib/format";

export type PostCardData = Pick<
  PostMeta,
  | "slug"
  | "title"
  | "description"
  | "date"
  | "tags"
  | "readingMinutes"
  | "updated"
  | "category"
  | "art"
  | "figures"
>;

export function PostCard({
  post,
  variant = "default",
}: {
  post: PostCardData;
  variant?: "default" | "featured";
}) {
  const featured = variant === "featured";
  return (
    <article
      className={cn(
        "group relative flex h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-slate-900/10",
        featured ? "flex-col lg:flex-row" : "flex-col",
      )}
      data-testid="post-card"
    >
      <div
        className={cn(
          "relative overflow-hidden bg-plate",
          featured ? "aspect-[16/9] lg:aspect-auto lg:w-[56%]" : "aspect-[16/9]",
        )}
      >
        <CoverArt
          motif={post.art}
          seed={post.slug}
          decorative
          className="transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="smallcaps absolute left-4 top-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[0.7rem] text-white backdrop-blur">
          {CATEGORIES[post.category].label}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col", featured ? "p-7 lg:p-9" : "p-5")}>
        <p className="text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatShortDate(post.date)}</time>
          <span aria-hidden="true"> · </span>
          {post.readingMinutes} min de leitura
          {post.figures > 0 && (
            <>
              <span aria-hidden="true"> · </span>
              {post.figures} {post.figures === 1 ? "figura interativa" : "figuras interativas"}
            </>
          )}
        </p>
        <h3
          className={cn(
            "mt-2 font-serif font-semibold leading-snug tracking-tight text-balance",
            featured ? "text-3xl lg:text-4xl" : "text-xl",
          )}
        >
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-3 font-serif text-muted-foreground",
            featured ? "text-lg leading-relaxed" : "line-clamp-3 text-[0.95rem]",
          )}
        >
          {post.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="truncate font-mono text-xs text-muted-foreground">
            {post.tags
              .slice(0, 3)
              .map((tag) => `#${tag}`)
              .join("  ")}
          </p>
          <ArrowUpRight
            className="size-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
