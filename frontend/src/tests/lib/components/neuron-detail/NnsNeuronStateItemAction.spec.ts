/**
 * @jest-environment jsdom
 */

import NnsNeuronStateItemAction from "$lib/components/neuron-detail/NnsNeuronStateItemAction.svelte";
import { SECONDS_IN_FOUR_YEARS } from "$lib/constants/constants";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronStateItemActionPo } from "$tests/page-objects/NnsNeuronStateItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronStateItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronStateItemAction,
      },
    });

    return NnsNeuronStateItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render locked text and Start dissolving button if neuron is locked", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Locked,
    };
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Locked");
    expect(await po.getDissolveButtonText()).toBe("Start Dissolving");
  });

  it("should render dissolving text and Stop dissolving button if neuron is dissolving", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Dissolving");
    expect(await po.getDissolveButtonText()).toBe("Stop Dissolving");
  });

  it("should render unlocked text and disburse button if neuron is unlocked", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolved,
    };
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Unlocked");
    expect(await po.hasDisburseButton()).toBe(true);
  });

  it("should render age bonus for Locked neurons", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Locked,
      ageSeconds: BigInt(SECONDS_IN_FOUR_YEARS),
    };
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("Age bonus: 1.25");
  });

  it("should render no age bonus for dissolving neurons", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });

  it("should render no age bonus for unlocked neurons", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });
});
