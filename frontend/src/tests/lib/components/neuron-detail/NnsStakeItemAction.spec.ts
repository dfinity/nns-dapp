/**
 * @jest-environment jsdom
 */

import NnsStakeItemAction from "$lib/components/neuron-detail/NnsStakeItemAction.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsStakeItemActionPo } from "$tests/page-objects/NnsStakeItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsStakeItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsStakeItemAction,
      },
    });

    return NnsStakeItemActionPo.under(new JestPageObjectElement(container));
  };

  it("should render ICP Stake of the neuron", async () => {
    const stake = 314000000n;
    const neuronFees = 0n;
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: stake,
        neuronFees,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getStake()).toBe("3.14");
  });

  it("should render increase stake button", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasIncreaseStakeButton()).toBe(true);
  });
});
