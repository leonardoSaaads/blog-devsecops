import { parse } from "yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export interface ParsedDocument {
  data: unknown;
  body: string;
}

/** Splits the leading YAML block (`---`) from the document body. */
export function parseFrontmatter(source: string): ParsedDocument {
  const match = FRONTMATTER.exec(source);
  if (!match) {
    return { data: {}, body: source };
  }
  // `yaml` (YAML 1.2) does not coerce dates implicitly: they stay ISO strings.
  const data: unknown = parse(match[1] ?? "", { strict: true, uniqueKeys: true }) ?? {};
  return { data, body: source.slice(match[0].length) };
}
