/**
 * @jest-environment jsdom
 */

import SaleInProgress from "$lib/components/sale/SaleInProgress.svelte";
import { SaleStep } from "$lib/types/sale";
import { render, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import en from "../../../mocks/i18n.mock";

describe("SaleInProgress", () => {
  it("should render a warning to not close the browser", () => {
    const { getByTestId } = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.INITIALIZATION,
      },
    });

    const element = getByTestId("sale-in-progress-warning");

    expect(element).not.toBeNull();
    expect(element.textContent).toContain(
      en.sns_sale.this_may_take_a_few_minutes
    );
    expect(element.textContent).toContain(en.sns_sale.do_not_close);
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

  const test = ({
    result: { container },
    position,
    label,
    status,
  }: {
    result: RenderResult<SvelteComponent>;
    position: number;
    label: string;
    status: "In progress" | "Completed";
  }) => {
    const element = container.querySelectorAll(".step")[position - 1];

    if (status === "In progress") {
      expect(element?.textContent ?? "").toContain(`${position}`);
    } else if (status === "Completed") {
      // Circle checkmark
      expect(element.querySelector("svg")).not.toBeNull();
    }

    expect(element?.textContent ?? "").toContain(label);
    expect(element?.textContent ?? "").toContain(status);
  };

  it("should render step initialization in progress", () => {
    const result = render(SaleInProgress, {
      props: {
        progressStep: SaleStep.INITIALIZATION,
      },
    });

    test({
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

    test({
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

    test({
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

    test({
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

    test({
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

    test({
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

    test({
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

    test({
      result,
      position: 4,
      label: en.sns_sale.step_reload,
      status: "Completed",
    });
  });
});
