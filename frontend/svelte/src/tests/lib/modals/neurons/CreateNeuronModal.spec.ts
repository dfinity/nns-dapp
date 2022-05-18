/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import {
  fireEvent,
  waitFor,
  type BoundFunction,
  type queries,
} from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { E8S_PER_ICP } from "../../../../lib/constants/icp.constants";
import CreateNeuronModal from "../../../../lib/modals/neurons/CreateNeuronModal.svelte";
import {
  addHotkeyForHardwareWalletNeuron,
  stakeNeuron,
  updateDelay,
} from "../../../../lib/services/neurons.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { authStore } from "../../../../lib/stores/auth.store";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import { formatVotingPower } from "../../../../lib/utils/neuron.utils";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

const neuronStake = 2.2;
const neuronStakeE8s = BigInt(Math.round(neuronStake * E8S_PER_ICP));
const newNeuron: NeuronInfo = {
  ...mockNeuron,
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: neuronStakeE8s,
  },
};
jest.mock("../../../../lib/services/neurons.services", () => {
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

jest.mock("../../../../lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

jest.mock("../../../../lib/services/accounts.services", () => {
  return {
    syncAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      error: jest.fn(),
      show: jest.fn(),
      success: jest.fn(),
    },
  };
});

describe("CreateNeuronModal", () => {
  describe("main account selection", () => {
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [newNeuron], certified: true });
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());
      jest
        .spyOn(GovernanceCanister, "create")
        .mockImplementation(() => mock<GovernanceCanister>());
    });

    afterEach(() => {
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });

    it("should display modal", async () => {
      const { container } = await renderModal({ component: CreateNeuronModal });

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    it("should display accounts as cards", async () => {
      const { container } = await renderModal({ component: CreateNeuronModal });

      expect(container.querySelector('article[role="button"]')).not.toBeNull();
    });

    it("should be able to select an account and move to the next view", async () => {
      const { container, queryByText } = await renderModal({
        component: CreateNeuronModal,
      });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

      expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();
    });

    it("should be able to select a subaccount and move to the next view", async () => {
      const { container, queryByText } = await renderModal({
        component: CreateNeuronModal,
      });

      const accountCards = container.querySelectorAll('article[role="button"]');
      expect(accountCards.length).toBe(2);

      const subAccountCard = queryByText(mockSubAccount.name as string, {
        exact: false,
      });

      subAccountCard && (await fireEvent.click(subAccountCard));

      expect(queryByText(en.neurons.stake_neuron)).toBeInTheDocument();
      expect(queryByText(mockSubAccount.identifier)).toBeInTheDocument();
    });

    it("should have disabled Create neuron button", async () => {
      const { container, queryByText } = await renderModal({
        component: CreateNeuronModal,
      });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

      expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.getAttribute("disabled")).not.toBeNull();
    });

    it("should have enabled Create neuron button when entering amount", async () => {
      const { container, queryByText } = await renderModal({
        component: CreateNeuronModal,
      });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

      expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.getAttribute("disabled")).toBeNull();
    });

    it("should be able to create a new neuron", async () => {
      const { container } = await renderModal({ component: CreateNeuronModal });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      expect(stakeNeuron).toBeCalled();
    });

    it("should move to update dissolve delay after creating a neuron", async () => {
      const { container } = await renderModal({ component: CreateNeuronModal });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

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
      const { container } = await renderModal({ component: CreateNeuronModal });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

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
      const { container } = await renderModal({ component: CreateNeuronModal });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

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
        (await fireEvent.input(inputRange, { target: { value: FIVE_MONTHS } }));

      const updateDelayButton = container.querySelector(
        '[data-tid="go-confirm-delay-button"]'
      );
      expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
    });

    it("should be able to create a neuron and see the stake of the new neuron in the dissolve modal", async () => {
      const { container, getByText } = await renderModal({
        component: CreateNeuronModal,
      });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

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

    it("should be able to change dissolve delay in the confirmation screen", async () => {
      const { container } = await renderModal({ component: CreateNeuronModal });

      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

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
        (await fireEvent.input(inputRange, { target: { value: ONE_YEAR } }));

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
        component: CreateNeuronModal,
      });

      // SCREEN: Select Account
      const accountCard = container.querySelector('article[role="button"]');
      expect(accountCard).not.toBeNull();

      accountCard && (await fireEvent.click(accountCard));

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
  });

  describe("hardware wallet account selection", () => {
    beforeEach(() => {
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(
          mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
        );
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });

    const createNeuron = async ({
      queryByText,
      container,
    }: {
      queryByText: BoundFunction<queries.QueryByText>;
      container: HTMLElement;
    }) => {
      // SCREEN: Select Hardware Wallet Account
      const hardwareWalletAccount = queryByText(
        mockHardwareWalletAccount.name as string,
        {
          exact: false,
        }
      );
      expect(hardwareWalletAccount).not.toBeNull();

      hardwareWalletAccount && (await fireEvent.click(hardwareWalletAccount));

      // SCREEN: Create Neuron
      const input = container.querySelector('input[name="amount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input && (await fireEvent.input(input, { target: { value: 22 } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));
    };

    it("should create neuron for hardwareWallet and close modal if hotkey is not added", async () => {
      const { container, queryByTestId, queryByText, component } =
        await renderModal({
          component: CreateNeuronModal,
        });

      await createNeuron({ queryByText, container });

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
      const { container, queryByTestId, queryByText } = await renderModal({
        component: CreateNeuronModal,
      });

      await createNeuron({ queryByText, container });

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
        (await fireEvent.input(inputRange, { target: { value: ONE_YEAR } }));

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
});
