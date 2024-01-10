import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import NnsStakeNeuronModal from "$lib/modals/neurons/NnsStakeNeuronModal.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import {
  addHotkeyForHardwareWalletNeuron,
  stakeNeuron,
  updateDelay,
} from "$lib/services/neurons.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { assertNonNullish, clickByTestId } from "$tests/utils/utils.test-utils";
import { LedgerCanister } from "@dfinity/ledger-icp";
import type { NeuronInfo } from "@dfinity/nns";
import { GovernanceCanister } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";
import type { SpyInstance } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");
const neuronStake = 2.2;
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
  beforeEach(() => {
    resetIdentity();
    cancelPollAccounts();
    vi.clearAllMocks();
  });

  describe("main account selection", () => {
    let queryBalanceSpy: SpyInstance;
    const newBalanceE8s = 10_000_000n;
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        subAccounts: [mockSubAccount],
      });
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

    it("should display modal", async () => {
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    it("should display accounts with dropdown", async () => {
      const { queryByTestId } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      await waitFor(() =>
        expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
      );
    });

    it("should have disabled Create neuron button", async () => {
      const { container, queryByText } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.getAttribute("disabled")).not.toBeNull();
    });

    it("should have enabled Create neuron button when entering amount", async () => {
      const { container, queryByText } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.getAttribute("disabled")).toBeNull();
    });

    it("should be able to create a new neuron", async () => {
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      expect(stakeNeuron).toBeCalled();
    });

    it("should move to update dissolve delay after creating a neuron", async () => {
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      await waitFor(() =>
        expect(
          container.querySelector("[data-tid='go-confirm-delay-button']")
        ).not.toBeNull()
      );
    });

    it("should have the update delay button disabled", async () => {
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      await waitFor(() =>
        expect(
          container.querySelector("[data-tid='go-confirm-delay-button']")
        ).not.toBeNull()
      );
      const updateDelayButton = container.querySelector(
        '[data-tid="go-confirm-delay-button"]'
      );
      expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
    });

    it("should have enabled button for dissolve less than six months", async () => {
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      await waitFor(() =>
        expect(
          container.querySelector("input[name='dissolve_delay']")
        ).not.toBeNull()
      );
      const inputElement = container.querySelector(
        "input[name='dissolve_delay']"
      );

      const FIVE_MONTHS = 30 * 5;
      inputElement &&
        (await fireEvent.input(inputElement, {
          target: { value: FIVE_MONTHS },
        }));

      const updateDelayButton = container.querySelector(
        '[data-tid="go-confirm-delay-button"]'
      );
      expect(updateDelayButton?.getAttribute("disabled")).toBeNull();
    });

    it("should be able to create a neuron and see the stake of the new neuron in the dissolve modal", async () => {
      const { container, getByText } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input &&
        (await fireEvent.input(input, { target: { value: neuronStake } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      await waitFor(() =>
        expect(
          container.querySelector("input[name='dissolve_delay']")
        ).not.toBeNull()
      );

      expect(
        getByText(formatVotingPower(neuronStakeE8s), { exact: false })
      ).not.toBeNull();
    });

    it("should sync balance after staking neuron", async () => {
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      const nonNullishInput = assertNonNullish(input);
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      await fireEvent.input(nonNullishInput, {
        target: { value: neuronStake },
      });

      expect(queryBalanceSpy).not.toBeCalled();

      const createButton = container.querySelector('button[type="submit"]');
      const nonNullishButton = assertNonNullish(createButton);
      await fireEvent.click(nonNullishButton);

      await waitFor(() => expect(queryBalanceSpy).toBeCalledTimes(2));
      // First card is clicked. First card is the main account.
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
      const { container } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      await waitFor(() =>
        expect(
          container.querySelector("input[name='dissolve_delay']")
        ).not.toBeNull()
      );
      const inputElement = container.querySelector(
        "input[name='dissolve_delay']"
      );

      const ONE_YEAR = 365;
      inputElement &&
        (await fireEvent.input(inputElement, {
          target: { value: ONE_YEAR },
        }));

      const goToConfirmDelayButton = container.querySelector(
        '[data-tid="go-confirm-delay-button"]'
      );
      await waitFor(() =>
        expect(goToConfirmDelayButton?.getAttribute("disabled")).toBeNull()
      );

      goToConfirmDelayButton && (await fireEvent.click(goToConfirmDelayButton));

      await waitFor(() =>
        expect(
          container.querySelector(
            '[data-tid="confirm-dissolve-delay-container"]'
          )
        ).not.toBeNull()
      );

      const confirmButton = container.querySelector(
        '[data-tid="confirm-delay-button"]'
      );
      confirmButton && (await fireEvent.click(confirmButton));

      await waitFor(() => expect(updateDelay).toBeCalled());
    });

    it("should go to edit followers when skipping dissolve delay", async () => {
      const { container, queryByTestId } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      // SCREEN: Create Neuron
      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      // SCREEN: Set Dissolve Delay
      await waitFor(() =>
        expect(
          container.querySelector("input[name='dissolve_delay']")
        ).not.toBeNull()
      );

      const skipButton = queryByTestId("cancel-neuron-delay");

      skipButton && (await fireEvent.click(skipButton));

      // SCREEN: Edit Followers
      await waitFor(() =>
        expect(queryByTestId("edit-followers-screen")).not.toBeNull()
      );
    });

    it("should trigger close on cancel", async () => {
      const { component, getByTestId } = await renderModal({
        component: NnsStakeNeuronModal,
      });

      const onClose = vi.fn();
      component.$on("nnsClose", onClose);

      await clickByTestId(getByTestId, "stake-neuron-button-cancel");

      await waitFor(() => expect(onClose).toBeCalled());
    });
  });

  describe("hardware wallet account selection", () => {
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [], certified: true });
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        hardwareWallets: [mockHardwareWalletAccount],
      });
    });

    const createNeuron = async ({
      getByTestId,
      container,
    }: RenderResult<SvelteComponent>) => {
      // SCREEN: Select Hardware Wallet Account
      const selectElement = getByTestId("select-account-dropdown");

      selectElement &&
        fireEvent.change(selectElement, {
          target: { value: mockHardwareWalletAccount.identifier },
        });

      // SCREEN: Create Neuron
      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));
    };

    it("should create neuron for hardwareWallet and close modal if hotkey is not added", async () => {
      const result = await renderModal({
        component: NnsStakeNeuronModal,
      });

      await createNeuron(result);

      const { queryByTestId, component } = result;

      // SCREEN: Add NNS App Principal as Hotkey
      await waitFor(() =>
        expect(queryByTestId("add-principal-to-hotkeys-modal")).not.toBeNull()
      );
      const onClose = vi.fn();
      component.$on("nnsClose", onClose);

      const skipButton = queryByTestId("skip-add-principal-to-hotkey-modal");

      skipButton && (await fireEvent.click(skipButton));

      await waitFor(() => expect(onClose).toBeCalled());
    });

    it("should create neuron for hardwareWallet and add dissolve delay", async () => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      const result = await renderModal({
        component: NnsStakeNeuronModal,
      });

      await createNeuron(result);

      const { container, queryByTestId } = result;

      // SCREEN: Add NNS App Principal as Hotkey
      await waitFor(() =>
        expect(queryByTestId("add-principal-to-hotkeys-modal")).not.toBeNull()
      );

      const addHotkeyButton = queryByTestId(
        "confirm-add-principal-to-hotkey-modal"
      );

      addHotkeyButton && (await fireEvent.click(addHotkeyButton));

      expect(addHotkeyForHardwareWalletNeuron).toBeCalled();

      await waitFor(() =>
        expect(
          container.querySelector("input[name='dissolve_delay']")
        ).not.toBeNull()
      );
      const inputElement = container.querySelector(
        "input[name='dissolve_delay']"
      );

      const ONE_YEAR = 365;
      inputElement &&
        (await fireEvent.input(inputElement, {
          target: { value: ONE_YEAR },
        }));

      const goToConfirmDelayButton = container.querySelector(
        '[data-tid="go-confirm-delay-button"]'
      );
      await waitFor(() =>
        expect(goToConfirmDelayButton?.getAttribute("disabled")).toBeNull()
      );

      goToConfirmDelayButton && (await fireEvent.click(goToConfirmDelayButton));

      await waitFor(() =>
        expect(
          container.querySelector(
            '[data-tid="confirm-dissolve-delay-container"]'
          )
        ).not.toBeNull()
      );

      const confirmButton = container.querySelector(
        '[data-tid="confirm-delay-button"]'
      );
      confirmButton && (await fireEvent.click(confirmButton));

      await waitFor(() => expect(updateDelay).toBeCalled());
    });
  });

  describe("when accounts are not loaded", () => {
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      icpAccountsStore.resetForTesting();
      const mainBalanceE8s = 10_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
    });
    it("should load and then show the accounts", async () => {
      const { queryByTestId } = await renderModal({
        component: NnsStakeNeuronModal,
      });
      expect(queryByTestId("account-card")).not.toBeInTheDocument();

      // Component is rendered after the accounts are loaded
      await waitFor(() =>
        expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
      );
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: SpyInstance;
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
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
