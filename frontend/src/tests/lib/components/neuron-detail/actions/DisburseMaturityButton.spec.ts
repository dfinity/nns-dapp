/**
 * @jest-environment jsdom
 */

import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("DisburseMaturityButton", () => {
  const renderComponent = (enoughMaturity) => {
    const { container } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity,
      },
    });
    return DisburseMaturityButtonPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders disburse maturity cta", async () => {
    const po = renderComponent(true);

    expect(await po.isPresent()).toBe(true);
  });

  it("should be enabled", async () => {
    const po = renderComponent(true);

    expect(await po.isDisabled()).toBe(false);
  });

  it("should be disabled", async () => {
    const po = renderComponent(false);

    expect(await po.isDisabled()).toBe(true);
  });
});
