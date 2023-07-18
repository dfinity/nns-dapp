/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import NnsStakeNeuronModal from "$lib/modals/neurons/NnsStakeNeuronModal.svelte";
import { cancelPollAccounts } from "$lib/services/accounts.services";
import {
  addHotkeyForHardwareWalletNeuron,
  stakeNeuron,
  updateDelay,
} from "$lib/services/neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { assertNonNullish, clickByTestId } from "$tests/utils/utils.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/icp-ledger.api");
const neuronStake = 2.2;
const neuronStakeE8s = BigInt(Math.round(neuronStake * E8S_PER_ICP));
const newNeuron: NeuronInfo = {
  ...mockNeuron,
  dissolveDelaySeconds: BigInt(0),
  ageSeconds: BigInt(0),
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: neuronStakeE8s,
  },
};
jest.mock("$lib/services/neurons.services", () => {
  return {
    stakeNeuron: jest
      .fn()
      .mockImplementation(() => Promise.resolve(newNeuron.neuronId)),
    updateDelay: jest.fn().mockResolvedValue(undefined),
    loadNeuron: jest.fn().mockResolvedValue(undefined),
    addHotkeyForHardwareWalletNeuron: jest
      .fn()
      .mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
  };
});

jest.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: jest.fn(),
    toastsShow: jest.fn(),
    toastsSuccess: jest.fn(),
  };
});

describe("NnsStakeNeuronModal", () => {
  beforeEach(() => {
    cancelPollAccounts();
    jest.clearAllMocks();
  });

  describe("main account selection", () => {
    let queryBalanceSpy: jest.SpyInstance;
    const newBalanceE8s = BigInt(10_000_000);
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        subAccounts: [mockSubAccount],
      });
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());
      jest
        .spyOn(GovernanceCanister, "create")
        .mockImplementation(() => mock<GovernanceCanister>());
      queryBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(newBalanceE8s);
    });

    afterEach(() => {
      neuronsStore.setNeurons({ neurons: [], certified: true });
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

    it("should have disabled button for dissolve less than six months", async () => {
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
        expect(container.querySelector('input[type="range"]')).not.toBeNull()
      );
      const inputRange = container.querySelector('input[type="range"]');

      const FIVE_MONTHS = 60 * 60 * 24 * 30 * 5;
      inputRange &&
        (await fireEvent.input(inputRange, {
          target: { value: FIVE_MONTHS },
        }));

      const updateDelayButton = container.querySelector(
        '[data-tid="go-confirm-delay-button"]'
      );
      expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
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
        expect(container.querySelector('input[type="range"]')).not.toBeNull()
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
      expect(get(icpAccountsStore).main.balanceE8s).toEqual(newBalanceE8s);
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
        expect(container.querySelector('input[type="range"]')).not.toBeNull()
      );
      const inputRange = container.querySelector('input[type="range"]');

      const ONE_YEAR = 60 * 60 * 24 * 365;
      inputRange &&
        (await fireEvent.input(inputRange, {
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
        expect(container.querySelector('input[type="range"]')).not.toBeNull()
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

      const onClose = jest.fn();
      component.$on("nnsClose", onClose);

      await clickByTestId(getByTestId, "stake-neuron-button-cancel");

      await waitFor(() => expect(onClose).toBeCalled());
    });
  });

  describe("hardware wallet account selection", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
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
      const onClose = jest.fn();
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
        expect(container.querySelector('input[type="range"]')).not.toBeNull()
      );
      const inputRange = container.querySelector('input[type="range"]');

      const ONE_YEAR = 60 * 60 * 24 * 365;
      inputRange &&
        (await fireEvent.input(inputRange, {
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
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
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
    let spyQueryAccount: jest.SpyInstance;
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      jest.clearAllTimers();
      jest.clearAllMocks();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spyQueryAccount = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      jest.spyOn(console, "error").mockImplementation(() => undefined);
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
