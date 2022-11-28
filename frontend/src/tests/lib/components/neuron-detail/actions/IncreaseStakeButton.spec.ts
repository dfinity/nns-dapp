/**
 * @jest-environment jsdom
 */

import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("IncreaseStakeButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders increase stake message", () => {
    const { getByText } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: IncreaseStakeButton,
      },
    });

    expect(getByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
  });

  it("opens Increase Neuron Stake Modal", async () => {
    const { container, getByTestId } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: IncreaseStakeButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = container.querySelector("div.modal");
    expect(modal).toBeInTheDocument();
  });
});
