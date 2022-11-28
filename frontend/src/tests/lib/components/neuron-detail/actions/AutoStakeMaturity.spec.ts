/**
 * @jest-environment jsdom
 */

import AutoStakeMaturity from "$lib/components/neuron-detail/actions/AutoStakeMaturity.svelte";
import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
import { fireEvent, render } from "@testing-library/svelte";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

jest.mock("$lib/services/neurons.services", () => {
  return {
    toggleAutoStakeMaturity: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("AutoStakeMaturity", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders checkbox", () => {
    const neuron = {
      ...mockNeuron,
    };
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: AutoStakeMaturity,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  const neuronProps = (autoStakeMaturity: boolean | undefined) => ({
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      autoStakeMaturity,
    },
  });

  const testCheckBox = (autoStakeMaturity: boolean | undefined) => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: neuronProps(autoStakeMaturity),
        testComponent: AutoStakeMaturity,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    if (autoStakeMaturity === true) {
      expect(inputElement.checked).toBeTruthy();
      return;
    }

    expect(inputElement.checked).toBeFalsy();
  };

  it("renders checked if auto stake already on", () => testCheckBox(true));

  it("renders unchecked if auto stake already false", () =>
    testCheckBox(false));

  it("renders unchecked if auto stake is undefined", () =>
    testCheckBox(undefined));

  const toggleAutoStake = async ({
    neuronAutoStakeMaturity,
  }: {
    neuronAutoStakeMaturity: boolean | undefined;
  }) => {
    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: neuronProps(neuronAutoStakeMaturity),
        testComponent: AutoStakeMaturity,
      },
    });

    const inputElement = container.querySelector("input[type='checkbox']");
    expect(inputElement).not.toBeNull();

    inputElement && (await fireEvent.click(inputElement));

    const modal = queryByTestId("auto-stake-confirm-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
  };

  it("should call toggleAutoStakeMaturity neuron service on confirmation", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: undefined });
    expect(toggleAutoStakeMaturity).toBeCalled();
  });
});
