/**
 * @jest-environment jsdom
 */

import SaleInProgress from "$lib/components/sale/SaleInProgress.svelte";
import { SaleStep } from "$lib/types/sale";
import en from "$tests/mocks/i18n.mock";
import { testProgress } from "$tests/utils/progress.test-utils";
import { render } from "@testing-library/svelte";

describe("SaleInProgress", () => {
  it("should render a warning to not close the browser", () => {
    const { getByTestId } = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.INITIALIZATION,
      },
    });

    const element = getByTestId("in-progress-warning");

    expect(element).not.toBeNull();
    expect(element.textContent).toContain(en.core.this_may_take_a_few_minutes);
    expect(element.textContent).toContain(en.core.do_not_close);
  });

  it("should render steps", () => {
    const { container } = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.INITIALIZATION,
      },
    });

    // SaleStep minus SaleStep.DONE
    expect(container.querySelectorAll(".step").length).toEqual(4);
  });

  it("should render step initialization in progress", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.INITIALIZATION,
      },
    });

    testProgress({
      result,
      position: 1,
      label: en.sns_sale.step_initialization,
      status: "In progress",
    });
  });

  it("should render step initialization completed", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.TRANSFER,
      },
    });

    testProgress({
      result,
      position: 1,
      label: en.sns_sale.step_initialization,
      status: "Completed",
    });
  });

  it("should render step transfer in progress", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.TRANSFER,
      },
    });

    testProgress({
      result,
      position: 2,
      label: en.sns_sale.step_transfer,
      status: "In progress",
    });
  });

  it("should render step transfer completed", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.NOTIFY,
      },
    });

    testProgress({
      result,
      position: 2,
      label: en.sns_sale.step_transfer,
      status: "Completed",
    });
  });

  it("should render step notify in progress", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.NOTIFY,
      },
    });

    testProgress({
      result,
      position: 3,
      label: en.sns_sale.step_notify,
      status: "In progress",
    });
  });

  it("should render step notify completed", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.RELOAD,
      },
    });

    testProgress({
      result,
      position: 3,
      label: en.sns_sale.step_notify,
      status: "Completed",
    });
  });

  it("should render step reload in progress", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.RELOAD,
      },
    });

    testProgress({
      result,
      position: 4,
      label: en.sns_sale.step_reload,
      status: "In progress",
    });
  });

  it("should render step reload completed", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.DONE,
      },
    });

    testProgress({
      result,
      position: 4,
      label: en.sns_sale.step_reload,
      status: "Completed",
    });
  });
});
