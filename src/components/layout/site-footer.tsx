import { Mail, Rss } from "lucide-react";
import Link from "next/link";
import { CoverArt } from "@/components/art/cover-art";
import { SITE_ARTWORKS } from "@/lib/art/catalog";
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
    <footer className="relative mt-28 overflow-hidden border-t border-border text-slate-200">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <CoverArt {...SITE_ARTWORKS.footer} className="opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b16]/90 via-[#070b16]/80 to-[#070b16]" />
      </div>
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <p className="font-serif text-2xl font-semibold text-white">{site.name}</p>
          <p className="smallcaps text-sm text-cyan-200/90">{site.tagline}</p>
          <p className="max-w-md font-serif text-[0.95rem] leading-relaxed text-slate-300">
            {site.description}
          </p>
          <p className="pt-2 text-xs text-slate-400">
            Composto em Source Serif 4 e Geist. Ilustrações geradas por código a partir de cada
            tema.
          </p>
        </div>
        <div className="space-y-6">
          <nav aria-label="Rodapé">
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
                  >
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
                  className="grid size-10 place-items-center rounded-xl border border-white/15 text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400">
            © {year} {site.author.name}. Código sob licença MIT ·{" "}
            <a
              href={site.repository}
              className="underline underline-offset-4 hover:text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              código-fonte
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
