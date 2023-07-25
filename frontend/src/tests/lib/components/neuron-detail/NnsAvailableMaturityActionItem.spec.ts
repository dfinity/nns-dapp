/**
 * @jest-environment jsdom
 */

import NnsAvailableMaturityActionItem from "$lib/components/neuron-detail/NnsAvailableMaturityActionItem.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsAvailableMaturityActionItemPo } from "$tests/page-objects/NnsAvailableMaturityActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsAvailableMaturityActionItem", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsAvailableMaturityActionItem,
      },
    });

    return NnsAvailableMaturityActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render available maturity", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: 314000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getMaturity()).toBe("3.14");
  });

  it("should render buttons", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockIdentity.getPrincipal().toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(true);
    expect(await po.hasStakeButton()).toBe(true);
  });

  it("should not render buttons if user is not the controller", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockCanisterId.toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(false);
    expect(await po.hasStakeButton()).toBe(false);
  });
});
