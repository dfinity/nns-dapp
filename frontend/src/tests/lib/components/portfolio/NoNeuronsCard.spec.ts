import NoNeuronsCard from "$lib/components/portfolio/NoNeuronsCard.svelte";
import { NoNeuronsCardPo } from "$tests/page-objects/NoNeuronsCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("NoNeuronsCard", () => {
  const renderComponent = (props = {}) => {
    const { container } = render(NoNeuronsCard, props);
    return NoNeuronsCardPo.under(new JestPageObjectElement(container));
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
