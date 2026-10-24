import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.author.name}: telecommunications engineering, DevOps and observability.`,
  alternates: { canonical: "/about" },
};

const SKILLS = [
  "Docker",
  "Kubernetes (k3s)",
  "Prometheus",
  "Grafana",
  "Zabbix",
  "Linux",
  "Python",
  "DWDM/OTN",
  "Signal processing",
  "Machine learning",
];

export default function AboutPage() {
  const links = [
    { label: "E-mail", href: `mailto:${site.author.email}`, icon: Mail },
    { label: "GitHub", href: site.author.github, icon: GithubIcon },
    { label: "LinkedIn", href: site.author.linkedin, icon: LinkedinIcon },
  ];

  return (
    <div className="container-page py-12">
      <div className="grid gap-12 md:grid-cols-[18rem_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="relative mx-auto size-48 overflow-hidden rounded-full border-4 border-accent/60 md:mx-0">
            <Image
              src="/profile-image.jpg"
              alt={`Photo of ${site.author.name}`}
              fill
              sizes="12rem"
              className="object-cover"
              preload
            />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">
            {site.author.name}
          </h1>
          <p className="mt-1 text-muted-foreground">{site.author.role}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Federal University of Rio Grande do Norte (UFRN), Brazil
          </p>
          <ul className="mt-5 flex gap-2">
            {links.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer me" }
                    : {})}
                  className="grid size-10 place-items-center rounded-xl border border-border transition hover:border-accent hover:text-accent"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="prose prose-lg max-w-none font-serif dark:prose-invert prose-headings:font-serif prose-headings:font-semibold">
          <h2>Who writes here</h2>
          <p>
            Leonardo Saads Pinto is a telecommunications engineer and research developer focused on
            observability systems, RF engineering and process automation.
          </p>
          <p>
            Current work includes nationwide spectrum-monitoring initiatives at ANATEL (Brazil’s
            telecommunications regulator), leading DevOps and NOC operations at MW Solutions, and
            applied machine-learning research for coherent optical systems.
          </p>
          <p>
            The technical toolkit spans Docker-based infrastructure, signal processing and
            end-to-end observability with Grafana, Zabbix and Prometheus. In spare time: debugging
            Python scripts and helping colleagues with differential equations.
          </p>
          <h2>About this blog</h2>
          <p>
            The articles follow the conventions of a technical publication — abstract, numbered
            figures and equations, margin notes and IEEE-style references — with one difference: the
            figures are interactive. You can simulate and tweak what you are reading without leaving
            the article. Start with the <Link href="/blog">articles</Link> or the{" "}
            <Link href="/tags">topics</Link>.
          </p>
          <h2>Skills</h2>
          <ul className="not-prose flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
