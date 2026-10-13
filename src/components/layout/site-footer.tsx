import { Mail, Rss } from "lucide-react";
import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { mainNav, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const social = [
    { label: "GitHub", href: site.author.github, icon: GithubIcon },
    { label: "LinkedIn", href: site.author.linkedin, icon: LinkedinIcon },
    { label: "E-mail", href: `mailto:${site.author.email}`, icon: Mail },
    { label: "RSS", href: "/feed.xml", icon: Rss },
  ];

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="space-y-2">
          <p className="font-semibold">{site.name}</p>
          <p className="max-w-md text-sm text-muted-foreground">{site.description}</p>
          <p className="text-xs text-muted-foreground">
            © {year} {site.author.name}. Código sob licença MIT ·{" "}
            <a
              href={site.repository}
              className="underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              código-fonte
            </a>
          </p>
        </div>
        <div className="space-y-4">
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="flex gap-2">
            {social.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer me" }
                    : {})}
                  className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-accent hover:text-accent"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
