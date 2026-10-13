"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import type { NavItem } from "@/lib/site";

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({
  items,
  orientation = "horizontal",
  onNavigate,
}: {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul
      className={cn("flex", orientation === "vertical" ? "flex-col gap-1" : "items-center gap-1")}
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-accent-soft text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                orientation === "vertical" && "text-base",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
