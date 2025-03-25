import ReportingDateRangeSelector from "$lib/components/reporting/ReportingDateRangeSelector.svelte";
import type { ReportingPeriod } from "$lib/types/reporting";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ReportingDateRangeSelectorPo } from "$tests/page-objects/ReportingDateRangeSelector.page-object";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";

describe("ReportingDateRangeSelector", () => {
  const renderComponent = (
    props: {
      period?: ReportingPeriod;
    } = { period: "all" }
  ) => {
    const { container, component } = render(ReportingDateRangeSelector, props);

    const po = ReportingDateRangeSelectorPo.under(
      new JestPageObjectElement(container)
    );

    return { po, component };
  };

  it("should render the option provided as a prop", async () => {
    const { po } = renderComponent({ period: "last-year" });

    const selectedOption = po.getSelectedOption();
    expect(await selectedOption.getValue()).toBe("last-year");
  });

  it("should render three options", async () => {
    const { po } = renderComponent();

    expect(await po.getAllOptions()).toHaveLength(3);
  });

  it("should select 'all' option by default", async () => {
    const { po } = renderComponent();

    const selectedOption = po.getSelectedOption();
    expect(await selectedOption.getValue()).toBe("all");
  });

  it("should change the option when interacting with a new element", async () => {
    const { po } = renderComponent();
    const allOptions = await po.getAllOptions();
    const firstOptionValue = await allOptions[0].getValue();
    const secondOption = allOptions[1];

    let currentOption = po.getSelectedOption();

    expect(await currentOption.getValue()).toEqual(firstOptionValue);

    await secondOption.click();
    currentOption = po.getSelectedOption();

    expect(await currentOption.getValue()).toBe(await secondOption.getValue());
  });

  it("should update exported prop when selecting an option", async () => {
    const testProps = $state({ period: "all" as const });

    const { po } = renderComponent(testProps);
    const allOptions = await po.getAllOptions();

    expect(testProps.period).toBe("all");

    await allOptions[1].click();
    await tick();

    expect(testProps.period).toBe("last-year");
  });
});
