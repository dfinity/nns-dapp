/**
 * @jest-environment jsdom
 */

import { NeuronState } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import DissolveActionButton from "../../../../../lib/components/neuron-detail/actions/DissolveActionButton.svelte";
import {
  startDissolving,
  stopDissolving,
} from "../../../../../lib/services/neurons.services";
import en from "../../../../mocks/i18n.mock";

jest.mock("../../../../../lib/services/neurons.services", () => {
  return {
    startDissolving: jest.fn().mockResolvedValue(undefined),
    stopDissolving: jest.fn().mockResolvedValue(undefined),
    getNeuronFromStore: jest.fn(),
  };
});

describe("DissolveActionButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders start dissolve message when neuron is locked", () => {
    const { getByText } = render(DissolveActionButton, {
      props: {
        neuronId: BigInt(10),
        neuronState: NeuronState.LOCKED,
      },
    });

    expect(getByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
  });

  it("renders stop dissolve message when neuron is dissolving", () => {
    const { getByText } = render(DissolveActionButton, {
      props: {
        neuronId: BigInt(10),
        neuronState: NeuronState.DISSOLVING,
      },
    });

    expect(getByText(en.neuron_detail.stop_dissolving)).toBeInTheDocument();
  });

  it("calls startDissolving action on click and LOCKED state", async () => {
    const { container, queryByTestId } = render(DissolveActionButton, {
      props: {
        neuronId: BigInt(10),
        neuronState: NeuronState.LOCKED,
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
    const { container, queryByTestId } = render(DissolveActionButton, {
      props: {
        neuronId: BigInt(10),
        neuronState: NeuronState.DISSOLVING,
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
