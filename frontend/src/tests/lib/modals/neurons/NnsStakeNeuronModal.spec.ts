import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import NnsStakeNeuronModal from "$lib/modals/neurons/NnsStakeNeuronModal.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import {
  addHotkeyForHardwareWalletNeuron,
  stakeNeuron,
  updateDelay,
} from "$lib/services/neurons.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsStakeNeuronModalPo } from "$tests/page-objects/NnsStakeNeuronModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { LedgerCanister } from "@dfinity/ledger-icp";
import type { NeuronInfo } from "@dfinity/nns";
import { GovernanceCanister } from "@dfinity/nns";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");
const neuronStakeE8s = 220_000_000n;
const newNeuron: NeuronInfo = {
  ...mockNeuron,
  dissolveDelaySeconds: 0n,
  ageSeconds: 0n,
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: neuronStakeE8s,
  },
};
vi.mock("$lib/services/neurons.services", () => {
  return {
    stakeNeuron: vi
      .fn()
      .mockImplementation(() => Promise.resolve(newNeuron.neuronId)),
    updateDelay: vi.fn().mockResolvedValue(undefined),
    loadNeuron: vi.fn().mockResolvedValue(undefined),
    addHotkeyForHardwareWalletNeuron: vi
      .fn()
      .mockResolvedValue({ success: true }),
    getNeuronFromStore: vi.fn(),
  };
});

vi.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: vi.fn(),
  };
});

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: vi.fn(),
    toastsShow: vi.fn(),
    toastsSuccess: vi.fn(),
  };
});

describe("NnsStakeNeuronModal", () => {
  let queryBalanceSpy: MockInstance;
  const newBalanceE8s = 10_000_000n;

  beforeEach(() => {
    resetIdentity();
    cancelPollAccounts();
    vi.clearAllMocks();

    vi.spyOn(LedgerCanister, "create").mockImplementation(() =>
      mock<LedgerCanister>()
    );
    vi.spyOn(GovernanceCanister, "create").mockImplementation(() =>
      mock<GovernanceCanister>()
    );
    queryBalanceSpy = vi
      .spyOn(ledgerApi, "queryAccountBalance")
      .mockResolvedValue(newBalanceE8s);
  });

  const renderComponent = async ({ onClose }: { onClose?: () => void }) => {
    const { container, component } = await renderModal({
      component: NnsStakeNeuronModal,
    });
    if (onClose) {
      component.$on("nnsClose", onClose);
    }
    return NnsStakeNeuronModalPo.under(new JestPageObjectElement(container));
  };

  describe("main account selection", () => {
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      setAccountsForTesting({
        ...mockAccountsStoreData,
        subAccounts: [mockSubAccount],
      });
    });

    it("should display modal", async () => {
      const po = await renderComponent({});

      expect(await po.isPresent()).toBe(true);
    });

    it("should display accounts with dropdown", async () => {
      const po = await renderComponent({});

      expect(
        await po
          .getNnsStakeNeuronPo()
          .getTransactionFromAccountPo()
          .getSelectAccountDropdownPo()
          .hasDropdown()
      ).toBe(true);
    });

    it("should have disabled Create neuron button", async () => {
      const po = await renderComponent({});

      expect(
        await po.getNnsStakeNeuronPo().getCreateButtonPo().isDisabled()
      ).toBe(true);
    });

    it("should have enabled Create neuron button when entering amount", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);
      expect(
        await po.getNnsStakeNeuronPo().getCreateButtonPo().isDisabled()
      ).toBe(false);
    });

    it("should be able to create a new neuron", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);

      expect(stakeNeuron).not.toBeCalled();

      await po.getNnsStakeNeuronPo().clickCreate();

      expect(stakeNeuron).toBeCalledTimes(1);
      expect(stakeNeuron).toBeCalledWith({
        account: mockMainAccount,
        amount: 22,
        loadNeuron: true,
        asPublicNeuron: false,
      });
    });

    it("should move to update dissolve delay after creating a neuron", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);

      await runResolvedPromises();
      expect(await po.getSetDissolveDelayPo().isPresent()).toBe(false);

      await po.getNnsStakeNeuronPo().clickCreate();

      await runResolvedPromises();
      expect(await po.getSetDissolveDelayPo().isPresent()).toBe(true);
    });

    it("should have the update delay button disabled", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);
      await po.getNnsStakeNeuronPo().clickCreate();
      await runResolvedPromises();

      expect(await po.getSetDissolveDelayPo().isPresent()).toBe(true);
      expect(
        await po.getSetDissolveDelayPo().getUpdateButtonPo().isDisabled()
      ).toBe(true);
    });

    it("should have enabled button for dissolve less than six months", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);
      await po.getNnsStakeNeuronPo().clickCreate();
      await runResolvedPromises();

      expect(
        await po.getSetDissolveDelayPo().getUpdateButtonPo().isDisabled()
      ).toBe(true);

      const FIVE_MONTHS = 30 * 5;
      await po
        .getSetDissolveDelayPo()
        .getInputWithErrorPo()
        .typeText(`${FIVE_MONTHS}`);

      expect(
        await po.getSetDissolveDelayPo().getUpdateButtonPo().isDisabled()
      ).toBe(false);
    });

    it("should be able to create a neuron and see the stake of the new neuron in the dissolve modal", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(2.2);
      await po.getNnsStakeNeuronPo().clickCreate();
      await runResolvedPromises();

      expect(await po.getSetDissolveDelayPo().getNeuronStake()).toBe(
        "2.20 ICP Stake"
      );
    });

    it("should sync balance after staking neuron", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(2.2);

      await runResolvedPromises();
      expect(queryBalanceSpy).not.toBeCalled();
      expect(get(icpAccountsStore).main.balanceUlps).not.toEqual(newBalanceE8s);

      await po.getNnsStakeNeuronPo().clickCreate();

      await runResolvedPromises();
      expect(queryBalanceSpy).toBeCalledTimes(2);
      const selectedAccountIdentifier = mockMainAccount.identifier;
      expect(queryBalanceSpy).toBeCalledWith({
        identity: mockIdentity,
        certified: true,
        icpAccountIdentifier: selectedAccountIdentifier,
      });
      expect(queryBalanceSpy).toBeCalledWith({
        identity: mockIdentity,
        certified: false,
        icpAccountIdentifier: selectedAccountIdentifier,
      });
      // New balance is set in the store.
      expect(get(icpAccountsStore).main.balanceUlps).toEqual(newBalanceE8s);
    });

    it("should be able to change dissolve delay in the confirmation screen", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(2.2);

      await runResolvedPromises();
      expect(queryBalanceSpy).not.toBeCalled();
      expect(get(icpAccountsStore).main.balanceUlps).not.toEqual(newBalanceE8s);

      await po.getNnsStakeNeuronPo().clickCreate();
      await runResolvedPromises();

      const ONE_YEAR = 365;
      await po
        .getSetDissolveDelayPo()
        .getInputWithErrorPo()
        .typeText(`${ONE_YEAR}`);

      await runResolvedPromises();
      expect(await po.getConfirmDissolveDelayPo().isPresent()).toBe(false);

      await po.getSetDissolveDelayPo().clickUpdate();

      await runResolvedPromises();
      expect(await po.getConfirmDissolveDelayPo().isPresent()).toBe(true);
      expect(updateDelay).not.toBeCalled();

      await po.getConfirmDissolveDelayPo().clickConfirm();

      await runResolvedPromises();
      expect(updateDelay).toBeCalledTimes(1);
      expect(updateDelay).toBeCalledWith({
        dissolveDelayInSeconds: ONE_YEAR * SECONDS_IN_DAY,
        neuronId: newNeuron.neuronId,
      });
    });

    it("should go to edit followers when skipping dissolve delay", async () => {
      const po = await renderComponent({});

      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);

      await runResolvedPromises();
      expect(queryBalanceSpy).not.toBeCalled();
      expect(get(icpAccountsStore).main.balanceUlps).not.toEqual(newBalanceE8s);

      await po.getNnsStakeNeuronPo().clickCreate();

      await runResolvedPromises();
      expect(await po.getEditFollowNeuronsPo().isPresent()).toBe(false);

      await po.getSetDissolveDelayPo().clickSkip();

      await runResolvedPromises();
      expect(await po.getEditFollowNeuronsPo().isPresent()).toBe(true);
    });

    it("should trigger close on cancel", async () => {
      const onClose = vi.fn();
      const po = await renderComponent({ onClose });

      await runResolvedPromises();
      expect(onClose).not.toBeCalled();

      await po.getNnsStakeNeuronPo().clickCancel();

      await runResolvedPromises();
      expect(onClose).toBeCalledTimes(1);
    });

    describe("public neuron checkbox", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.reset();
      });

      it("should not display public neuron checkbox when feature flag is false", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_VISIBILITY", false);
        const po = await renderComponent({});

        expect(
          await po
            .getNnsStakeNeuronPo()
            .getAsPublicNeuronCheckboxPo()
            .isPresent()
        ).toBe(false);
      });

      describe("when feature flag is enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_VISIBILITY", true);
        });

        it("should have unchecked public neuron checkbox by default", async () => {
          const po = await renderComponent({});

          expect(
            await po
              .getNnsStakeNeuronPo()
              .getAsPublicNeuronCheckboxPo()
              .isChecked()
          ).toBe(false);
        });

        it("should be able to toggle public neuron checkbox", async () => {
          const po = await renderComponent({});

          await po.getNnsStakeNeuronPo().getAsPublicNeuronCheckboxPo().toggle();
          expect(
            await po
              .getNnsStakeNeuronPo()
              .getAsPublicNeuronCheckboxPo()
              .isChecked()
          ).toBe(true);

          await po.getNnsStakeNeuronPo().getAsPublicNeuronCheckboxPo().toggle();
          expect(
            await po
              .getNnsStakeNeuronPo()
              .getAsPublicNeuronCheckboxPo()
              .isChecked()
          ).toBe(false);
        });

        it("should create a public neuron when checkbox is checked", async () => {
          const po = await renderComponent({});

          await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);
          await po.getNnsStakeNeuronPo().getAsPublicNeuronCheckboxPo().toggle();

          await po.getNnsStakeNeuronPo().clickCreate();

          expect(stakeNeuron).toBeCalledTimes(1);
          expect(stakeNeuron).toBeCalledWith({
            account: mockMainAccount,
            amount: 22,
            loadNeuron: true,
            asPublicNeuron: true,
          });
        });

        it("should display correct text for checkbox and tooltip", async () => {
          const po = await renderComponent({});

          const checkboxLabel = await po
            .getNnsStakeNeuronPo()
            .getAsPublicNeuronCheckboxLabelText();
          expect(checkboxLabel).toBe("Create as a public neuron");

          const tooltipText = await po
            .getNnsStakeNeuronPo()
            .getAsPublicNeuronTooltipPo()
            .getTooltipText();
          expect(tooltipText).toBe(
            "Public neurons reveal more information about themselves including how they vote on proposals."
          );
        });
      });
    });
  });

  describe("hardware wallet account selection", () => {
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [], certified: true });
      setAccountsForTesting({
        ...mockAccountsStoreData,
        hardwareWallets: [mockHardwareWalletAccount],
      });
    });

    const createNeuron = async (po: NnsStakeNeuronModalPo) => {
      await po
        .getNnsStakeNeuronPo()
        .getTransactionFromAccountPo()
        .selectAccount(mockHardwareWalletAccount.name);
      await po.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(22);
      await po.getNnsStakeNeuronPo().clickCreate();
      await runResolvedPromises();
    };

    it("should create neuron for hardwareWallet and close modal if hotkey is not added", async () => {
      const onClose = vi.fn();
      const po = await renderComponent({ onClose });
      await createNeuron(po);

      expect(await po.getAddUserToHotkeysPo().isPresent()).toBe(true);

      expect(onClose).not.toBeCalled();

      await po.getAddUserToHotkeysPo().clickSkip();

      expect(onClose).toBeCalledTimes(1);
      expect(addHotkeyForHardwareWalletNeuron).not.toBeCalled();
    });

    it("should create neuron for hardwareWallet and add dissolve delay", async () => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      const po = await renderComponent({});
      await createNeuron(po);

      expect(addHotkeyForHardwareWalletNeuron).not.toBeCalled();

      await po.getAddUserToHotkeysPo().clickAddHotkey();

      expect(addHotkeyForHardwareWalletNeuron).toBeCalled();
      await runResolvedPromises();

      const ONE_YEAR = 365;
      await po.getSetDissolveDelayPo().waitFor();
      await po.getSetDissolveDelayPo().getInputWithErrorPo().waitFor();
      await po
        .getSetDissolveDelayPo()
        .getInputWithErrorPo()
        .typeText(`${ONE_YEAR}`);
      await po.getSetDissolveDelayPo().clickUpdate();

      await runResolvedPromises();
      expect(updateDelay).not.toBeCalled();

      await po.getConfirmDissolveDelayPo().clickConfirm();

      await runResolvedPromises();
      expect(updateDelay).toBeCalledTimes(1);
      expect(updateDelay).toBeCalledWith({
        dissolveDelayInSeconds: ONE_YEAR * SECONDS_IN_DAY,
        neuronId: newNeuron.neuronId,
      });
    });
  });

  describe("when accounts are not loaded", () => {
    let resolveQueryAccount;

    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      resetAccountsForTesting();
      const mainBalanceE8s = 10_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );

      resolveQueryAccount = undefined;
      vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(
        () =>
          new Promise<AccountDetails>((resolve) => {
            resolveQueryAccount = () => resolve(mockAccountDetails);
          })
      );
    });

    it("should load and then show the accounts", async () => {
      const po = await renderComponent({});

      await runResolvedPromises();
      expect(
        await po
          .getNnsStakeNeuronPo()
          .getTransactionFromAccountPo()
          .getSelectAccountDropdownPo()
          .hasDropdown()
      ).toBe(false);

      resolveQueryAccount();

      await runResolvedPromises();
      expect(
        await po
          .getNnsStakeNeuronPo()
          .getTransactionFromAccountPo()
          .getSelectAccountDropdownPo()
          .hasDropdown()
      ).toBe(true);
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: MockInstance;
    beforeEach(() => {
      resetAccountsForTesting();
      vi.clearAllTimers();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = 10_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      spyQueryAccount = vi
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should stop polling", async () => {
      const { unmount } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);

      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const callsBeforeLeaving = 3;
      while (expectedCalls < callsBeforeLeaving) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
      }
      unmount();

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
    });
  });
});
