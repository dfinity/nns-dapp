/**
 * @jest-environment jsdom
 */

import SnsNeuronStateItemAction from "$lib/components/sns-neuron-detail/SnsNeuronStateItemAction.svelte";
import { SECONDS_IN_FOUR_YEARS } from "$lib/constants/constants";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronStateItemActionPo } from "$tests/page-objects/SnsNeuronStateItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronStateItemAction", () => {
  const nowInSeconds = 1689843195;
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronStateItemAction, {
      props: {
        neuron,
        snsParameters: snsNervousSystemParametersMock,
      },
    });

    return SnsNeuronStateItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(nowInSeconds * 1000);
  });

  it("should render locked text and Start dissolving button if neuron is locked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
    });
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Locked");
    expect(await po.getDissolveButtonText()).toBe("Start Dissolving");
  });

  it("should render dissolving text and Stop dissolving button if neuron is dissolving", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
    });
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Dissolving");
    expect(await po.getDissolveButtonText()).toBe("Stop Dissolving");
  });

  it("should render unlocked text and disburse button if neuron is unlocked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
    });
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Unlocked");
    expect(await po.hasDisburseButton()).toBe(true);
  });

  it("should render age bonus for Locked neurons", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      ageSinceTimestampSeconds: BigInt(nowInSeconds - SECONDS_IN_FOUR_YEARS),
    });
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("Age bonus: 1.25");
  });

  it("should render no age bonus for dissolving neurons", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
    });
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });

  it("should render no age bonus for unlocked neurons", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
    });
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });
});
