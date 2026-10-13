import Link from "next/link";
import { buildSearchIndex } from "@/lib/search-index";
import { mainNav, site } from "@/lib/site";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container-page relative flex h-16 items-center gap-3">
        <Link
          href="/"
          className="group mr-2 flex items-center gap-2.5"
          aria-label={`${site.name} — início`}
        >
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 font-mono text-sm font-bold text-white shadow-sm transition group-hover:rotate-6">
            LS
          </span>
          <span className="hidden font-semibold tracking-tight sm:inline">{site.name}</span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <NavLinks items={mainNav} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <CommandPalette entries={buildSearchIndex()} />
          <ThemeToggle />
          <MobileNav items={mainNav} />
        </div>
      </div>
    </header>
  );
}
