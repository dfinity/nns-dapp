/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import type { RenderResult } from "@testing-library/svelte";
import MergeNeuronsModal from "../../../../lib/modals/neurons/MergeNeuronsModal.svelte";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockNeuron,
} from "../../../mocks/neurons.mock";

describe("MergeNeuronsModal", () => {
  const mergeableNeuron1 = { ...mockNeuron, neuronId: BigInt(10) };
  const mergeableNeuron2 = { ...mockNeuron, neuronId: BigInt(11) };
  const mergeableNeurons = [mergeableNeuron1, mergeableNeuron2];
  const renderMergeModal = async (
    neurons: NeuronInfo[]
  ): Promise<RenderResult> => {
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscribe(neurons));
    return renderModal({
      component: MergeNeuronsModal,
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", async () => {
    const { queryByText } = await renderMergeModal([mockNeuron]);

    const element = queryByText(en.neurons.merge_neurons_modal_title);
    expect(element).not.toBeNull();
  });

  it("renders disabled button", async () => {
    const { queryByTestId } = await renderMergeModal([mockNeuron]);

    const button = queryByTestId("merge-neurons-confirm-selection-button");
    expect(button).not.toBeNull();
    expect(button?.hasAttribute("disabled")).toBeTruthy();
  });

  it("renders mergeable neurons", async () => {
    const { queryAllByTestId } = await renderMergeModal(mergeableNeurons);

    const neuronCardElements = queryAllByTestId("neuron-card-title");
    expect(neuronCardElements.length).toBe(mergeableNeurons.length);
  });

  it("allows user to select two neurons", async () => {
    const { queryAllByTestId } = await renderMergeModal(mergeableNeurons);

    const neuronCardElements = queryAllByTestId("card");
    expect(neuronCardElements.length).toBe(mergeableNeurons.length);

    const [neuronElement1, neuronElement2] = neuronCardElements;

    expect(neuronElement1.classList.contains("selected")).toBe(false);
    expect(neuronElement2.classList.contains("selected")).toBe(false);

    await fireEvent.click(neuronElement1);
    expect(neuronElement1.classList.contains("selected")).toBe(true);

    await fireEvent.click(neuronElement2);
    expect(neuronElement2.classList.contains("selected")).toBe(true);
  });

  it("allows user to unselect after selecting a neuron", async () => {
    const { queryAllByTestId } = await renderMergeModal(mergeableNeurons);

    const neuronCardElements = queryAllByTestId("card");
    expect(neuronCardElements.length).toBe(mergeableNeurons.length);

    const [neuronElement1] = neuronCardElements;

    expect(neuronElement1.classList.contains("selected")).toBe(false);

    await fireEvent.click(neuronElement1);
    expect(neuronElement1.classList.contains("selected")).toBe(true);

    await fireEvent.click(neuronElement1);
    expect(neuronElement1.classList.contains("selected")).toBe(false);
  });

  it("allows user to select two neurons and move to confirmation screen", async () => {
    const { queryAllByTestId, queryByTestId, queryByText, queryAllByText } =
      await renderMergeModal(mergeableNeurons);

    const neuronCardElements = queryAllByTestId("card");
    expect(neuronCardElements.length).toBe(mergeableNeurons.length);

    const [neuronElement1, neuronElement2] = neuronCardElements;

    expect(neuronElement1.classList.contains("selected")).toBe(false);
    expect(neuronElement2.classList.contains("selected")).toBe(false);

    await fireEvent.click(neuronElement1);
    expect(neuronElement1.classList.contains("selected")).toBe(true);

    await fireEvent.click(neuronElement2);
    expect(neuronElement2.classList.contains("selected")).toBe(true);

    const button = queryByTestId("merge-neurons-confirm-selection-button");
    expect(button).not.toBeNull();

    button && (await fireEvent.click(button));
    expect(
      queryAllByText(en.neurons.merge_neurons_modal_confirm).length
    ).toBeGreaterThan(0);
    expect(queryByText(mergeableNeuron1.neuronId.toString())).not.toBeNull();
  });
});
