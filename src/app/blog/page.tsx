import type { Metadata } from "next";
import { Suspense } from "react";
import { PostCard, type PostCardData } from "@/components/blog/post-card";
import { PostExplorer } from "@/components/blog/post-explorer";
import { PageHeader } from "@/components/page-header";
import { getAllPosts, getAllTags } from "@/lib/content/posts";

export const metadata: Metadata = {
  title: "Artigos",
  description:
    "Ensaios técnicos sobre telecomunicações, infraestrutura, segurança e software — com figuras interativas e referências.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts: PostCardData[] = getAllPosts().map(
    ({
      slug,
      title,
      description,
      date,
      updated,
      tags,
      readingMinutes,
      category,
      art,
      figures,
    }) => ({
      slug,
      title,
      description,
      date,
      updated,
      tags,
      readingMinutes,
      category,
      art,
      figures,
    }),
  );
  const tags = getAllTags().map(({ tag }) => tag);

  return (
    <div className="container-page py-14">
      <PageHeader
        eyebrow="Arquivo"
        title="Artigos"
        description={`${posts.length} ensaios revisados, com figuras interativas no texto e referências bibliográficas.`}
      />
      {/* Fallback estático (sem JS ou antes da hidratação): lista completa. */}
      <Suspense
        fallback={
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        }
      >
        <PostExplorer posts={posts} tags={tags} />
      </Suspense>
    </div>
  );
}
