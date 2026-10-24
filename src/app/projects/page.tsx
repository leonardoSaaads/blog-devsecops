import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CoverArt } from "@/components/art/cover-art";
import { GithubIcon } from "@/components/icons/brand-icons";
import { PageHeader } from "@/components/ui/page-header";
import { projectArtwork } from "@/lib/art/catalog";
import { PROJECTS } from "@/lib/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source infrastructure, observability and automation projects.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="container-page py-14">
      <PageHeader
        eyebrow="Open source"
        title="Projects"
        description="Tools and stacks used — and documented — day to day."
      />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <li
            key={project.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-accent hover:shadow-xl"
          >
            <div className="aspect-[16/7] bg-plate">
              <CoverArt {...projectArtwork(project.name, project.art)} />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-mono text-lg font-semibold">{project.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{project.description}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                {project.stack.map((item) => (
                  <li key={item} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent-strong hover:underline"
                  >
                    <GithubIcon className="size-4" /> Code{" "}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                )}
                {project.article && (
                  <Link
                    href={`/blog/${project.article}`}
                    className="inline-flex items-center gap-1.5 text-accent-strong hover:underline"
                  >
                    <BookOpen className="size-4" aria-hidden="true" /> Article
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
