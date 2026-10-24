import {
  Activity,
  BookOpen,
  Box,
  Cable,
  Cpu,
  Eye,
  FolderTree,
  Gauge,
  Layers,
  Lock,
  Network,
  Radio,
  RadioTower,
  Server,
  ShieldCheck,
  Terminal,
  Waves,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Icons allowed in articles (closed list: nothing is resolved dynamically). */
const ICONS = {
  activity: Activity,
  book: BookOpen,
  box: Box,
  cable: Cable,
  cpu: Cpu,
  eye: Eye,
  folder: FolderTree,
  gauge: Gauge,
  layers: Layers,
  lock: Lock,
  network: Network,
  radio: Radio,
  tower: RadioTower,
  server: Server,
  shield: ShieldCheck,
  terminal: Terminal,
  waves: Waves,
  zap: Zap,
} as const;

export type CardIcon = keyof typeof ICONS;

const TONES = {
  accent: "text-accent bg-accent-soft",
  signal: "text-signal bg-signal-soft",
  success: "text-success bg-success/10",
  danger: "text-danger bg-danger/10",
} as const;

export function CardGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div
      className={cn("not-prose my-8 grid gap-4 sm:grid-cols-2", cols === 3 && "lg:grid-cols-3")}
      data-testid="card-grid"
    >
      {children}
    </div>
  );
}

export function Card({
  title,
  icon,
  tone = "accent",
  children,
}: {
  title: string;
  icon?: CardIcon;
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  const Icon = icon ? ICONS[icon] : undefined;
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-signal to-transparent opacity-70"
        aria-hidden="true"
      />
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONES[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h4 className="font-serif text-lg font-semibold leading-snug">{title}</h4>
          <div className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_p+p]:mt-2 [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
