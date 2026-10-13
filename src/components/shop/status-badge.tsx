import { cn } from "@/lib/format";
import type { ProductStatus } from "@/lib/shop/schema";

const STYLES: Record<ProductStatus, string> = {
  available: "border-success/50 bg-success/10 text-success",
  "made-to-order": "border-accent/50 bg-accent-soft text-accent-strong",
  "coming-soon": "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status, label }: { status: ProductStatus; label: string }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", STYLES[status])}>
      {label}
    </span>
  );
}
