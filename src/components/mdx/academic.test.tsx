// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MDX_COMPONENT_NAMES } from "@/components/mdx/mdx-components";
import { countInteractiveFigures, INTERACTIVE_COMPONENTS } from "@/lib/content/interactive";
import { Card, CardGrid } from "./cards";
import { Definition, PullQuote } from "./definition";
import { Sidenote } from "./sidenote";
import { Term } from "./term";

describe("academic components", () => {
  it("every counted interactive figure is registered in MDX", () => {
    for (const name of INTERACTIVE_COMPONENTS) expect(MDX_COMPONENT_NAMES).toContain(name);
  });

  it("counts figures while ignoring code blocks", () => {
    const body =
      "Text\n\n<Fiber3D />\n\n```mdx\n<Fiber3D />\n```\n\n  <OsnrCalculator />\n<Callout>x</Callout>";
    expect(countInteractiveFigures(body)).toBe(2);
  });

  it("a sidenote is an accessible note inside the paragraph", () => {
    render(
      <p>
        Sentence<Sidenote>Side comment.</Sidenote>
      </p>,
    );
    expect(screen.getByRole("note")).toHaveTextContent("Side comment.");
  });

  it("a term shows its definition on focus and closes with Esc", async () => {
    const user = userEvent.setup();
    render(<Term def="Optical signal-to-noise ratio.">OSNR</Term>);
    const button = screen.getByRole("button", { name: "OSNR" });
    expect(button).toHaveAccessibleDescription("Optical signal-to-noise ratio.");
    await user.tab();
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("cards, definition and pull quote", () => {
    render(
      <>
        <CardGrid cols={3}>
          <Card title="Core" icon="cable" tone="signal">
            Doped glass.
          </Card>
        </CardGrid>
        <Definition term="Q-factor">Separation between levels.</Definition>
        <PullQuote cite="Author">Measure before you optimize.</PullQuote>
      </>,
    );
    expect(screen.getByRole("heading", { name: "Core" })).toBeInTheDocument();
    expect(screen.getByRole("note", { name: "Definition: Q-factor" })).toHaveTextContent(
      "Separation between levels.",
    );
    expect(screen.getByText("Measure before you optimize.")).toBeInTheDocument();
  });
});
