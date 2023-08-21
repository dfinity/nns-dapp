/**
 * @jest-environment jsdom
 */

import SnsStakeItemAction from "$lib/components/sns-neuron-detail/SnsStakeItemAction.svelte";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken, mockUniverse } from "$tests/mocks/sns-projects.mock";
import { StakeItemActionPo } from "$tests/page-objects/StakeItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsStakeItemAction", () => {
  const renderComponent = (
    neuron: SnsNeuron,
    token: IcrcTokenMetadata = mockToken
  ) => {
    const { container } = render(SnsStakeItemAction, {
      props: {
        neuron,
        universe: mockUniverse,
        token,
      },
    });

    return StakeItemActionPo.under(new JestPageObjectElement(container));
  };

  it("should render Stake of the neuron", async () => {
    const stake = 314000000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      stake,
    });
    const po = renderComponent(neuron);

    expect(await po.getStake()).toBe("3.14");
  });

  it("should render token symbol in description", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
    });
    const po = renderComponent(neuron, { ...mockToken, symbol: "TST" });

    expect(await po.getDescription()).toBe("TST staked");
  });

  it("should render increase stake button", async () => {
    const po = renderComponent(mockSnsNeuron);

    expect(await po.hasIncreaseStakeButton()).toBe(true);
  });

  it("should not render increase stake button if neuron belongs to CF", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      // Having a sourceNnsNeuronId makes the neuron a CF neuron.
      sourceNnsNeuronId: 123455n,
    });
    const po = renderComponent(neuron);

    expect(await po.hasIncreaseStakeButton()).toBe(false);
  });
});
