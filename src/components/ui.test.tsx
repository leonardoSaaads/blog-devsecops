// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { filterPosts, PostExplorer } from "@/components/blog/post-explorer";
import type { PostCardData } from "@/components/blog/post-card";
import { CommandPalette } from "@/components/layout/command-palette";
import { advanceSequence, EasterEgg, KONAMI_SEQUENCE } from "@/components/layout/easter-egg";
import { isActivePath } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Quiz } from "@/components/mdx/quiz";
import { Tab, Tabs } from "@/components/mdx/tabs";
import { routerMock } from "@/test/mocks/next-navigation";

const posts: PostCardData[] = [
  {
    slug: "k8s",
    title: "Learning Kubernetes",
    description: "Pods, Services and Deployments",
    date: "2025-10-31",
    tags: ["kubernetes", "devops"],
    readingMinutes: 10,
    category: "infrastructure",
    art: "lattice",
    figures: 1,
  },
  {
    slug: "linux",
    title: "Understanding Linux",
    description: "Permissions and processes in the système",
    date: "2025-10-03",
    tags: ["linux"],
    readingMinutes: 12,
    category: "security",
    art: "bits",
    figures: 0,
  },
];

describe("theme", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themePreference = "system";
    localStorage.clear();
  });

  it("cycles system → light → dark and persists the preference", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByTestId("theme-toggle");
    await user.click(button);
    expect(document.documentElement.dataset.themePreference).toBe("light");
    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(button).toHaveAttribute("data-preference", "dark");
  });
});

describe("navigation", () => {
  it("marks the active route, including subpages", () => {
    expect(isActivePath("/blog/abc", "/blog")).toBe(true);
    expect(isActivePath("/blogger", "/blog")).toBe(false);
  });

  it("the command palette opens with Ctrl+K, filters and navigates with Enter", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        entries={[
          {
            kind: "post",
            title: "Learning Kubernetes",
            description: "Pods",
            href: "/blog/k8s",
            keywords: ["kubernetes"],
          },
          {
            kind: "tag",
            title: "#prometheus",
            description: "1 article",
            href: "/tags/prometheus",
            keywords: [],
          },
        ]}
      />,
    );
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByTestId("search-input");
    expect(input).toHaveFocus();
    await user.type(input, "prometheus");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(routerMock.push).toHaveBeenCalledWith("/tags/prometheus");
  });
});

describe("article list", () => {
  it("filters by text (accent-insensitive), tag and area", () => {
    expect(filterPosts(posts, "systeme", null).map((p) => p.slug)).toEqual(["linux"]);
    expect(filterPosts(posts, "", "kubernetes").map((p) => p.slug)).toEqual(["k8s"]);
    expect(filterPosts(posts, "security", null).map((p) => p.slug)).toEqual(["linux"]);
    expect(filterPosts(posts, "", null, "infrastructure").map((p) => p.slug)).toEqual(["k8s"]);
    expect(filterPosts(posts, "linux", "kubernetes")).toHaveLength(0);
  });

  it("the area filter updates the URL", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={posts} tags={["kubernetes", "linux"]} />);
    await user.click(screen.getByRole("button", { name: "Security" }));
    expect(routerMock.replace).toHaveBeenLastCalledWith("/?area=security", { scroll: false });
  });

  it("updates the count and the URL while typing", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={posts} tags={["kubernetes", "linux", "devops"]} />);
    await user.type(screen.getByTestId("post-filter"), "linux");
    expect(screen.getByTestId("post-count")).toHaveTextContent("1 article found");
    expect(routerMock.replace).toHaveBeenLastCalledWith("/?q=linux", { scroll: false });
  });
});

describe("MDX components", () => {
  it("tabs follow the WAI-ARIA pattern with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Tabs labels={["Debian", "Alpine"]}>
        <Tab>apt</Tab>
        <Tab>apk</Tab>
      </Tabs>,
    );
    const [first, second] = screen.getAllByRole("tab");
    expect(first).toHaveAttribute("aria-selected", "true");
    first!.focus();
    await user.keyboard("{ArrowRight}");
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("apk");
  });

  it("the quiz checks the answer and explains it", async () => {
    const user = userEvent.setup();
    render(
      <Quiz question="2 + 2?" options={["3", "4"]} answer={1} explanation="Basic arithmetic." />,
    );
    const check = screen.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();
    await user.click(screen.getByLabelText("3"));
    await user.click(check);
    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    await user.click(screen.getByLabelText("4"));
    await user.click(check);
    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.getByText("Basic arithmetic.")).toBeInTheDocument();
  });
});

describe("easter egg", () => {
  it("recognizes the Konami code and resets on a wrong key", () => {
    let progress = 0;
    for (const key of KONAMI_SEQUENCE) progress = advanceSequence(progress, key);
    expect(progress).toBe(KONAMI_SEQUENCE.length);
    expect(advanceSequence(3, "x")).toBe(0);
    expect(advanceSequence(5, "ArrowUp")).toBe(1);
  });

  it("appears after the sequence", async () => {
    render(<EasterEgg />);
    await act(async () => {
      for (const key of KONAMI_SEQUENCE)
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    });
    expect(screen.getByRole("status")).toHaveTextContent("Another Leonardo");
  });
});
