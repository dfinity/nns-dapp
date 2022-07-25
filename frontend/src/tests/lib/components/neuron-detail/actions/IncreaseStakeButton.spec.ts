/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import IncreaseStakeButton from "../../../../../lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";

describe("IncreaseStakeButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders increase stake message", () => {
    const { getByText } = render(IncreaseStakeButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(getByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
  });

  it("opens Increase Neuron Stake Modal", async () => {
    const { container } = render(IncreaseStakeButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = container.querySelector("div.modal");
    expect(modal).toBeInTheDocument();
  });
});
