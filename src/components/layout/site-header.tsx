import Link from "next/link";
import { buildSearchIndex } from "@/lib/search/build-index";
import { mainNav, site } from "@/config/site";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/** Monogram: a stylized sine wave over "LS" — telecom meets engineering. */
function Monogram() {
  return (
    <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
      <rect width="40" height="40" rx="10" className="fill-foreground" />
      <path
        d="M6 24c3.5 0 3.5-8 7-8s3.5 8 7 8 3.5-8 7-8 3.5 8 7 8"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="stroke-accent"
      />
      <text
        x="20"
        y="15.5"
        textAnchor="middle"
        className="fill-background font-serif"
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.5"
      >
        LS
      </text>
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-page relative flex h-16 items-center gap-4">
        {/* The accessible name comes from the visible text (WCAG 2.5.3): "Leonardo Saads — home". */}
        <Link href="/" className="group flex items-center gap-3">
          <Monogram />
          <span className="sr-only sm:hidden">{site.name}</span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-serif text-lg font-semibold tracking-tight">
              {site.name}
            </span>
            <span
              aria-hidden="true"
              className="smallcaps block text-[0.7rem] text-muted-foreground"
            >
              {site.tagline}
            </span>
          </span>
          <span className="sr-only"> — home</span>
        </Link>

        <nav aria-label="Main navigation" className="ml-6 hidden md:block">
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
