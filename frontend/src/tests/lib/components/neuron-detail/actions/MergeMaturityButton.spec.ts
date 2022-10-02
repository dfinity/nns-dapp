/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import MergeMaturityButton from "../../../../../lib/components/neuron-detail/actions/MergeMaturityButton.svelte";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";

describe("MergeMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders merge maturity message", () => {
    const { getByText } = render(MergeMaturityButton, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(getByText(en.neuron_detail.merge_maturity)).toBeInTheDocument();
  });

  it("opens Merge Maturity Modal", async () => {
    const { container, queryByTestId } = render(MergeMaturityButton, {
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
