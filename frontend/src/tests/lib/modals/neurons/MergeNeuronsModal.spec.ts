import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import { mergeNeurons, simulateMergeNeurons } from "$lib/api/governance.api";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import MergeNeuronsModal from "$lib/modals/neurons/MergeNeuronsModal.svelte";
import * as authServices from "$lib/services/auth.services";
import { listNeurons } from "$lib/services/neurons.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import type { Account } from "$lib/types/account";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import { createMockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { MergeNeuronsModalPo } from "$tests/page-objects/MergeNeuronsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";

vi.mock("$lib/api/governance.api");

const testIdentity = createMockIdentity(37373);

const getStake = (neuron: NeuronInfo): bigint =>
  neuron.fullNeuron.cachedNeuronStake;

describe("MergeNeuronsModal", () => {
  fakeGovernanceApi.install();

  beforeEach(() => {
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
      testIdentity
    );
    vi.clearAllMocks();
    icpAccountsStore.resetForTesting();
    neuronsStore.reset();
    resetNeuronsApiService();
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
    neurons: fakeGovernanceApi.FakeNeuronParams[],
    hardwareWalletAccounts: Account[] = []
  ): Promise<MergeNeuronsModalPo> => {
    icpAccountsStore.setForTesting({
      main: { ...mockMainAccount, principal: testIdentity.getPrincipal() },
      hardwareWallets: hardwareWalletAccounts,
    });
    fakeGovernanceApi.addNeurons({ identity: testIdentity, neurons });
    await listNeurons();
    const { container } = await renderModal({
      component: MergeNeuronsModal,
    });
    return MergeNeuronsModalPo.under(new JestPageObjectElement(container));
  };

  describe("when mergeable neurons by user", () => {
    const controller = testIdentity.getPrincipal().toText();
    const mergeableNeuron1 = {
      neuronId: BigInt(10),
      state: NeuronState.Locked,
      controller,
      stake: BigInt(12 * E8S_PER_ICP),
    };
    const mergeableNeuron2 = {
      neuronId: BigInt(11),
      state: NeuronState.Locked,
      controller,
      stake: BigInt(34 * E8S_PER_ICP),
    };
    const mergeableNeurons = [mergeableNeuron1, mergeableNeuron2];

    it("renders title", async () => {
      const po = await renderMergeModal([mergeableNeuron1]);
      expect(await po.getTitle()).toBe(en.neurons.merge_neurons_modal_title);
    });

    it("renders disabled button", async () => {
      const po = await renderMergeModal([mergeableNeuron1]);
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

      const sourceNeuron = fakeGovernanceApi.getNeuron({
        identity: testIdentity,
        neuronId: mergeableNeuron1.neuronId,
      });
      const targetNeuron = fakeGovernanceApi.getNeuron({
        identity: testIdentity,
        neuronId: mergeableNeuron2.neuronId,
      });
      await runResolvedPromises();
      expect(getStake(sourceNeuron)).toBe(BigInt(0));
      expect(getStake(targetNeuron)).toBe(
        mergeableNeuron1.stake + mergeableNeuron2.stake
      );
    });

    it("should not simulate merging with feature disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_SIMULATE_MERGE_NEURONS", false);

      const po = await renderMergeModal(mergeableNeurons);

      await selectAndTestTwoNeurons({
        po,
        neurons: mergeableNeurons,
      });

      await po
        .getSelectNeuronsToMergePo()
        .getConfirmSelectionButtonPo()
        .click();

      expect(await po.getConfirmNeuronsMergePo().isPresent()).toBe(true);
      expect(
        await po.getConfirmNeuronsMergePo().getSourceNeuronInfoPo().isPresent()
      ).toBe(true);
      expect(
        await po
          .getConfirmNeuronsMergePo()
          .getSourceNeuronDetailCardPo()
          .isPresent()
      ).toBe(false);
      expect(
        await po.getConfirmNeuronsMergePo().getTargetNeuronInfoPo().isPresent()
      ).toBe(true);
      expect(
        await po
          .getConfirmNeuronsMergePo()
          .getTargetNeuronDetailCardPo()
          .isPresent()
      ).toBe(false);

      await runResolvedPromises();
      expect(await po.getConfirmNeuronsMergePo().hasMergeResultSection()).toBe(
        false
      );
      expect(
        await po
          .getConfirmNeuronsMergePo()
          .getMergedNeuronDetailCardPo()
          .isPresent()
      ).toBe(false);
      expect(simulateMergeNeurons).not.toBeCalled();

      // Make sure no actual merge happened either.
      expect(mergeNeurons).not.toBeCalled();
    });

    it("should simulate merging with feature enabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_SIMULATE_MERGE_NEURONS", true);

      const po = await renderMergeModal(mergeableNeurons);

      await selectAndTestTwoNeurons({
        po,
        neurons: mergeableNeurons,
      });

      await po
        .getSelectNeuronsToMergePo()
        .getConfirmSelectionButtonPo()
        .click();

      expect(await po.getConfirmNeuronsMergePo().isPresent()).toBe(true);
      expect(
        await po.getConfirmNeuronsMergePo().getSourceNeuronInfoPo().isPresent()
      ).toBe(false);
      expect(
        await po
          .getConfirmNeuronsMergePo()
          .getSourceNeuronDetailCardPo()
          .isPresent()
      ).toBe(true);
      expect(
        await po.getConfirmNeuronsMergePo().getTargetNeuronInfoPo().isPresent()
      ).toBe(false);
      expect(
        await po
          .getConfirmNeuronsMergePo()
          .getTargetNeuronDetailCardPo()
          .isPresent()
      ).toBe(true);

      await runResolvedPromises();
      expect(await po.getConfirmNeuronsMergePo().hasMergeResultSection()).toBe(
        true
      );
      const mergedNeuronCard = po
        .getConfirmNeuronsMergePo()
        .getMergedNeuronDetailCardPo();
      expect(await mergedNeuronCard.isPresent()).toBe(true);
      expect(await mergedNeuronCard.getStake()).toBe("46.00 ICP");
      // Just to show where the 46 is coming from:
      expect(mergeableNeuron1.stake + mergeableNeuron2.stake).toBe(
        BigInt(46 * E8S_PER_ICP)
      );

      // Make sure no actual merge happened.
      expect(mergeNeurons).not.toBeCalled();
    });

    it("should show a skeleton card while simulating the merging", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_SIMULATE_MERGE_NEURONS", true);

      const po = await renderMergeModal(mergeableNeurons);

      await selectAndTestTwoNeurons({
        po,
        neurons: mergeableNeurons,
      });

      fakeGovernanceApi.pause();
      await po
        .getSelectNeuronsToMergePo()
        .getConfirmSelectionButtonPo()
        .click();

      await runResolvedPromises();
      expect(await po.getConfirmNeuronsMergePo().hasMergeResultSection()).toBe(
        true
      );
      expect(
        await po.getConfirmNeuronsMergePo().getSkeletonCardPo().isPresent()
      ).toBe(true);
      const mergedNeuronCard = po
        .getConfirmNeuronsMergePo()
        .getMergedNeuronDetailCardPo();
      expect(await mergedNeuronCard.isPresent()).toBe(false);

      fakeGovernanceApi.resume();
      await runResolvedPromises();
      expect(await po.getConfirmNeuronsMergePo().hasMergeResultSection()).toBe(
        true
      );
      expect(
        await po.getConfirmNeuronsMergePo().getSkeletonCardPo().isPresent()
      ).toBe(false);
      expect(await mergedNeuronCard.isPresent()).toBe(true);
    });
  });

  describe("when mergeable neurons by hardware wallet", () => {
    const controller = mockHardwareWalletAccount.principal?.toText() as string;
    const mergeableNeuron1 = {
      neuronId: BigInt(10),
      state: NeuronState.Locked,
      controller,
    };
    const mergeableNeuron2 = {
      neuronId: BigInt(11),
      state: NeuronState.Locked,
      controller,
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
      neuronId: BigInt(10),
      state: NeuronState.Locked,
      controller: mockHardwareWalletAccount.principal?.toText() as string,
    };
    const neuronMain = {
      neuronId: BigInt(11),
      state: NeuronState.Locked,
      controller: testIdentity.getPrincipal().toText(),
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
