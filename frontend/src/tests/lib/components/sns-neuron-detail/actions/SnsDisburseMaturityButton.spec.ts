/**
 * @jest-environment jsdom
 */

import SnsDisburseMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsDisburseMaturityButton.svelte";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsDisburseMaturityButton", () => {
  const fee = 10_000n;
  const renderComponent = (neuron: SnsNeuron, feeE8s: bigint) => {
    const { container } = render(SnsDisburseMaturityButton, {
      props: {
        neuron,
        feeE8s,
      },
    });
    return DisburseMaturityButtonPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be enabled if enough maturity is available", async () => {
    const po = renderComponent(
      {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: fee + 10n,
        staked_maturity_e8s_equivalent: [],
      },
      fee
    );

    expect(await po.isDisabled()).toBe(false);
  });

  it("should be disabled if less maturity than transaction fee", async () => {
    const po = renderComponent(
      {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: fee - 1n,
        staked_maturity_e8s_equivalent: [],
      },
      fee
    );

    expect(await po.isDisabled()).toBe(true);
    expect(await po.getTooltipText()).toBe(
      "You do not have enough maturity to disburse. The minimum is: 0.0001."
    );
  });

  it("should open disburse maturity modal", async () => {
    // TODO: TBD
  });
});
