import { formatAuthorName, formatAuthors, formatIeeeDate, formatReference, referenceToPlainText } from "./references";
import { referenceSchema, type Reference } from "./schema";

const ref = (data: Partial<Reference> & Pick<Reference, "id" | "type" | "title" | "year">): Reference =>
  referenceSchema.parse({ authors: [], ...data });

describe("IEEE reference style", () => {
  it("formats access dates with IEEE month abbreviations", () => {
    expect(formatIeeeDate("2026-10-13")).toBe("Oct. 13, 2026");
    expect(formatIeeeDate("2026-05-01")).toBe("May 1, 2026");
    expect(formatIeeeDate("2026-09-30")).toBe("Sept. 30, 2026");
    expect(() => formatIeeeDate("2026-13-01")).toThrow();
  });

  it("formats people as initials + family name, organizations unchanged, and et al.", () => {
    expect(formatAuthorName("Knuth, Donald E.")).toBe("D. E. Knuth");
    expect(formatAuthorName("Böcherer, Georg")).toBe("G. Böcherer");
    expect(formatAuthorName("Hyun-Jin, Kim-Lee")).toBe("K.-L. Hyun-Jin");
    expect(formatAuthorName("International Telecommunication Union")).toBe("International Telecommunication Union");
    expect(formatAuthors(["Thomas, David", "Hunt, Andrew"])).toBe("D. Thomas and A. Hunt");
    expect(formatAuthors(["A, B", "C, D", "E, F"])).toBe("B. A, D. C, and F. E");
    expect(formatAuthors(["A, B", "C, D", "E, F", "G, H", "I, J", "K, L", "M, N"])).toBe("B. A et al.");
  });

  it("book with edition", () => {
    const text = referenceToPlainText(
      ref({ id: "a", type: "book", authors: ["Agrawal, Govind P."], title: "Fiber-Optic Communication Systems", edition: "5", place: "Hoboken, NJ, USA", publisher: "Wiley", year: 2021 }),
    );
    expect(text).toBe("G. P. Agrawal, Fiber-Optic Communication Systems, 5th ed. Hoboken, NJ, USA: Wiley, 2021.");
  });

  it("journal article with DOI and italic journal name", () => {
    const parts = formatReference(
      ref({ id: "k", type: "article", authors: ["Knuth, Donald E."], title: "Structured programming with go to statements", container: "ACM Computing Surveys", volume: "6", issue: "4", pages: "261-301", year: 1974, doi: "10.1145/356635.356640" }),
    );
    expect(parts.find((part) => part.emphasis)?.text).toBe("ACM Computing Surveys");
    expect(parts.find((part) => part.href)?.href).toBe("https://doi.org/10.1145/356635.356640");
    expect(parts.map((part) => part.text).join("")).toBe(
      "D. E. Knuth, “Structured programming with go to statements,” ACM Computing Surveys, vol. 6, no. 4, pp. 261–301, 1974, doi: 10.1145/356635.356640.",
    );
  });

  it("web page with access date and URL", () => {
    const text = referenceToPlainText(
      ref({ id: "w", type: "web", authors: ["Docker Inc."], title: "Compose file reference", container: "Docker Docs", year: 2026, url: "https://docs.docker.com/reference/compose-file/", accessed: "2026-10-13" }),
    );
    expect(text).toBe(
      "Docker Inc., “Compose file reference,” Docker Docs, 2026. Accessed: Oct. 13, 2026. [Online]. Available: https://docs.docker.com/reference/compose-file/",
    );
  });

  it("standard without a place lists only publisher and year", () => {
    const text = referenceToPlainText(ref({ id: "s", type: "standard", authors: ["IETF"], title: "RFC 3414", year: 2002, publisher: "IETF" }));
    expect(text).toBe("IETF, RFC 3414. IETF, 2002.");
  });

  it("appends the note as a sentence", () => {
    const text = referenceToPlainText(ref({ id: "n", type: "standard", title: "ITU-T G.709", year: 2020, note: "As amended" }));
    expect(text).toBe("ITU-T G.709. 2020. As amended.");
  });

  it("the schema rejects non-HTTPS URLs and malformed DOIs", () => {
    expect(() => ref({ id: "x", type: "web", title: "X", year: 2020, url: "http://insecure.example" })).toThrow();
    expect(() => ref({ id: "x", type: "web", title: "X", year: 2020, doi: "abc" })).toThrow();
  });
});
