/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import StakeMaturityButton from "../../../../../lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";

describe("StakeMaturityButton", () => {
  it("should open stake maturity modal", async () => {
    const { getByText, getByTestId } = render(StakeMaturityButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    fireEvent.click(getByTestId("stake-maturity-button") as HTMLButtonElement);

    expect(
      getByText(en.neuron_detail.stake_maturity_modal_title)
    ).toBeInTheDocument();
  });
});
