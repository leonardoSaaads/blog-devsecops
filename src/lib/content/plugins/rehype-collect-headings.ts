import type { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Collects h2/h3 headings (already given an `id` by rehype-slug) for the table of contents. */
export function rehypeCollectHeadings({ toc }: { toc: TocItem[] }) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = node.properties?.id;
      if (typeof id !== "string") return;
      toc.push({ id, text: toString(node).trim(), depth: node.tagName === "h2" ? 2 : 3 });
    });
  };
}
