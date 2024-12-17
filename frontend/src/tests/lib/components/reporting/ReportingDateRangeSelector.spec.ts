import ReportingDateRangeSelector from "$lib/components/reporting/ReportingDateRangeSelector.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ReportingDateRangeSelectorPo } from "$tests/page-objects/ReportingDateRangeSelector.page-object";
import { render } from "@testing-library/svelte";

describe("ReportingDateRangeSelector", () => {
  const renderComponent = () => {
    const { container } = render(ReportingDateRangeSelector, { period: "all" });
    const po = ReportingDateRangeSelectorPo.under({
      element: new JestPageObjectElement(container),
    });

    return po;
  };

  it("should render three options", async () => {
    const po = renderComponent();

    expect(await po.getAllOptions()).toHaveLength(3);
  });

  it("should select 'all' option by default", async () => {
    const po = renderComponent();

    const selectedOption = po.getSelectedOption();
    expect(await selectedOption.getValue()).toBe("all");
  });

  it("should change the option when interacting with a new element", async () => {
    const po = renderComponent();
    const allOptions = await po.getAllOptions();
    const firstOptionValue = await allOptions[0].getValue();
    const secondOption = allOptions[1];

    let currentOption = po.getSelectedOption();

    expect(await currentOption.getValue()).toEqual(firstOptionValue);

    await secondOption.click();
    currentOption = po.getSelectedOption();

    expect(await currentOption.getValue()).toBe(await secondOption.getValue());
  });
});
