/**
 * @jest-environment jsdom
 */

import DissolveSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/DissolveSnsNeuronButton.svelte";
import {
  startDissolving,
  stopDissolving,
} from "$lib/services/sns-neurons.services";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    startDissolving: jest.fn().mockResolvedValue(undefined),
    stopDissolving: jest.fn().mockResolvedValue(undefined),
  };
});

describe("DissolveSnsNeuronButton", () => {
  const reloadContextSpy = jest.fn().mockResolvedValue(undefined);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders start dissolve message when neuron is locked", () => {
    const { getByText } = render(DissolveSnsNeuronButton, {
      props: {
        neuronId: mockSnsNeuron.id,
        neuronState: NeuronState.Locked,
        reloadContext: reloadContextSpy,
      },
    });

    expect(getByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
  });

  it("renders stop dissolve message when neuron is dissolving", () => {
    const { getByText } = render(DissolveSnsNeuronButton, {
      props: {
        neuronId: mockSnsNeuron.id,
        neuronState: NeuronState.Dissolving,
        reloadContext: reloadContextSpy,
      },
    });

    expect(getByText(en.neuron_detail.stop_dissolving)).toBeInTheDocument();
  });

  it("calls startDissolving action on click and LOCKED state", async () => {
    const { container, queryByTestId } = render(DissolveSnsNeuronButton, {
      props: {
        neuronId: mockSnsNeuron.id,
        neuronState: NeuronState.Locked,
        reloadContext: reloadContextSpy,
      },
    });

    const buttonElement = container.querySelector("button");

    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("dissolve-sns-neuron-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(startDissolving).toBeCalled();
    expect(stopDissolving).not.toBeCalled();
  });

  it("calls stopDissolving action on click and DISSOLVING state", async () => {
    const { container, queryByTestId } = render(DissolveSnsNeuronButton, {
      props: {
        neuronId: mockSnsNeuron.id,
        neuronState: NeuronState.Dissolving,
        reloadContext: reloadContextSpy,
      },
    });

    const buttonElement = container.querySelector("button");

    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("dissolve-sns-neuron-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(stopDissolving).toBeCalled();
    expect(startDissolving).not.toBeCalled();
  });

  it("calls update the context store", async () => {
    const { container, queryByTestId } = render(DissolveSnsNeuronButton, {
      props: {
        neuronId: mockSnsNeuron.id,
        neuronState: NeuronState.Dissolving,
        reloadContext: reloadContextSpy,
      },
    });

    const buttonElement = container.querySelector("button");

    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("dissolve-sns-neuron-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() => expect(reloadContextSpy).toBeCalledTimes(1));
  });
});
