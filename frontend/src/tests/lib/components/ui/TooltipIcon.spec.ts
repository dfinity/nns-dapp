import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
import TooltipIconTest from "$tests/lib/components/ui/TooltipIconTest.svelte";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("TooltipIcon", () => {
  const text = "This is the text displayed in the tooltip";
  const tooltipId = "example-tooltip-id";
  const tooltipIdPrefix = "example-tooltip-id-prefix";

  const renderComponent = ({
    tooltipId,
    tooltipIdPrefix,
  }: {
    tooltipId?: string;
    tooltipIdPrefix?: string;
  }) => {
    const { container } = render(TooltipIcon, {
      text,
      tooltipId,
      tooltipIdPrefix,
    });
    return TooltipIconPo.under(new JestPageObjectElement(container));
  };

  it("should have an info icon", async () => {
    const po = renderComponent({ tooltipId });
    expect(await po.isPresent("icon-info")).toBe(true);
  });

  it("should have the tooltip text", async () => {
    const po = renderComponent({ tooltipId });
    expect(await po.getTooltipText()).toBe(text);
  });

  it("should have the tooltip ID", async () => {
    const po = renderComponent({ tooltipId }).getTooltipPo();
    expect(await po.getAriaDescribedBy()).toBe(tooltipId);
    expect(await po.getTooltipId()).toBe(tooltipId);
  });

  it("should have the tooltip ID prefix", async () => {
    const po = renderComponent({ tooltipIdPrefix }).getTooltipPo();
    const describedBy = await po.getAriaDescribedBy();
    expect(describedBy).toMatch(new RegExp(`${tooltipIdPrefix}-`));
    expect(await po.getTooltipId()).toBe(describedBy);
  });

  it("should have the default tooltip ID prefix", async () => {
    const po = renderComponent({}).getTooltipPo();
    const describedBy = await po.getAriaDescribedBy();
    expect(describedBy).toMatch(new RegExp(`tooltip-icon-`));
    expect(await po.getTooltipId()).toBe(describedBy);
  });

  it("should not render any text or whitespace in the tooltip target", async () => {
    const po = renderComponent({});
    expect(`'${await po.getText()}'`).toBe("''");
  });

  describe("when the tooltip content is passed as a slot", () => {
    const renderComponentWithSlot = (text: string) => {
      const { container } = render(TooltipIconTest, {
        text,
        tooltipId,
        tooltipIdPrefix,
      });
      return TooltipIconPo.under(new JestPageObjectElement(container));
    };

    it("should not render any text or whitespace in the tooltip target", async () => {
      const po = renderComponentWithSlot(text);
      expect(`'${await po.getText()}'`).toBe("''");
    });

    it("should render the slot in the tooltip", async () => {
      const text = "Tooltip text passed as slot";
      const po = renderComponentWithSlot(text);
      expect(await po.getTooltipPo().getTooltipText()).toBe(text);
    });
  });
});
