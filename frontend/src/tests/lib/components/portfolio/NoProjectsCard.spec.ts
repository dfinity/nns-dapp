import NoProjectsCard from "$lib/components/portfolio/NoProjectsCard.svelte";
import { NoProjectsCardPo } from "$tests/page-objects/NoProjectsCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("NoProjectsCard", () => {
  const renderComponent = (props = {}) => {
    const { container } = render(NoProjectsCard, props);
    return NoProjectsCardPo.under(new JestPageObjectElement(container));
  };

  it("should render secondary button styling by default", async () => {
    const po = renderComponent();
    expect(await po.hasPrimaryAction()).toBe(false);
    expect(await po.hasSecondaryAction()).toBe(true);
  });

  it("should render primary button styling when primaryCard is true", async () => {
    const po = renderComponent({ primaryCard: true });
    expect(await po.hasPrimaryAction()).toBe(true);
    expect(await po.hasSecondaryAction()).toBe(false);
  });

  it("should render secondary button styling when primaryCard is false", async () => {
    const po = renderComponent({ primaryCard: false });
    expect(await po.hasPrimaryAction()).toBe(false);
    expect(await po.hasSecondaryAction()).toBe(true);
  });
});
