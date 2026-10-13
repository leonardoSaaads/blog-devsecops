import { formatAbntDate, formatAuthorName, formatAuthors, formatReference, referenceToPlainText } from "./references";
import { referenceSchema, type Reference } from "./schema";

const ref = (data: Partial<Reference> & Pick<Reference, "id" | "type" | "title" | "year">): Reference =>
  referenceSchema.parse({ authors: [], ...data });

describe("formatação ABNT (NBR 6023:2018)", () => {
  it("formata datas de acesso", () => {
    expect(formatAbntDate("2026-10-13")).toBe("13 out. 2026");
    expect(formatAbntDate("2026-05-01")).toBe("1 maio 2026");
    expect(() => formatAbntDate("2026-13-01")).toThrow();
  });

  it("formata autores pessoais, entidades e et al.", () => {
    expect(formatAuthorName("Knuth, Donald E.")).toBe("KNUTH, Donald E.");
    expect(formatAuthorName("International Telecommunication Union")).toBe("INTERNATIONAL TELECOMMUNICATION UNION");
    expect(formatAuthors(["Thomas, David", "Hunt, Andrew"])).toBe("THOMAS, David; HUNT, Andrew");
    expect(formatAuthors(["A, B", "C, D", "E, F", "G, H"])).toBe("A, B et al.");
  });

  it("livro", () => {
    const text = referenceToPlainText(
      ref({ id: "a", type: "book", authors: ["Agrawal, Govind P."], title: "Fiber-Optic Communication Systems", edition: "5", place: "Hoboken", publisher: "Wiley", year: 2021 }),
    );
    expect(text).toBe("AGRAWAL, Govind P. Fiber-Optic Communication Systems. 5. ed. Hoboken: Wiley, 2021.");
  });

  it("artigo de periódico com DOI e destaque no periódico", () => {
    const parts = formatReference(
      ref({ id: "k", type: "article", authors: ["Knuth, Donald E."], title: "Structured programming with go to statements", container: "ACM Computing Surveys", volume: "6", issue: "4", pages: "261-301", year: 1974, doi: "10.1145/356635.356640" }),
    );
    expect(parts.find((part) => part.strong)?.text).toBe("ACM Computing Surveys");
    expect(parts.find((part) => part.href)?.href).toBe("https://doi.org/10.1145/356635.356640");
    expect(parts.map((part) => part.text).join("")).toContain("v. 6, n. 4, p. 261-301, 1974.");
  });

  it("página web com URL e data de acesso", () => {
    const text = referenceToPlainText(
      ref({ id: "w", type: "web", authors: ["Docker Inc."], title: "Compose file reference", container: "Docker Docs", year: 2026, url: "https://docs.docker.com/reference/compose-file/", accessed: "2026-10-13" }),
    );
    expect(text).toBe(
      "DOCKER INC. Compose file reference. Docker Docs, 2026. Disponível em: https://docs.docker.com/reference/compose-file/. Acesso em: 13 out. 2026.",
    );
  });

  it("evento e norma sem local recebem [S. l.]", () => {
    const text = referenceToPlainText(ref({ id: "s", type: "standard", authors: ["IETF"], title: "RFC 3414", year: 2002, publisher: "IETF" }));
    expect(text).toContain("[S. l.]: IETF, 2002.");
  });

  it("o esquema rejeita URLs não-HTTPS e DOIs malformados", () => {
    expect(() => ref({ id: "x", type: "web", title: "X", year: 2020, url: "http://inseguro.com" })).toThrow();
    expect(() => ref({ id: "x", type: "web", title: "X", year: 2020, doi: "abc" })).toThrow();
  });
});
