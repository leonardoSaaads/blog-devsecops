import type { Metadata } from "next";
import { Suspense } from "react";
import { PostCard } from "@/components/blog/post-card";
import { PostExplorer } from "@/components/blog/post-explorer";
import { PageHeader } from "@/components/page-header";
import { getAllPosts, getAllTags } from "@/lib/content/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos sobre DevSecOps, observabilidade, Linux, Kubernetes e telecomunicações ópticas — com laboratórios interativos.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts().map(
    ({ slug, title, description, date, updated, tags, readingMinutes, labs }) => ({
      slug,
      title,
      description,
      date,
      updated,
      tags,
      readingMinutes,
      labs,
    }),
  );
  const tags = getAllTags().map(({ tag }) => tag);

  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Blog"
        title="Artigos"
        description={`${posts.length} artigos com referências bibliográficas e laboratórios que rodam no navegador.`}
      />
      {/* Fallback estático (sem JS ou antes da hidratação): lista completa. */}
      <Suspense
        fallback={
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
