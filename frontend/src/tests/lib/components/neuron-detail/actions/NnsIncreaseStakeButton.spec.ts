/**
 * @jest-environment jsdom
 */

import NnsIncreaseStakeButton from "$lib/components/neuron-detail/actions/NnsIncreaseStakeButton.svelte";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("NnsIncreaseStakeButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders increase stake message", () => {
    const { getByText } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NnsIncreaseStakeButton,
      },
    });

    expect(getByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
  });

  it("opens Increase Neuron Stake Modal", async () => {
    const { container } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NnsIncreaseStakeButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = container.querySelector("div.modal");
    expect(modal).toBeInTheDocument();
  });
});
