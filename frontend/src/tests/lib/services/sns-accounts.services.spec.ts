/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/sns-ledger.api";
import * as services from "$lib/services/sns-accounts.services";
import { loadAccountTransactions } from "$lib/services/sns-transactions.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";

jest.mock("$lib/services/sns-transactions.services", () => ({
  loadAccountTransactions: jest.fn(),
}));

describe("sns-accounts-services", () => {
  describe("loadSnsAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.getSnsAccounts and load neurons in store", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

      await services.loadSnsAccounts({ rootCanisterId: mockPrincipal });

      await tick();
      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockRejectedValue(new Error());

      const spy = jest.fn();

      await services.loadSnsAccounts({
        rootCanisterId: mockPrincipal,
        handleError: spy,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should empty store if update call fails", async () => {
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts: [mockSnsMainAccount],
        certified: true,
      });
      const spyQuery = jest
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.reject(undefined));

      await services.loadSnsAccounts({ rootCanisterId: mockPrincipal });

      await waitFor(() => {
        const store = get(snsAccountsStore);
        return expect(store[mockPrincipal.toText()]).toBeUndefined();
      });
      const transactionsStore = get(snsTransactionsStore);
      return expect(transactionsStore[mockPrincipal.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("syncSnsAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
    });
    it("should call sns accounts and transaction fee and load them in store", async () => {
      const spyAccountsQuery = jest
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));
      const fee = BigInt(10_000);
      const spyFeeQuery = jest
        .spyOn(ledgerApi, "transactionFee")
        .mockImplementation(() => Promise.resolve(fee));

      await services.syncSnsAccounts({ rootCanisterId: mockPrincipal });

      await tick();
      expect(spyAccountsQuery).toBeCalled();
      expect(spyFeeQuery).toBeCalled();

      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);

      const feeStore = get(transactionsFeesStore);
      expect(feeStore.projects[mockPrincipal.toText()]?.fee).toEqual(fee);
    });
  });

  describe("snsTransferTokens", () => {
    const spyAccounts = jest
      .spyOn(ledgerApi, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    it("should call sns transfer tokens", async () => {
      const spyTransfer = jest
        .spyOn(ledgerApi, "transfer")
        .mockResolvedValue(undefined);

      const { success } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        e8s: BigInt(10_000_000),
        loadTransactions: false,
      });

      expect(success).toBe(true);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should load transactions if flag is passed", async () => {
      const spyTransfer = jest
        .spyOn(ledgerApi, "transfer")
        .mockResolvedValue(undefined);

      const { success } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        e8s: BigInt(10_000_000),
        loadTransactions: true,
      });

      expect(success).toBe(true);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
      expect(loadAccountTransactions).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      const spyTransfer = jest
        .spyOn(ledgerApi, "transfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const { success } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        e8s: BigInt(10_000_000),
        loadTransactions: false,
      });

      expect(success).toBe(false);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });

  describe("getSnsAccountIdentity", () => {
    it("returns identity", async () => {
      const identity = await services.getSnsAccountIdentity(mockSnsMainAccount);
      expect(identity).toEqual(mockIdentity);
    });
  });
});
