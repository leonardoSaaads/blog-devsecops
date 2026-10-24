import type { Route } from "next";

const DEFAULT_SITE_URL = "https://saatustech.com.br";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const site = {
  name: "Leonardo Saads",
  title: "Leonardo Saads — Engineering, Telecommunications and Software",
  tagline: "Engineering · Telecommunications · Software",
  description:
    "Interactive technical essays on optical networks, infrastructure, security and software — with hands-on figures, worked examples and cited sources.",
  url: resolveSiteUrl(),
  /** BCP 47 language tag (HTML, JSON-LD, RSS, Intl). */
  locale: "en-US",
  /** Open Graph locale format. */
  ogLocale: "en_US",
  author: {
    name: "Leonardo Saads Pinto",
    /** "Family, Given" form, used to build IEEE citations ("L. S. Pinto"). */
    citationName: "Pinto, Leonardo Saads",
    shortName: "Leonardo Saads",
    role: "Telecommunications Engineer · DevOps · Observability",
    affiliation: "UFRN",
    email: "leonardospinto@hotmail.com",
    github: "https://github.com/leonardoSaaads",
    linkedin: "https://www.linkedin.com/in/leonardo-saads-pinto-5a61731b4/",
  },
  repository: "https://github.com/leonardoSaaads/blog-devsecops",
  giscus: {
    repo: "leonardoSaaads/blog-devsecops",
    repoId: "R_kgDOP7RkyQ",
    category: "General",
    categoryId: "DIC_kwDOP7Rkyc4CwLqY",
  },
} as const;

export interface NavItem {
  label: string;
  href: Route;
}

export const mainNav: NavItem[] = [
  { label: "Articles", href: "/blog" },
  { label: "Topics", href: "/tags" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}
