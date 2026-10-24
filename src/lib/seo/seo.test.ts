import { buildLlmsTxt } from "./llms";
import { FEED_ALTERNATE, NOINDEX, isTagIndexable, pageMetadata } from "./metadata";
import { breadcrumbJsonLd, personJsonLd, websiteJsonLd } from "./structured-data";

describe("page metadata", () => {
  it("restates canonical, RSS link and social cards with the page's own URL and title", () => {
    const metadata = pageMetadata({
      title: "About",
      description: "Who writes here.",
      path: "/about",
    });
    expect(metadata.alternates).toEqual({ canonical: "/about", types: FEED_ALTERNATE });
    expect(metadata.openGraph).toMatchObject({
      url: "/about",
      title: "About",
      siteName: "Leonardo Saads",
      locale: "en_US",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "About" });
    expect(metadata.robots).toBeUndefined();
  });

  it("noindex keeps links followable", () => {
    expect(
      pageMetadata({ title: "#x", description: "d", path: "/tags/x", noindex: true }).robots,
    ).toEqual(NOINDEX);
    expect(NOINDEX).toEqual({ index: false, follow: true });
  });

  it("indexes keyword pages only once they list more than one article", () => {
    expect(isTagIndexable(1)).toBe(false);
    expect(isTagIndexable(2)).toBe(true);
  });
});

describe("structured data", () => {
  it("breadcrumb positions start at 1 and use absolute URLs", () => {
    const list = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Articles", path: "/blog" },
    ]);
    expect(list.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(list.itemListElement[1]?.item).toMatch(/^https:\/\/.+\/blog$/);
  });

  it("the website node points to the author by @id", () => {
    const person = personJsonLd();
    expect(person.sameAs).toHaveLength(2);
    expect(websiteJsonLd()).toMatchObject({
      "@graph": [{ "@type": "WebSite", author: { "@id": person["@id"] } }, person],
    });
  });
});

describe("llms.txt", () => {
  it("renders the llmstxt.org layout and strips characters that break Markdown links", () => {
    const text = buildLlmsTxt({
      title: "Blog",
      summary: "Technical essays.",
      details: "Written by someone.",
      sections: [
        {
          heading: "Articles",
          links: [
            {
              title: "A [draft]\ntitle",
              url: "https://ex.com/a",
              description: "Line one\nline two",
            },
          ],
        },
      ],
    });
    expect(text).toBe(
      "# Blog\n\n> Technical essays.\n\nWritten by someone.\n\n## Articles\n\n- [A draft title](https://ex.com/a): Line one line two\n",
    );
  });
});
