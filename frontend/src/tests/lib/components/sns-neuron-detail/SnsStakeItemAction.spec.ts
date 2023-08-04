/**
 * @jest-environment jsdom
 */

import SnsStakeItemAction from "$lib/components/sns-neuron-detail/SnsStakeItemAction.svelte";
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
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsStakeItemAction, {
      props: {
        neuron,
        universe: mockUniverse,
        token: mockToken,
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
