/**
 * @jest-environment jsdom
 */

import SnsAutoStakeMaturity from "$lib/components/sns-neuron-detail/actions/SnsAutoStakeMaturity.svelte";
import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
import { fireEvent, render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../../../mocks/sns-neurons.mock";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    toggleAutoStakeMaturity: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsAutoStakeMaturity", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders checkbox", () => {
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  const testCheckBox = (autoStakeMaturity: boolean | undefined) => {
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          auto_stake_maturity: [autoStakeMaturity],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
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
    const { container, queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          auto_stake_maturity: [neuronAutoStakeMaturity],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
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
