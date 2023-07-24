/**
 * @jest-environment jsdom
 */

import NnsNeuronDissolveDelayActionItem from "$lib/components/neuron-detail/NnsNeuronDissolveDelayActionItem.svelte";
import { SECONDS_IN_MONTH, SECONDS_IN_YEAR } from "$lib/constants/constants";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronDissolveDelayActionItemPo } from "$tests/page-objects/NnsNeuronDissolveDelayActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronDissolveDelayActionItem", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronDissolveDelayActionItem,
      },
    });

    return NnsNeuronDissolveDelayActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render dissolve delay text and bonus if neuron is locked", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe(
      "Dissolve Delay: 2 years, 12 hours"
    );
    expect(await po.getDissolveBonus()).toBe("Dissolve delay bonus: 1.25");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should render remaining text and bonus if neuron is dissolving", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolving,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        dissolveState: {
          DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
        },
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Remaining: 2 years, 12 hours");
    expect(await po.getDissolveBonus()).toBe("Dissolve delay bonus: 1.25");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should render no bonus text if neuron is dissolving less than 6 months", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolving,
      dissolveDelaySeconds: BigInt(SECONDS_IN_MONTH * 4),
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveBonus()).toBe("No dissolve delay bonus");
  });

  it("should render dissolve delay text with 0 and no bonus text if neuron is unlocked", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolved,
      dissolveDelaySeconds: BigInt(0),
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Dissolve Delay: 0");
    expect(await po.getDissolveBonus()).toBe("No dissolve delay bonus");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });
});
