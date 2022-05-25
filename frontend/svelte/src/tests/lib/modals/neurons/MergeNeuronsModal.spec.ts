/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import type { RenderResult } from "@testing-library/svelte";
import MergeNeuronsModal from "../../../../lib/modals/neurons/MergeNeuronsModal.svelte";
import { mergeNeurons } from "../../../../lib/services/neurons.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import type { Account } from "../../../../lib/types/account";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
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
    getNeuronFromStore: jest.fn(),
  };
});

describe("MergeNeuronsModal", () => {
  const selectAndTestTwoNeurons = async ({ queryAllByTestId, neurons }) => {
    const neuronCardElements = queryAllByTestId("neuron-card");
    expect(neuronCardElements.length).toBe(neurons.length);

    let [neuronElement1, neuronElement2] = neuronCardElements;

    expect(neuronElement2.classList.contains("selected")).toBe(false);
    expect(neuronElement1.classList.contains("selected")).toBe(false);

    await fireEvent.click(neuronElement1);
    // Elements might change after every click
    [neuronElement1, neuronElement2] = queryAllByTestId("neuron-card");

    expect(neuronElement1.classList.contains("selected")).toBe(true);

    await fireEvent.click(neuronElement2);
    // Elements might change after every click
    [neuronElement1, neuronElement2] = queryAllByTestId("neuron-card");

    expect(neuronElement2.classList.contains("selected")).toBe(true);
  };
  const renderMergeModal = async (
    neurons: NeuronInfo[],
    hardwareWalletAccounts: Account[] = []
  ): Promise<RenderResult> => {
    accountsStore.set({
      main: mockMainAccount,
      hardwareWallets: hardwareWalletAccounts,
    });
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscribe(neurons));
    return renderModal({
      component: MergeNeuronsModal,
    });
  };
  describe("when mergeable neurons by user", () => {
    const controller = mockMainAccount.principal?.toText() as string;
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

    afterEach(() => {
      jest.clearAllMocks();
      accountsStore.reset();
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

      await selectAndTestTwoNeurons({
        queryAllByTestId,
        neurons: mergeableNeurons,
      });
    });

    it("allows user to unselect after selecting a neuron", async () => {
      const { queryAllByTestId } = await renderMergeModal(mergeableNeurons);

      const neuronCardElements = queryAllByTestId("neuron-card");
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

      await selectAndTestTwoNeurons({
        queryAllByTestId,
        neurons: mergeableNeurons,
      });

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

      await selectAndTestTwoNeurons({
        queryAllByTestId,
        neurons: mergeableNeurons,
      });

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

  describe("when mergeable neurons by hardware wallet", () => {
    const controller = mockHardwareWalletAccount.principal?.toText() as string;
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
    it("allows user to select two neurons and merge them", async () => {
      const { queryAllByTestId, queryByTestId, queryAllByText } =
        await renderMergeModal(mergeableNeurons, [mockHardwareWalletAccount]);

      await selectAndTestTwoNeurons({
        queryAllByTestId,
        neurons: mergeableNeurons,
      });

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

  describe("when neurons from main user and hardware wallet", () => {
    const neuronHW = {
      ...mockNeuron,
      neuronId: BigInt(10),
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockHardwareWalletAccount.principal?.toText() as string,
      },
    };
    const neuronMain = {
      ...mockNeuron,
      neuronId: BigInt(11),
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockMainAccount.principal?.toText() as string,
      },
    };
    const neurons = [neuronHW, neuronMain];
    it("does not allow to select two neurons with different controller", async () => {
      const { queryAllByTestId } = await renderMergeModal(neurons, [
        mockHardwareWalletAccount,
      ]);

      const neuronCardElements = queryAllByTestId("neuron-card");
      expect(neuronCardElements.length).toBe(neurons.length);

      const [neuronElement1] = neuronCardElements;

      expect(neuronElement1.classList.contains("selected")).toBe(false);

      await fireEvent.click(neuronElement1);
      expect(neuronElement1.classList.contains("selected")).toBe(true);

      // We need to query again because the elements have changed because of the Tooltip.
      const neuronCardElementsAfterSelection = queryAllByTestId("neuron-card");
      const [, neuronElement2] = neuronCardElementsAfterSelection;

      expect(neuronElement2.classList.contains("disabled")).toBe(true);
    });
  });
});
