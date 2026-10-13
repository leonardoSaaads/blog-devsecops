import { CircleAlert, Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

const VARIANTS = {
  info: {
    icon: Info,
    label: "Nota",
    className: "border-accent/40 bg-accent-soft/40",
    iconClass: "text-accent",
  },
  tip: {
    icon: Lightbulb,
    label: "Dica",
    className: "border-success/40 bg-success/5",
    iconClass: "text-success",
  },
  warning: {
    icon: TriangleAlert,
    label: "Atenção",
    className: "border-warning/50 bg-warning/5",
    iconClass: "text-warning",
  },
  danger: {
    icon: OctagonAlert,
    label: "Perigo",
    className: "border-danger/50 bg-danger/5",
    iconClass: "text-danger",
  },
  security: {
    icon: CircleAlert,
    label: "Segurança",
    className: "border-danger/50 bg-danger/5",
    iconClass: "text-danger",
  },
} as const;

export type CalloutType = keyof typeof VARIANTS;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const variant = VARIANTS[type];
  const Icon = variant.icon;
  return (
    <aside
      className={cn(
        "not-prose my-6 flex gap-3 rounded-xl border p-4 text-[0.95rem] leading-relaxed",
        variant.className,
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", variant.iconClass)} aria-hidden="true" />
      <div className="min-w-0 space-y-2 [&_a]:text-accent-strong [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]">
        <p className="font-semibold">{title ?? variant.label}</p>
        {children}
      </div>
    </aside>
  );
}
