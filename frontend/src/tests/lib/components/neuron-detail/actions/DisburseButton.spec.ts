/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import DisburseButton from "../../../../../lib/components/neuron-detail/actions/DisburseButton.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";

describe("DisburseButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    const { getByText } = render(DisburseButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("opens DisburseNeuronModal", async () => {
    const { container, queryByTestId } = render(DisburseButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
