/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import StakeMaturityButton from "../../../../../lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";

describe("StakeMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders stake maturity message", () => {
    const { getByText } = render(StakeMaturityButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(getByText(en.neuron_detail.stake_maturity)).toBeInTheDocument();
  });

  it("opens Merge Maturity Modal", async () => {
    const { container, queryByTestId } = render(StakeMaturityButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("merge-maturity-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
