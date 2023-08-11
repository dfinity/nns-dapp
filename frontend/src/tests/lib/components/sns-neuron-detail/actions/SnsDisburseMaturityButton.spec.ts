/**
 * @jest-environment jsdom
 */

import SnsDisburseMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsDisburseMaturityButton.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("SnsDisburseMaturityButton", () => {
  const renderComponent = (neuron) => {
    const { container } = render(SnsNeuronContextTest, {
      props: {
        neuron,
        rootCanisterId: mockPrincipal,
        testComponent: SnsDisburseMaturityButton,
      },
    });
    return DisburseMaturityButtonPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be enabled if enough maturity is available", async () => {
    const po = renderComponent({
      ...mockSnsNeuron,
      maturity_e8s_equivalent: 1n,
      staked_maturity_e8s_equivalent: [],
    });

    expect(await po.isDisabled()).toBe(false);
  });

  it("should be disabled if no maturity to disburse", async () => {
    const po = renderComponent({
      ...mockSnsNeuron,
      maturity_e8s_equivalent: 0n,
      staked_maturity_e8s_equivalent: [],
    });

    expect(await po.isDisabled()).toBe(true);
  });

  it("should open disburse maturity modal", async () => {
    // TODO: TBD
  });
});
