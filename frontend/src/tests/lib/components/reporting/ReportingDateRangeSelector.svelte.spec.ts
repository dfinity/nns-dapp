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
    } = { period: "year-to-date" }
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

  it("should render four options", async () => {
    const { po } = renderComponent();

    expect(await po.getAllOptions()).toHaveLength(3);
  });

  it("should select 'year-to-date' option by default", async () => {
    const { po } = renderComponent();

    const selectedOption = po.getSelectedOption();
    expect(await selectedOption.getValue()).toBe("year-to-date");
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

  it("should update period when selecting an option", async () => {
    const testProps = $state({ period: "year-to-date" as const });

    const { po } = renderComponent(testProps);
    const allOptions = await po.getAllOptions();

    expect(testProps.period).toBe("year-to-date");

    await allOptions[1].click();
    await tick();

    expect(testProps.period).toBe("last-year");
  });

  it("should show custom date inputs when custom period is selected", async () => {
    const testProps = $state({
      period: "year-to-date" as const,
      customFrom: undefined,
      customTo: undefined,
    });

    const { po } = renderComponent(testProps);
    const options = await po.getAllOptions();

    expect(testProps.period).toBe("year-to-date");

    await options[2].click();
    await tick();

    expect(await po.getCustomRangeSection().isPresent()).toBe(true);
    expect(await po.getFromDateInput().isPresent()).toBe(true);
    expect(await po.getToDateInput().isPresent()).toBe(true);
  });

  describe("Custom date", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-10-01T12:00:00Z"));
    });

    it("should auto-set 'to' date when 'from' date is selected and no 'to' exists", async () => {
      const testProps = $state({
        period: "custom" as const,
        customFrom: undefined,
        customTo: undefined,
      });

      const { po } = renderComponent(testProps);

      await po.setFromDate("2025-01-01");
      await tick();

      expect(testProps.customFrom).toBe("2025-01-01");
      expect(testProps.customTo).toBe("2025-10-01"); // Today (mock date)
    });

    it("should limit 'to' date to 1 year when 'from' exceeds range", async () => {
      const testProps = $state({
        period: "custom" as const,
        customFrom: undefined,
        customTo: undefined,
      });

      const { po } = renderComponent(testProps);

      // Set 'from' date more than 1 year ago
      await po.setFromDate("2024-01-01");
      await tick();

      expect(testProps.customFrom).toBe("2024-01-01");
      expect(testProps.customTo).toBe("2025-01-01"); // Exactly 1 year later
    });

    it("should adjust 'to' date when changing 'from' creates >1 year range", async () => {
      const testProps = $state({
        period: "custom" as const,
        customFrom: "2025-01-01",
        customTo: "2025-12-31",
      });

      const { po } = renderComponent(testProps);

      // Change 'from' to create >1 year range
      await po.setFromDate("2024-06-01");
      await tick();

      expect(testProps.customFrom).toBe("2024-06-01");
      expect(testProps.customTo).toBe("2025-06-01"); // Adjusted to 1 year from new 'from'
    });

    it("should adjust 'from' date when changing 'to' creates >1 year range", async () => {
      const testProps = $state({
        period: "custom" as const,
        customFrom: "2024-01-01",
        customTo: "2024-06-01",
      });

      const { po } = renderComponent(testProps);

      // Change 'to' to create >1 year range
      await po.setToDate("2025-06-01");
      await tick();

      expect(testProps.customFrom).toBe("2024-06-01"); // Adjusted to 1 year before new 'to'
      expect(testProps.customTo).toBe("2025-06-01");
    });

    it("should set 'to' to 'from' when 'to' becomes earlier than 'from'", async () => {
      const testProps = $state({
        period: "custom" as const,
        customFrom: "2025-06-01",
        customTo: "2025-12-01",
      });

      const { po } = renderComponent(testProps);

      // Set 'from' to date after current 'to'
      await po.setFromDate("2025-12-15");
      await tick();

      expect(testProps.customFrom).toBe("2025-12-15");
      expect(testProps.customTo).toBe("2025-12-15"); // Adjusted to match 'from'
    });

    it("should set 'from' to 'to' when 'to' becomes earlier than 'from'", async () => {
      const testProps = $state({
        period: "custom" as const,
        customFrom: "2025-06-01",
        customTo: "2025-12-01",
      });

      const { po } = renderComponent(testProps);

      // Set 'to' to date before current 'from'
      await po.setToDate("2025-05-01");
      await tick();

      expect(testProps.customFrom).toBe("2025-05-01"); // Adjusted to match 'to'
      expect(testProps.customTo).toBe("2025-05-01");
    });
  });
});
