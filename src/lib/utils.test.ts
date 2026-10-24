import { parseFrontmatter } from "@/lib/content/frontmatter";
import { estimateReadingMinutes } from "@/lib/content/reading-time";
import { buildRssFeed, escapeXml } from "@/lib/seo/feed";
import { formatDate, formatReadingTime, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { normalize, searchEntries, type SearchEntry } from "@/lib/search/query";
import { serializeJsonLd } from "@/lib/seo/structured-data";
import { nextPreference, resolveTheme, themeInitScript } from "@/lib/theme";

describe("frontmatter", () => {
  it("splits YAML and body without converting dates", () => {
    const { data, body } = parseFrontmatter('---\ntitle: "Hi"\ndate: 2025-10-03\n---\n# Body');
    expect(data).toEqual({ title: "Hi", date: "2025-10-03" });
    expect(body).toBe("# Body");
  });

  it("rejects duplicate keys", () => {
    expect(() => parseFrontmatter("---\na: 1\na: 2\n---\n")).toThrow();
  });

  it("document without frontmatter", () => {
    expect(parseFrontmatter("text")).toEqual({ data: {}, body: "text" });
  });
});

describe("reading time", () => {
  it("counts prose and code separately", () => {
    expect(estimateReadingMinutes("word ".repeat(440))).toBe(2);
    const code = "```bash\n" + "echo hi\n".repeat(80) + "```";
    expect(estimateReadingMinutes(code)).toBe(2);
    expect(estimateReadingMinutes("")).toBe(1);
  });
});

describe("formatting", () => {
  it("ISO dates do not shift with the time zone (bug in the previous version)", () => {
    expect(formatDate("2025-10-03")).toBe("October 3, 2025");
    expect(formatShortDate("2026-02-01")).toBe("Feb 1, 2026");
    expect(formatReadingTime(7)).toBe("7 min read");
  });

  it("cn ignores falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("search", () => {
  const entries: SearchEntry[] = [
    {
      kind: "post",
      title: "Learning Kubernetes",
      description: "Pods and Services",
      href: "/blog/k8s",
      keywords: ["kubernetes"],
    },
    {
      kind: "post",
      title: "Coherent DWDM",
      description: "Optical transmission",
      href: "/blog/dwdm",
      keywords: ["optics"],
    },
    {
      kind: "tag",
      title: "#homelab",
      description: "2 articles",
      href: "/tags/homelab",
      keywords: ["homelab"],
    },
  ];

  it("on a tie, articles come before tags", () => {
    const tied: SearchEntry[] = [
      {
        kind: "tag",
        title: "#kubernetes",
        description: "1 article",
        href: "/tags/kubernetes",
        keywords: ["kubernetes"],
      },
      {
        kind: "post",
        title: "Learning Kubernetes",
        description: "Pods",
        href: "/blog/k8s",
        keywords: ["kubernetes"],
      },
    ];
    expect(searchEntries(tied, "kubernetes")[0]?.href).toBe("/blog/k8s");
  });

  it("normalizes accents and case", () => {
    expect(normalize("Café ÇÃO")).toBe("cafe cao");
  });

  it("requires every term and ranks the title first", () => {
    expect(searchEntries(entries, "optical").map((e) => e.href)).toEqual(["/blog/dwdm"]);
    expect(searchEntries(entries, "kubernetes pods")[0]?.href).toBe("/blog/k8s");
    expect(searchEntries(entries, "kubernetes missing")).toHaveLength(0);
    expect(searchEntries(entries, "  ")).toHaveLength(3);
  });
});

describe("theme", () => {
  it("resolves preferences and cycles through them", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
    expect(nextPreference("system")).toBe("light");
    expect(nextPreference("dark")).toBe("system");
  });

  it("the init script applies the theme before first paint", () => {
    const documentElement = { dataset: {} as Record<string, string> };
    const sandbox = {
      localStorage: { getItem: () => "dark" },
      window: { matchMedia: () => ({ matches: false }) },
      document: { documentElement },
    };
    new Function("localStorage", "window", "document", themeInitScript)(
      sandbox.localStorage,
      sandbox.window,
      sandbox.document,
    );
    expect(documentElement.dataset).toEqual({ theme: "dark", themePreference: "dark" });
  });
});

describe("RSS and JSON-LD", () => {
  it("escapes XML", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;",
    );
  });

  it("generates a valid feed", () => {
    const xml = buildRssFeed({
      title: "Blog",
      description: "D",
      language: "en-US",
      siteUrl: "https://ex.com",
      feedUrl: "https://ex.com/feed.xml",
      items: [
        {
          title: "A & B",
          description: "x",
          url: "https://ex.com/blog/a",
          date: "2026-01-02",
          tags: ["t"],
        },
      ],
    });
    expect(xml).toContain("<title>A &amp; B</title>");
    expect(xml).toContain("<pubDate>Fri, 02 Jan 2026 12:00:00 GMT</pubDate>");
    expect(xml).toContain("<category>t</category>");
    expect(xml).toContain("<language>en-US</language>");
  });

  it("JSON-LD cannot close the <script> tag", () => {
    expect(serializeJsonLd({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
