import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getAllTags } from "@/lib/content/posts";

export const metadata: Metadata = {
  title: "Tags",
  description: "Navegue pelos artigos por tema.",
  alternates: { canonical: "/tags" },
};

export default function TagsPage() {
  const tags = getAllTags();
  const max = Math.max(...tags.map(({ count }) => count));

  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Temas"
        title="Tags"
        description={`${tags.length} temas abordados no blog.`}
      />
      <ul className="flex flex-wrap gap-3">
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
    </div>
  );
}
