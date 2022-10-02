/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import type { RenderResult } from "@testing-library/svelte";
import SplitNeuronModal from "../../../../lib/modals/neurons/SplitNeuronModal.svelte";
import { splitNeuron } from "../../../../lib/services/neurons.services";
import { renderModal } from "../../../mocks/modal.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    splitNeuron: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SplitNeuronModal", () => {
  const renderSplitNeuronModal = async (
    neuron: NeuronInfo
  ): Promise<RenderResult> => {
    return renderModal({
      component: SplitNeuronModal,
      props: { neuron },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderSplitNeuronModal(mockNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the split button button disabled by default", async () => {
    const { queryByTestId } = await renderSplitNeuronModal(mockNeuron);

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have disabled button if value is 0", async () => {
    const { queryByTestId } = await renderSplitNeuronModal(mockNeuron);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 0 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should call split neuron service if amount is valid", async () => {
    const { queryByTestId } = await renderSplitNeuronModal(mockNeuron);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 2.2 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton).not.toBeNull();
    expect(splitButton?.getAttribute("disabled")).toBeNull();

    splitButton && (await fireEvent.click(splitButton));

    expect(splitNeuron).toHaveBeenCalled();
  });
});
