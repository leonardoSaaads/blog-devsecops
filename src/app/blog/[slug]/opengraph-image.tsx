import { getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { formatDate } from "@/lib/format";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Capa do artigo";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return renderOgImage({
    eyebrow: post?.tags.slice(0, 3).join(" · ") ?? "Blog",
    title: post?.title ?? "Artigo",
    footer: post ? formatDate(post.updated ?? post.date) : undefined,
  });
}
