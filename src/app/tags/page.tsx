import type { Metadata } from "next";
import Link from "next/link";
import { CoverArt } from "@/components/art/cover-art";
import { areaArtwork } from "@/lib/art/catalog";
import { PageHeader } from "@/components/ui/page-header";
import { CATEGORIES, categoriesInUse } from "@/lib/content/categories";
import { getAllPosts, getAllTags } from "@/lib/content/posts";

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Areas of study and article keywords: telecommunications, infrastructure, security and software.",
  alternates: { canonical: "/tags" },
};

export default function TopicsPage() {
  const tags = getAllTags();
  const posts = getAllPosts();
  const areas = categoriesInUse(posts);
  const max = Math.max(...tags.map(({ count }) => count));

  return (
    <div className="container-page py-14">
      <PageHeader
        eyebrow="Index"
        title="Topics"
        description={`${areas.length} ${areas.length === 1 ? "area" : "areas"} of study and ${tags.length} keywords that run through the articles.`}
      />

      <section aria-labelledby="areas">
        <h2 id="areas" className="smallcaps text-sm font-semibold text-accent-strong">
          Areas
        </h2>
        <ul className="mt-4 grid gap-5 sm:grid-cols-2">
          {areas.map((id) => {
            const category = CATEGORIES[id];
            const items = posts.filter((post) => post.category === id);
            return (
              <li
                key={id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <Link
                  href={`/blog?area=${id}`}
                  className="group relative block h-32 overflow-hidden bg-plate"
                  aria-label={`See ${category.label} articles`}
                >
                  <CoverArt
                    {...areaArtwork(id)}
                    className="transition duration-700 group-hover:scale-105"
                  />
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-[#050812]/90 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute bottom-4 left-5 font-serif text-2xl font-semibold text-white">
                    {category.label}
                  </span>
                </Link>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {items.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-serif text-[1.02rem] text-accent-strong underline-offset-4 hover:underline"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="keywords" className="mt-16">
        <h2 id="keywords" className="smallcaps text-sm font-semibold text-accent-strong">
          Keywords
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/tags/${tag}`}
                className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition hover:border-accent"
                style={{ fontSize: `${0.9 + (count / max) * 0.35}rem` }}
              >
                <span className="font-mono group-hover:text-accent-strong">#{tag}</span>
                <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
                  {count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
