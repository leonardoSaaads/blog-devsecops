import { referenceAnchor } from "@/components/blog/reference-list";
import { referenceToPlainText } from "@/lib/content/references";
import type { Reference } from "@/lib/content/schema";

/**
 * Creates the `<Cite id="..." />` component bound to the article's references.
 * Unknown IDs fail the build — no citation is left dangling.
 */
export function createCite(references: Reference[]) {
  const index = new Map(references.map((ref, position) => [ref.id, { ref, number: position + 1 }]));

  return function Cite({ id, page }: { id: string; page?: string }) {
    const ids = id.split(",").map((value) => value.trim());
    const entries = ids.map((refId) => {
      const entry = index.get(refId);
      if (!entry)
        throw new Error(`<Cite id="${refId}"> does not match any reference in this article.`);
      return entry;
    });

    return (
      <sup className="ml-0.5 font-mono text-[0.75em]">
        [
        {entries.map(({ ref, number }, position) => (
          <span key={ref.id}>
            {position > 0 && ", "}
            <a
              href={`#${referenceAnchor(ref.id)}`}
              title={referenceToPlainText(ref)}
              aria-label={`Reference ${number}`}
              className="text-accent-strong no-underline hover:underline"
            >
              {number}
            </a>
          </span>
        ))}
        {page ? `, p. ${page}` : ""}]
      </sup>
    );
  };
}
