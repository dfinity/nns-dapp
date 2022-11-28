/**
 * @jest-environment jsdom
 */

import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

describe("StakeMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders stake maturity message", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: mockNeuron,
        testComponent: StakeMaturityButton,
      },
    });

    expect(getByText(en.neuron_detail.stake_maturity)).toBeInTheDocument();
  });

  it("should open stake maturity modal", async () => {
    const { getByText, getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: mockNeuron,
        testComponent: StakeMaturityButton,
      },
    });

    fireEvent.click(getByTestId("stake-maturity-button") as HTMLButtonElement);

    await waitFor(() =>
      expect(
        getByText(en.neuron_detail.stake_maturity_modal_title)
      ).toBeInTheDocument()
    );
  });

  it("should be disabled if no maturity to stake", async () => {
    const { getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            maturityE8sEquivalent: BigInt(0),
          },
        },
        testComponent: StakeMaturityButton,
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
