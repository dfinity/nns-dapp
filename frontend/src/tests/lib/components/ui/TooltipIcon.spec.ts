import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { render } from "@testing-library/svelte";

describe("TooltipIcon", () => {
  const text = "This is the text displayed in the tooltip";
  const tooltipId = "example-tooltip-id";

  const renderComponent = () => {
    const { container } = render(TooltipIcon, { text, tooltipId });
    return TooltipIconPo.under(new JestPageObjectElement(container));
  };

  it("should have an info icon", async () => {
    const po = renderComponent();
    expect(await po.isPresent("icon-info")).toBe(true);
  });

  it("should have the tooltip text", async () => {
    const po = renderComponent();
    expect(await po.getText()).toBe(text);
  });

  it("should have the tooltip ID", async () => {
    const po = renderComponent().getTooltipPo();
    expect(await po.getAriaDescribedBy()).toBe(tooltipId);
    expect(await po.getTooltipId()).toBe(tooltipId);
  });
});
