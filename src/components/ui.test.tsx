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
    title: "Aprendendo Kubernetes",
    description: "Pods, Services e Deployments",
    date: "2025-10-31",
    tags: ["kubernetes", "devops"],
    readingMinutes: 10,
    category: "infraestrutura",
    art: "lattice",
    figures: 1,
  },
  {
    slug: "linux",
    title: "Entendendo Linux",
    description: "Permissões e processos no sistema",
    date: "2025-10-03",
    tags: ["linux"],
    readingMinutes: 12,
    category: "seguranca",
    art: "bits",
    figures: 0,
  },
];

describe("tema", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themePreference = "system";
    localStorage.clear();
  });

  it("alterna system → light → dark e persiste a preferência", async () => {
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

describe("navegação", () => {
  it("marca rota ativa inclusive em subpáginas", () => {
    expect(isActivePath("/blog/abc", "/blog")).toBe(true);
    expect(isActivePath("/blogger", "/blog")).toBe(false);
  });

  it("paleta de comandos abre com Ctrl+K, filtra e navega com Enter", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        entries={[
          {
            kind: "post",
            title: "Aprendendo Kubernetes",
            description: "Pods",
            href: "/blog/k8s",
            keywords: ["kubernetes"],
          },
          {
            kind: "tag",
            title: "#prometheus",
            description: "1 artigo",
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

describe("listagem de artigos", () => {
  it("filtra por texto (sem acentos), tag e área", () => {
    expect(filterPosts(posts, "permissoes", null).map((p) => p.slug)).toEqual(["linux"]);
    expect(filterPosts(posts, "", "kubernetes").map((p) => p.slug)).toEqual(["k8s"]);
    expect(filterPosts(posts, "seguranca", null).map((p) => p.slug)).toEqual(["linux"]);
    expect(filterPosts(posts, "", null, "infraestrutura").map((p) => p.slug)).toEqual(["k8s"]);
    expect(filterPosts(posts, "linux", "kubernetes")).toHaveLength(0);
  });

  it("filtro de área atualiza a URL", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={posts} tags={["kubernetes", "linux"]} />);
    await user.click(screen.getByRole("button", { name: "Segurança" }));
    expect(routerMock.replace).toHaveBeenLastCalledWith("/?area=seguranca", { scroll: false });
  });

  it("atualiza contagem e URL ao digitar", async () => {
    const user = userEvent.setup();
    render(<PostExplorer posts={posts} tags={["kubernetes", "linux", "devops"]} />);
    await user.type(screen.getByTestId("post-filter"), "linux");
    expect(screen.getByTestId("post-count")).toHaveTextContent("1 artigo encontrado");
    expect(routerMock.replace).toHaveBeenLastCalledWith("/?q=linux", { scroll: false });
  });
});

describe("componentes MDX", () => {
  it("abas seguem o padrão WAI-ARIA com setas", async () => {
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

  it("quiz verifica a resposta e explica", async () => {
    const user = userEvent.setup();
    render(
      <Quiz question="2 + 2?" options={["3", "4"]} answer={1} explanation="Aritmética básica." />,
    );
    const check = screen.getByRole("button", { name: "Verificar resposta" });
    expect(check).toBeDisabled();
    await user.click(screen.getByLabelText("3"));
    await user.click(check);
    expect(screen.getByText("Não exatamente.")).toBeInTheDocument();
    await user.click(screen.getByLabelText("4"));
    await user.click(check);
    expect(screen.getByText("Correto!")).toBeInTheDocument();
    expect(screen.getByText("Aritmética básica.")).toBeInTheDocument();
  });
});

describe("easter egg", () => {
  it("reconhece o código Konami e reinicia em erro", () => {
    let progress = 0;
    for (const key of KONAMI_SEQUENCE) progress = advanceSequence(progress, key);
    expect(progress).toBe(KONAMI_SEQUENCE.length);
    expect(advanceSequence(3, "x")).toBe(0);
    expect(advanceSequence(5, "ArrowUp")).toBe(1);
  });

  it("aparece após a sequência", async () => {
    render(<EasterEgg />);
    await act(async () => {
      for (const key of KONAMI_SEQUENCE)
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    });
    expect(screen.getByRole("status")).toHaveTextContent("Outro Leonardo");
  });
});
