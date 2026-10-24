export type SearchKind = "post" | "page" | "tag";

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  keywords: string[];
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Local search: every term must appear in some field.
 * Scoring: title (3) > keywords (2) > description (1); a title prefix adds a bonus.
 */
const KIND_PRIORITY: Record<SearchKind, number> = { post: 0, page: 1, tag: 2 };

export function searchEntries(entries: readonly SearchEntry[], query: string, limit = 8) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return entries.slice(0, limit);

  return (
    entries
      .map((entry) => {
        const title = normalize(entry.title);
        const keywords = normalize(entry.keywords.join(" "));
        const description = normalize(entry.description);
        let score = 0;
        for (const term of terms) {
          const termScore =
            (title.includes(term) ? 3 : 0) +
            (keywords.includes(term) ? 2 : 0) +
            (description.includes(term) ? 1 : 0);
          if (termScore === 0) return { entry, score: 0 };
          score += termScore + (title.startsWith(term) ? 1 : 0);
        }
        return { entry, score };
      })
      .filter(({ score }) => score > 0)
      // Ties: articles before pages and tags ("linux" should open the article, not the tag).
      .sort(
        (a, b) =>
          b.score - a.score ||
          KIND_PRIORITY[a.entry.kind] - KIND_PRIORITY[b.entry.kind] ||
          a.entry.title.localeCompare(b.entry.title),
      )
      .slice(0, limit)
      .map(({ entry }) => entry)
  );
}
