import type { Code, Root } from "mdast";
import type { MdxJsxAttribute, MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";

const LANGUAGE_ALIASES: Record<string, "javascript" | "python"> = {
  js: "javascript",
  javascript: "javascript",
  py: "python",
  python: "python",
};

function readTitle(meta: string): string | undefined {
  return /title="([^"]+)"/.exec(meta)?.[1];
}

/**
 * Converte blocos de código marcados com `runnable` em `<CodePlayground />`:
 *
 * ```python runnable title="Fibonacci"
 * print(1 + 1)
 * ```
 */
export function remarkRunnableCode() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (!parent || index === undefined || !node.meta || !/\brunnable\b/.test(node.meta)) return;
      const language = LANGUAGE_ALIASES[node.lang ?? ""];
      if (!language) return;

      const attributes: MdxJsxAttribute[] = [
        { type: "mdxJsxAttribute", name: "language", value: language },
        { type: "mdxJsxAttribute", name: "initialCode", value: node.value },
      ];
      const title = readTitle(node.meta);
      if (title) attributes.push({ type: "mdxJsxAttribute", name: "title", value: title });

      const element: MdxJsxFlowElement = {
        type: "mdxJsxFlowElement",
        name: "CodePlayground",
        attributes,
        children: [],
      };
      parent.children.splice(index, 1, element);
    });
  };
}
