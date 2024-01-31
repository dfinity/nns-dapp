import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
import { SnsNeuronDissolveDelayItemActionPo } from "$tests/page-objects/SnsNeuronDissolveDelayItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CommonItemAction", () => {
  const tooltipText = "Example tooltip text";
  const tooltipId = "example-tooltip-id";

  const renderComponent = () => {
    const { container } = render(CommonItemAction, {
      props: {
        testId: SnsNeuronDissolveDelayItemActionPo.TID,
        tooltipText,
        tooltipId,
      },
    });

    // We don't use CommonItemAction separately so we use the page object of a
    // parent component.
    return SnsNeuronDissolveDelayItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render the tooltip text", async () => {
    const po = renderComponent();

    expect(await po.getTooltipIconPo().getText()).toBe(tooltipText);
  });

  it("should render the tooltip id", async () => {
    const po = renderComponent();

    expect(await po.getTooltipIconPo().getTooltipPo().getTooltipId()).toBe(
      tooltipId
    );
  });
});
