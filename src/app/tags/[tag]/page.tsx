import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { PageHeader } from "@/components/ui/page-header";
import { getAllTags, getPostsByTag } from "@/lib/content/posts";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  const normalized = decodeURIComponent(tag).toLowerCase();
  return {
    title: `#${normalized}`,
    description: `Articles about ${normalized}.`,
    alternates: { canonical: `/tags/${normalized}` },
  };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  // Old uppercase links (e.g., /tags/DEVOPS) are redirected by Cloudflare's
  // `_redirects` (see src/lib/hosting/redirects.ts).
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="container-page py-14">
      <Link
        href="/tags"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> All topics
      </Link>
      <PageHeader
        eyebrow="Keyword"
        title={`#${tag}`}
        description={`${posts.length} ${posts.length === 1 ? "article" : "articles"}.`}
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
