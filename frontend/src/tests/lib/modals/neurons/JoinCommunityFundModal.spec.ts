/**
 * @jest-environment jsdom
 */

import JoinCommunityFundModal from "$lib/modals/neurons/JoinCommunityFundModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("ConfirmationModal", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(JoinCommunityFundModal, { props: { neuron } });
    return ConfirmationModalPo.under(new JestPageObjectElement(container));
  };

  const controlledNeuron: NeuronInfo = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render leave text if neuron is part of the Neurons' Fund", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      joinedCommunityFundTimestampSeconds: BigInt(123444),
    };
    const po = renderComponent(neuron);
    expect(await po.getContentText()).toBe(
      "Confirm Are you sure you want this neuron to leave the neurons' fund?"
    );
  });

  it("should render join text if neuron is not part of the Neurons' Fund", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
    };
    const po = renderComponent(neuron);
    expect(await po.getContentText()).toBe(
      "Confirm Are you sure you want this neuron to join the neurons' fund?"
    );
  });

  it("should render join text and alert text if neuron is not part of the Neurons' Fund and user is hotkey", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-user",
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    };
    const po = renderComponent(neuron);
    expect(await po.getContentText()).toBe(
      "Confirm Are you sure you want this neuron to join the neurons' fund? Beware that the NNS Dapp doesn't support hardware wallets for SNS yet. If this neuron is controlled by a hardware wallet, you will not be able to manage it from the NNS Dapp."
    );
  });
});
