/**
 * @jest-environment jsdom
 */

import NnsStakeMaturityButton from "$lib/components/neuron-detail/actions/NnsStakeMaturityButton.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

describe("NnsStakeMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should open stake maturity modal", async () => {
    const { getByText, getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NnsStakeMaturityButton,
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
        testComponent: NnsStakeMaturityButton,
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
