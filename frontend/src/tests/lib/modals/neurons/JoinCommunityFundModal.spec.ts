import JoinCommunityFundModal from "$lib/modals/neurons/JoinCommunityFundModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { JoinCommunityFundModalPo } from "$tests/page-objects/JoinCommunityFundModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("ConfirmationModal", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(JoinCommunityFundModal, { props: { neuron } });
    return JoinCommunityFundModalPo.under(new JestPageObjectElement(container));
  };

  const controlledNeuron: NeuronInfo = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render leave text if neuron is part of the Neurons' Fund", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      joinedCommunityFundTimestampSeconds: 123_444n,
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
      "Confirm Are you sure you want this neuron to join the neurons' fund? Note that only the controllers of Neurons' Fund neurons get added as hotkeys to SNS neurons resulting from Neurons' Fund swap participation. Since you are not the controller of this neuron, you will not be able to manage the resulting SNS neurons, even if you control this neuron with a hardware wallet."
    );
  });
});
