import MaturityWithTooltip from "$lib/components/neurons/MaturityWithTooltip.svelte";
import { MaturityWithTooltipPo } from "$tests/page-objects/MaturityWithTooltip.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("MaturityWithTooltip", () => {
  const renderComponent = (props) => {
    const { container } = render(MaturityWithTooltip, props);
    return MaturityWithTooltipPo.under(new JestPageObjectElement(container));
  };

  it("should render maturity", async () => {
    const po = renderComponent({
      availableMaturity: 100_000_000n,
      stakedMaturity: 200_000_000n,
    });

    expect(await po.getAvailableMaturity()).toBe("1.00");
    expect(await po.getStakedMaturity()).toBe("2.00");
    expect(await po.getTotalMaturity()).toBe("3.00");
  });
});
