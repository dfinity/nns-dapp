/**
 * @jest-environment jsdom
 */

import {
  startDissolving,
  stopDissolving,
} from "$lib/services/sns-neurons.services";
import en from "$tests/mocks/i18n.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
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
        neuron: createMockSnsNeuron({
          id: [1],
          state: NeuronState.Locked,
        }),
      },
    });

    expect(getByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
  });

  it("renders stop dissolve message when neuron is dissolving", () => {
    const { getByText } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: createMockSnsNeuron({
          id: [1],
          state: NeuronState.Dissolving,
        }),
      },
    });

    expect(getByText(en.neuron_detail.stop_dissolving)).toBeInTheDocument();
  });

  it("is disabled while vesting", () => {
    const { queryByTestId } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: createMockSnsNeuron({
          id: [1],
          vesting: true,
          state: NeuronState.Locked,
        }),
      },
    });

    expect(queryByTestId("sns-dissolve-button").hasAttribute("disabled")).toBe(
      true
    );
  });

  it("calls startDissolving action on click and LOCKED state", async () => {
    const { container, queryByTestId } = render(DissolveSnsNeuronButtonTest, {
      props: {
        neuron: createMockSnsNeuron({
          id: [1],
          state: NeuronState.Locked,
        }),
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
