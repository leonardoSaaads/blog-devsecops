// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MDX_COMPONENT_NAMES } from "@/components/mdx/mdx-components";
import { countInteractiveFigures, INTERACTIVE_COMPONENTS } from "@/lib/content/interactive";
import { Card, CardGrid } from "./cards";
import { Definition, PullQuote } from "./definition";
import { Sidenote } from "./sidenote";
import { Term } from "./term";

describe("componentes acadêmicos", () => {
  it("toda figura interativa contada está registrada no MDX", () => {
    for (const name of INTERACTIVE_COMPONENTS) expect(MDX_COMPONENT_NAMES).toContain(name);
  });

  it("conta figuras ignorando blocos de código", () => {
    const body =
      "Texto\n\n<Fiber3D />\n\n```mdx\n<Fiber3D />\n```\n\n  <OsnrCalculator />\n<Callout>x</Callout>";
    expect(countInteractiveFigures(body)).toBe(2);
  });

  it("nota de margem é uma nota acessível dentro do parágrafo", () => {
    render(
      <p>
        Frase<Sidenote>Comentário lateral.</Sidenote>
      </p>,
    );
    expect(screen.getByRole("note")).toHaveTextContent("Comentário lateral.");
  });

  it("termo mostra a definição no foco e fecha com Esc", async () => {
    const user = userEvent.setup();
    render(<Term def="Relação sinal-ruído óptica.">OSNR</Term>);
    const button = screen.getByRole("button", { name: "OSNR" });
    expect(button).toHaveAccessibleDescription("Relação sinal-ruído óptica.");
    await user.tab();
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("cards, definição e citação de destaque", () => {
    render(
      <>
        <CardGrid cols={3}>
          <Card title="Núcleo" icon="cable" tone="signal">
            Vidro dopado.
          </Card>
        </CardGrid>
        <Definition term="Fator Q">Separação entre níveis.</Definition>
        <PullQuote cite="Autor">Meça antes de otimizar.</PullQuote>
      </>,
    );
    expect(screen.getByRole("heading", { name: "Núcleo" })).toBeInTheDocument();
    expect(screen.getByRole("note", { name: "Definição: Fator Q" })).toHaveTextContent(
      "Separação entre níveis.",
    );
    expect(screen.getByText("Meça antes de otimizar.")).toBeInTheDocument();
  });
});
