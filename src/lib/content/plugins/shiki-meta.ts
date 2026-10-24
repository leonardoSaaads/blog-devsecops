import type { ShikiTransformer } from "shiki";

/** Extracts `title="file.yml"` from the code block meta string. */
export function parseCodeMeta(meta: string): { title?: string } {
  const title = /title="([^"]+)"/.exec(meta)?.[1];
  return title ? { title } : {};
}

/** Exposes language and title as `data-*` attributes on the `<pre>`. */
export const codeMetaTransformer: ShikiTransformer = {
  name: "blog:code-meta",
  pre(node) {
    node.properties["data-language"] = this.options.lang;
    const meta = this.options.meta as { title?: string } | undefined;
    if (meta?.title) node.properties["data-title"] = meta.title;
  },
};
