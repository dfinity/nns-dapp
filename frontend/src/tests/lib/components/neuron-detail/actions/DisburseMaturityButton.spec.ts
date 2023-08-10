/**
 * @jest-environment jsdom
 */

import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("DisburseMaturityButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders disburse maturity cta", async () => {
    const { container } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity: true,
      },
    });
    const buttonPo = DisburseMaturityButtonPo.under(
      new JestPageObjectElement(container)
    );

    expect(await buttonPo.isPresent()).toBe(true);
  });

  it("should be enabled", async () => {
    const { container } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity: true,
      },
    });
    const buttonPo = DisburseMaturityButtonPo.under(
      new JestPageObjectElement(container)
    );

    expect(await buttonPo.isDisabled()).toBe(false);
  });

  it("should be disabled", async () => {
    const { container } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity: false,
      },
    });
    const buttonPo = DisburseMaturityButtonPo.under(
      new JestPageObjectElement(container)
    );

    expect(await buttonPo.isDisabled()).toBe(true);
  });
});
