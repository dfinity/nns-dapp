/**
 * @jest-environment jsdom
 */

import MergeNeuronsModal from "$lib/modals/neurons/MergeNeuronsModal.svelte";
import { mergeNeurons } from "$lib/services/neurons.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import type { Account } from "$lib/types/account";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import { MergeNeuronsModalPo } from "$tests/page-objects/MergeNeuronsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";

jest.mock("$lib/services/neurons.services", () => {
  return {
    mergeNeurons: jest.fn().mockResolvedValue(BigInt(10)),
    getNeuronFromStore: jest.fn(),
  };
});

describe("MergeNeuronsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    accountsStore.resetForTesting();
  });

  const selectAndTestTwoNeurons = async ({ po, neurons }) => {
    const selectNeurons = po.getSelectNeuronsToMergePo();
    const neuronCards = await selectNeurons.getNnsNeuronCardPos();
    expect(neuronCards.length).toBe(neurons.length);
    let [neuronCard1, neuronCard2] = neuronCards;

    expect(await neuronCard1.isSelected()).toBe(false);
    expect(await neuronCard2.isSelected()).toBe(false);

    await neuronCard1.click();
    // Elements might change after every click
    [neuronCard1, neuronCard2] = await selectNeurons.getNnsNeuronCardPos();
    expect(await neuronCard1.isSelected()).toBe(true);
    expect(await neuronCard2.isSelected()).toBe(false);

    await neuronCard2.click();
    // Elements might change after every click
    [neuronCard1, neuronCard2] = await selectNeurons.getNnsNeuronCardPos();
    expect(await neuronCard1.isSelected()).toBe(true);
    expect(await neuronCard2.isSelected()).toBe(true);
  };

  const renderMergeModal = async (
    neurons: NeuronInfo[],
    hardwareWalletAccounts: Account[] = []
  ): Promise<MergeNeuronsModalPo> => {
    accountsStore.setForTesting({
      main: mockMainAccount,
      hardwareWallets: hardwareWalletAccounts,
    });
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscribe(neurons));
    const { container } = await renderModal({
      component: MergeNeuronsModal,
    });
    return MergeNeuronsModalPo.under(new JestPageObjectElement(container));
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

    it("renders title", async () => {
      const po = await renderMergeModal([mockNeuron]);
      expect(await po.getTitle()).toBe(en.neurons.merge_neurons_modal_title);
    });

    it("renders disabled button", async () => {
      const po = await renderMergeModal([mockNeuron]);
      const selectNeurons = po.getSelectNeuronsToMergePo();

      expect(
        await selectNeurons.getConfirmSelectionButtonPo().isDisabled()
      ).toBe(true);
    });

    it("renders mergeable neurons", async () => {
      const po = await renderMergeModal(mergeableNeurons);
      const selectNeurons = po.getSelectNeuronsToMergePo();

      expect((await selectNeurons.getNnsNeuronCardPos()).length).toBe(
        mergeableNeurons.length
      );
    });

    it("allows user to select two neurons", async () => {
      const po = await renderMergeModal(mergeableNeurons);

      await selectAndTestTwoNeurons({
        po,
        neurons: mergeableNeurons,
      });
    });

    it("allows user to unselect after selecting a neuron", async () => {
      const po = await renderMergeModal(mergeableNeurons);

      const neuronCards = await po
        .getSelectNeuronsToMergePo()
        .getNnsNeuronCardPos();
      expect(neuronCards.length).toBe(mergeableNeurons.length);
      const [neuronCard1, _neuronCard2] = neuronCards;

      expect(await neuronCard1.isSelected()).toBe(false);

      await neuronCard1.click();
      expect(await neuronCard1.isSelected()).toBe(true);

      await neuronCard1.click();
      expect(await neuronCard1.isSelected()).toBe(false);
    });

    it("allows user to select two neurons and move to confirmation screen", async () => {
      const po = await renderMergeModal(mergeableNeurons);

      await selectAndTestTwoNeurons({
        po,
        neurons: mergeableNeurons,
      });

      await po
        .getSelectNeuronsToMergePo()
        .getConfirmSelectionButtonPo()
        .click();

      // Confirm Merge Screen
      expect(await po.getConfirmNeuronsMergePo().isPresent()).toBe(true);
      expect(await po.getConfirmNeuronsMergePo().getSourceNeuronId()).toBe(
        mergeableNeuron1.neuronId.toString()
      );
      expect(await po.getConfirmNeuronsMergePo().getTargetNeuronId()).toBe(
        mergeableNeuron2.neuronId.toString()
      );
    });

    it("allows user to select two neurons and merge them", async () => {
      const po = await renderMergeModal(mergeableNeurons);

      await selectAndTestTwoNeurons({
        po,
        neurons: mergeableNeurons,
      });

      await po
        .getSelectNeuronsToMergePo()
        .getConfirmSelectionButtonPo()
        .click();

      // Confirm Merge Screen
      await po.getConfirmNeuronsMergePo().getConfirmMergeButtonPo().click();

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

    it("allows user to select neurons", async () => {
      const po = await renderMergeModal(mergeableNeurons, [
        mockHardwareWalletAccount,
      ]);

      const selectNeurons = po.getSelectNeuronsToMergePo();
      const neuronCards = await selectNeurons.getNnsNeuronCardPos();
      expect(neuronCards.length).toBe(mergeableNeurons.length);
      let [neuronCard1, neuronCard2] = neuronCards;

      expect(await neuronCard1.isSelected()).toBe(false);
      expect(await neuronCard2.isSelected()).toBe(false);

      await neuronCard1.click();

      // Elements might change after every click
      [neuronCard1, neuronCard2] = await selectNeurons.getNnsNeuronCardPos();
      expect(await neuronCard1.isSelected()).toBe(true);
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
    const neurons = [neuronMain, neuronHW];

    it("does not allow to select two neurons with different controller", async () => {
      const po = await renderMergeModal(neurons, [mockHardwareWalletAccount]);

      const selectNeurons = po.getSelectNeuronsToMergePo();
      const neuronCards = await selectNeurons.getNnsNeuronCardPos();
      expect(neuronCards.length).toBe(neurons.length);

      let [neuronCard1, neuronCard2] = neuronCards;
      expect(await neuronCard1.isSelected()).toBe(false);
      expect(await neuronCard2.isDisabled()).toBe(false);

      // Select the neuron controlled by user
      await neuronCard1.click();

      // We need to query again because the elements have changed because of the Tooltip.
      [neuronCard1, neuronCard2] = await selectNeurons.getNnsNeuronCardPos();
      expect(await neuronCard1.isSelected()).toBe(true);
      expect(await neuronCard2.isDisabled()).toBe(true);
    });
  });
});
