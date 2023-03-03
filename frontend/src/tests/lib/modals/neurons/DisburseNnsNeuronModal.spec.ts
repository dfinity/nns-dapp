/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
import { cancelPollAccounts } from "$lib/services/accounts.services";
import { disburse } from "$lib/services/neurons.services";
import { accountsStore } from "$lib/stores/accounts.store";
import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

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
      accountsStore.set({
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
      accountsStore.reset();
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
      accountsStore.reset();
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

      let counter = 1;
      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const retriesBeforeLeaving = 3;
      const extraRetries = 4;
      await waitFor(() => expect(spyQueryAccount).toBeCalledTimes(counter));
      while (counter < retriesBeforeLeaving + extraRetries) {
        expect(spyQueryAccount).toBeCalledTimes(
          Math.min(counter, retriesBeforeLeaving)
        );
        counter += 1;
        // Make sure the timers are set before we advance time.
        await null;
        await null;
        await null;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;
        await waitFor(() =>
          expect(spyQueryAccount).toBeCalledTimes(
            Math.min(counter, retriesBeforeLeaving)
          )
        );

        if (counter === retriesBeforeLeaving) {
          unmount();
        }
      }

      expect(counter).toBe(retriesBeforeLeaving + extraRetries);

      expect(spyQueryAccount).toHaveBeenCalledTimes(retriesBeforeLeaving);
    });
  });
});
