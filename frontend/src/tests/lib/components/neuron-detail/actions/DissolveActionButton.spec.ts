import {
  startDissolving,
  stopDissolving,
} from "$lib/services/neurons.services";
import DissolveActionButtonTest from "$tests/lib/components/neuron-detail/actions/DissolveActionButtonTest.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    startDissolving: vi.fn().mockResolvedValue(undefined),
    stopDissolving: vi.fn().mockResolvedValue(undefined),
    getNeuronFromStore: vi.fn(),
  };
});

describe("DissolveActionButton", () => {
  it("renders start dissolve message when neuron is locked", () => {
    const { getByText } = render(DissolveActionButtonTest, {
      props: {
        neuron: {
          ...mockNeuron,
          neuronId: 10n,
          state: NeuronState.Locked,
        },
      },
    });

    expect(getByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
  });

  it("renders stop dissolve message when neuron is dissolving", async () => {
    const { getByText } = render(DissolveActionButtonTest, {
      props: {
        neuron: {
          ...mockNeuron,
          neuronId: 10n,
          state: NeuronState.Dissolving,
        },
      },
    });

    expect(getByText(en.neuron_detail.stop_dissolving)).toBeInTheDocument();
  });

  it("calls startDissolving action on click and LOCKED state", async () => {
    const { container, queryByTestId } = render(DissolveActionButtonTest, {
      props: {
        neuron: {
          ...mockNeuron,
          neuronId: 10n,
          state: NeuronState.Locked,
        },
      },
    });

    const buttonElement = container.querySelector("button");

    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("dissolve-action-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(startDissolving).toBeCalled();
    expect(stopDissolving).not.toBeCalled();
  });

  it("calls stopDissolving action on click and DISSOLVING state", async () => {
    const { container, queryByTestId } = render(DissolveActionButtonTest, {
      props: {
        neuron: {
          ...mockNeuron,
          neuronId: 10n,
          state: NeuronState.Dissolving,
        },
      },
    });

    const buttonElement = container.querySelector("button");

    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("dissolve-action-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(stopDissolving).toBeCalled();
    expect(startDissolving).not.toBeCalled();
  });
});
