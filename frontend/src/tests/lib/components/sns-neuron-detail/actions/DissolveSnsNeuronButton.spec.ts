/**
 * @jest-environment jsdom
 */

import {
  startDissolving,
  stopDissolving,
} from "$lib/services/sns-neurons.services";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "../../../../mocks/sns-neurons.mock";
import DissolveSnsNeuronButtonTest from "./DissolveSnsNeuronButtonTest.svelte";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    startDissolving: jest.fn().mockResolvedValue(undefined),
    stopDissolving: jest.fn().mockResolvedValue(undefined),
  };
});

describe("DissolveSnsNeuronButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders start dissolve message when neuron is locked", () => {
    const { getByText } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: mockSnsNeuron,
        neuronState: NeuronState.Locked,
      },
    });

    expect(getByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
  });

  it("renders stop dissolve message when neuron is dissolving", () => {
    const { getByText } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: mockSnsNeuron,
        neuronState: NeuronState.Dissolving,
      },
    });

    expect(getByText(en.neuron_detail.stop_dissolving)).toBeInTheDocument();
  });

  it("calls startDissolving action on click and LOCKED state", async () => {
    const { container, queryByTestId } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: mockSnsNeuron,
        neuronState: NeuronState.Locked,
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
    const { container, queryByTestId } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: createMockSnsNeuron({
          stake: BigInt(10_000_000_000),
          id: [1, 2, 2, 9, 9, 3, 2],
          state: NeuronState.Dissolving,
        }),
        neuronState: NeuronState.Dissolving,
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
    const spy = jest.fn();

    const { container, queryByTestId } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: mockSnsNeuron,
        neuronState: NeuronState.Dissolving,
        spy,
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

    await waitFor(() => expect(spy).toBeCalledTimes(1));
  });
});
