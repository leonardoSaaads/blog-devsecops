import { ArrowRight, Clock, FlaskConical } from "lucide-react";
import Link from "next/link";
import type { PostMeta } from "@/lib/content/posts";
import { cn, formatShortDate } from "@/lib/format";
import { TagBadge } from "./tag-badge";

export type PostCardData = Pick<
  PostMeta,
  "slug" | "title" | "description" | "date" | "tags" | "readingMinutes" | "labs" | "updated"
>;

export function PostCard({ post, featured = false }: { post: PostCardData; featured?: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-cyan-500/5",
        featured && "sm:p-7",
      )}
      data-testid="post-card"
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <time dateTime={post.date}>{formatShortDate(post.date)}</time>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden="true" />
          {post.readingMinutes} min
        </span>
        {post.labs.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-foreground">
            <FlaskConical className="size-3.5 text-accent" aria-hidden="true" />
            {post.labs.length} {post.labs.length === 1 ? "laboratório" : "laboratórios"}
          </span>
        )}
      </div>

      <h3
        className={cn(
          "font-semibold tracking-tight text-balance",
          featured ? "text-2xl" : "text-lg",
        )}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0 after:rounded-2xl"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>

      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        {post.tags.slice(0, 3).map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
        <ArrowRight
          className="ml-auto size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
