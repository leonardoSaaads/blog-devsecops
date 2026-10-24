import Link from "next/link";
import { cn } from "@/lib/utils";

export function TagBadge({
  tag,
  linked = true,
  className,
}: {
  tag: string;
  linked?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground",
    linked && "transition hover:border-accent hover:text-foreground",
    className,
  );
  if (!linked) return <span className={classes}>#{tag}</span>;
  return (
    <Link href={`/tags/${tag}`} className={classes}>
      #{tag}
    </Link>
  );
}
