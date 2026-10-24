"use client";

import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Link2,
  ShieldAlert,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FS_ROOT,
  ancestors,
  findFsNode,
  joinPath,
  type FsNode,
} from "@/lib/simulations/filesystem";
import { InteractiveFigure } from "./interactive-figure";

function TreeNode({
  node,
  path,
  depth,
  selected,
  expanded,
  onSelect,
}: {
  node: FsNode;
  path: string;
  depth: number;
  selected: string;
  expanded: Set<string>;
  onSelect: (path: string) => void;
}) {
  const isOpen = expanded.has(path);
  const hasChildren = Boolean(node.children?.length);
  const Icon = node.link
    ? Link2
    : hasChildren
      ? isOpen
        ? FolderOpen
        : Folder
      : node.virtual
        ? Sparkles
        : depth > 1
          ? File
          : Folder;
  return (
    <li>
      <button
        type="button"
        aria-current={selected === path ? "true" : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        onClick={() => onSelect(path)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left font-mono text-[13px] transition",
          selected === path
            ? "bg-accent-soft text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        style={{ paddingLeft: `${0.4 + depth * 0.9}rem` }}
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition",
            hasChildren ? "" : "invisible",
            isOpen && "rotate-90",
          )}
          aria-hidden="true"
        />
        <Icon
          className={cn("size-4 shrink-0", node.virtual ? "text-signal" : "text-accent")}
          aria-hidden="true"
        />
        <span className="truncate">{depth === 0 ? "/" : node.name}</span>
        {node.link && (
          <span className="truncate text-xs text-muted-foreground">→ /{node.link}</span>
        )}
      </button>
      {hasChildren && isOpen && (
        <ul>
          {node.children!.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              path={joinPath(path, child.name)}
              depth={depth + 1}
              selected={selected}
              expanded={expanded}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FilesystemExplorer() {
  const [selected, setSelected] = useState("/etc");
  const [expanded, setExpanded] = useState(() => new Set(["/", "/etc"]));
  const node = findFsNode(selected) ?? FS_ROOT;

  const onSelect = (path: string) => {
    setSelected(path);
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path) && path === selected) next.delete(path);
      else ancestors(path).forEach((item) => next.add(item));
      return next;
    });
  };

  return (
    <InteractiveFigure
      title="The Linux directory hierarchy (FHS)"
      description="Browse the tree: every directory has a defined purpose. Amber items are virtual filesystems the kernel generates in memory."
      testId="filesystem-explorer"
    >
      <div className="grid gap-5 md:grid-cols-[16rem_minmax(0,1fr)]">
        <nav
          aria-label="Directory tree"
          className="max-h-96 overflow-y-auto rounded-xl border border-border bg-background p-2"
        >
          <ul>
            <TreeNode
              node={FS_ROOT}
              path="/"
              depth={0}
              selected={selected}
              expanded={expanded}
              onSelect={onSelect}
            />
          </ul>
        </nav>

        <div className="space-y-4" aria-live="polite">
          <nav aria-label="Path" className="flex flex-wrap items-center gap-1 font-mono text-sm">
            {ancestors(selected).map((path, index, all) => (
              <span key={path} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(path)}
                  className={cn(
                    "rounded px-1 hover:bg-muted",
                    index === all.length - 1 && "font-semibold text-accent-strong",
                  )}
                >
                  {index === 0 ? "/" : path.split("/").pop()}
                </button>
                {index > 0 && index < all.length - 1 && (
                  <span className="text-muted-foreground">/</span>
                )}
              </span>
            ))}
          </nav>
          <div>
            <p className="font-mono text-2xl font-semibold" data-testid="fs-path">
              {selected}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {node.virtual && (
                <span className="rounded-full bg-signal-soft px-2 py-0.5 text-foreground">
                  virtual (in memory)
                </span>
              )}
              {node.link && (
                <span className="rounded-full bg-muted px-2 py-0.5">
                  symbolic link → /{node.link}
                </span>
              )}
              {node.children && (
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {node.children.length} items
                </span>
              )}
            </div>
          </div>
          <p className="font-serif text-[1.05rem] leading-relaxed">{node.summary}</p>
          {node.security && (
            <p className="flex gap-2 rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
              <span>{node.security}</span>
            </p>
          )}
          {node.command && (
            <div className="rounded-lg bg-code p-3 font-mono text-xs">
              <p className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <Terminal className="size-3.5" aria-hidden="true" /> try it
              </p>
              <code>$ {node.command}</code>
            </div>
          )}
        </div>
      </div>
    </InteractiveFigure>
  );
}
