import { CATEGORIES } from "@/lib/content/categories";
import { getAllPosts, getPostBySlug } from "@/lib/content/posts";
import { formatDate } from "@/lib/format";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Capa do artigo";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-static";

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
  if (!post)
    return renderOgImage({
      eyebrow: "Artigo",
      title: "Artigo",
      art: { motif: "circuit", seed: slug },
    });
  return renderOgImage({
    eyebrow: CATEGORIES[post.category].label,
    title: post.title,
    footer: formatDate(post.updated ?? post.date),
    art: { motif: post.art, seed: post.slug },
  });
}
