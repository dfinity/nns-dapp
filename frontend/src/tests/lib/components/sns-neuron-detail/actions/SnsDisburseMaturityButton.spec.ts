/**
 * @jest-environment jsdom
 */

import SnsDisburseMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsDisburseMaturityButton.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { render } from "@testing-library/svelte";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("SnsDisburseMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be enabled if enough maturity is available", async () => {
    const { getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          maturity_e8s_equivalent: 1n,
          staked_maturity_e8s_equivalent: [],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsDisburseMaturityButton,
      },
    });

    const btn = getByTestId("disburse-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBe(false);
  });

  it("should be disabled if no maturity to disburse", async () => {
    const { getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          maturity_e8s_equivalent: 0n,
          staked_maturity_e8s_equivalent: [],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsDisburseMaturityButton,
      },
    });

    const btn = getByTestId("disburse-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });

  it("should open disburse maturity modal", async () => {
    // TODO: TBD
  });
});
