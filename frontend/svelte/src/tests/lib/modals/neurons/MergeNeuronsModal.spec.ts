/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import type { RenderResult } from "@testing-library/svelte";
import MergeNeuronsModal from "../../../../lib/modals/neurons/MergeNeuronsModal.svelte";
import { mergeNeurons } from "../../../../lib/services/neurons.services";
import { authStore } from "../../../../lib/stores/auth.store";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    mergeNeurons: jest.fn().mockResolvedValue(BigInt(10)),
  };
});

describe("MergeNeuronsModal", () => {
  const controller = mockIdentity.getPrincipal().toText();
  const mergeableNeuron1 = {
    ...mockNeuron,
    neuronId: BigInt(10),
    fullNeuron: { ...mockFullNeuron, controller },
  };
  const mergeableNeuron2 = {
    ...mockNeuron,
    neuronId: BigInt(11),
    fullNeuron: { ...mockFullNeuron, controller },
  };
  const mergeableNeurons = [mergeableNeuron1, mergeableNeuron2];
  const renderMergeModal = async (
    neurons: NeuronInfo[]
  ): Promise<RenderResult> => {
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscribe(neurons));
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    return renderModal({
      component: MergeNeuronsModal,
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const selectAndTestTwoNeurons = async ({ queryAllByTestId }) => {
    const neuronCardElements = queryAllByTestId("card");
    expect(neuronCardElements.length).toBe(mergeableNeurons.length);

    let [neuronElement1, neuronElement2] = neuronCardElements;

    expect(neuronElement2.classList.contains("selected")).toBe(false);
    expect(neuronElement1.classList.contains("selected")).toBe(false);

    await fireEvent.click(neuronElement1);
    // Elements might change after every click
    [neuronElement1, neuronElement2] = queryAllByTestId("card");

    expect(neuronElement1.classList.contains("selected")).toBe(true);

    await fireEvent.click(neuronElement2);
    // Elements might change after every click
    [neuronElement1, neuronElement2] = queryAllByTestId("card");

    expect(neuronElement2.classList.contains("selected")).toBe(true);
  };

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

    await selectAndTestTwoNeurons({ queryAllByTestId });
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

    await selectAndTestTwoNeurons({ queryAllByTestId });

    const button = queryByTestId("merge-neurons-confirm-selection-button");
    expect(button).not.toBeNull();

    button && (await fireEvent.click(button));

    // Confirm Merge Screen
    expect(
      queryAllByText(en.neurons.merge_neurons_modal_confirm).length
    ).toBeGreaterThan(0);
    expect(queryByText(mergeableNeuron1.neuronId.toString())).not.toBeNull();
  });

  it("allows user to select two neurons and merge them", async () => {
    const { queryAllByTestId, queryByTestId, queryAllByText } =
      await renderMergeModal(mergeableNeurons);

    await selectAndTestTwoNeurons({ queryAllByTestId });

    const button = queryByTestId("merge-neurons-confirm-selection-button");
    expect(button).not.toBeNull();

    button && (await fireEvent.click(button));

    // Confirm Merge Screen
    expect(
      queryAllByText(en.neurons.merge_neurons_modal_confirm).length
    ).toBeGreaterThan(0);

    const confirmMergeButton = queryByTestId("confirm-merge-neurons-button");

    confirmMergeButton && (await fireEvent.click(confirmMergeButton));

    expect(mergeNeurons).toBeCalled();
  });
});
