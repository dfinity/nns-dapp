/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
import { cancelPollAccounts } from "$lib/services/accounts.services";
import { disburse } from "$lib/services/neurons.services";
import { accountsStore } from "$lib/stores/accounts.store";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/ledger.api");
jest.mock("$lib/services/neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
  };
});

describe("DisburseNnsNeuronModal", () => {
  beforeEach(() => {
    cancelPollAccounts();
  });

  const renderDisburseModal = async (
    neuron: NeuronInfo
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: DisburseNnsNeuronModal,
      props: { neuron },
    });
  };

  describe("when accounts are loaded", () => {
    beforeEach(() => {
      accountsStore.setForTesting({
        ...mockAccountsStoreData,
        subAccounts: [mockSubAccount],
      });
    });
    it("should display modal", async () => {
      const { container } = await renderDisburseModal(mockNeuron);

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    it("should render accounts", async () => {
      const { queryAllByTestId } = await renderDisburseModal(mockNeuron);

      const accountCards = queryAllByTestId("account-card");
      expect(accountCards.length).toBe(2);
    });

    it("should be able to select an account", async () => {
      const { queryAllByTestId, queryByTestId } = await renderDisburseModal(
        mockNeuron
      );

      const accountCards = queryAllByTestId("account-card");
      expect(accountCards.length).toBe(2);

      const firstAccount = accountCards[0];
      await fireEvent.click(firstAccount);

      const confirmScreen = queryByTestId("confirm-disburse-screen");
      expect(confirmScreen).not.toBeNull();
    });

    it("should be able to add address in input", async () => {
      const { container, queryByTestId } = await renderDisburseModal(
        mockNeuron
      );

      const addressInput = container.querySelector("input[type='text']");
      expect(addressInput).not.toBeNull();
      const continueButton = queryByTestId("address-submit-button");
      expect(continueButton).not.toBeNull();
      expect(continueButton?.getAttribute("disabled")).not.toBeNull();

      const address = mockMainAccount.identifier;
      addressInput &&
        (await fireEvent.input(addressInput, { target: { value: address } }));
      expect(continueButton?.getAttribute("disabled")).toBeNull();

      continueButton && (await fireEvent.click(continueButton));

      const confirmScreen = queryByTestId("confirm-disburse-screen");
      expect(confirmScreen).not.toBeNull();
    });

    it("should call disburse service", async () => {
      const { container, queryByTestId } = await renderDisburseModal(
        mockNeuron
      );

      const addressInput = container.querySelector("input[type='text']");
      expect(addressInput).not.toBeNull();
      const continueButton = queryByTestId("address-submit-button");
      expect(continueButton).not.toBeNull();
      expect(continueButton?.getAttribute("disabled")).not.toBeNull();

      const address = mockMainAccount.identifier;
      addressInput &&
        (await fireEvent.input(addressInput, { target: { value: address } }));
      expect(continueButton?.getAttribute("disabled")).toBeNull();

      continueButton && (await fireEvent.click(continueButton));

      const confirmScreen = queryByTestId("confirm-disburse-screen");
      expect(confirmScreen).not.toBeNull();

      const confirmButton = queryByTestId("disburse-neuron-button");
      expect(confirmButton).not.toBeNull();

      confirmButton && (await fireEvent.click(confirmButton));
      expect(disburse).toBeCalled();
      await waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Neurons);
      });
    });
  });

  describe("when accounts store is empty", () => {
    beforeEach(() => {
      accountsStore.resetForTesting();
    });
    it("should fetch accounts and render account selector", async () => {
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const { queryByTestId } = await renderDisburseModal(mockNeuron);

      expect(queryByTestId("account-card")).not.toBeInTheDocument();

      // Component is rendered after the accounts are loaded
      await waitFor(() =>
        expect(queryByTestId("account-card")).toBeInTheDocument()
      );
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: jest.SpyInstance;
    beforeEach(() => {
      accountsStore.resetForTesting();
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
      const { unmount } = await renderDisburseModal(mockNeuron);

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
