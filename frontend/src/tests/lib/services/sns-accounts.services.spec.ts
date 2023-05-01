/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/sns-ledger.api";
import * as services from "$lib/services/sns-accounts.services";
import { loadSnsAccountTransactions } from "$lib/services/sns-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";

jest.mock("$lib/services/sns-transactions.services", () => ({
  loadSnsAccountTransactions: jest.fn(),
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
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId: undefined,
        completed: false,
      });

      const spyQuery = jest
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.reject(undefined));

      await services.loadSnsAccounts({ rootCanisterId: mockPrincipal });

      await waitFor(() => {
        const store = get(snsAccountsStore);
        return expect(store[mockPrincipal.toText()]).toBeUndefined();
      });
      const transactionsStore = get(icrcTransactionsStore);
      expect(transactionsStore[mockPrincipal.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("syncSnsAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
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

    afterEach(() => {
      transactionsFeesStore.reset();
    });

    it("should call sns transfer tokens", async () => {
      transactionsFeesStore.setFee({
        rootCanisterId: mockPrincipal,
        fee: BigInt(100),
        certified: true,
      });
      const spyTransfer = jest
        .spyOn(ledgerApi, "snsTransfer")
        .mockResolvedValue(123n);

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
      });

      expect(blockIndex).toEqual(123n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should load transactions if flag is passed", async () => {
      transactionsFeesStore.setFee({
        rootCanisterId: mockPrincipal,
        fee: BigInt(100),
        certified: true,
      });
      const spyTransfer = jest
        .spyOn(ledgerApi, "snsTransfer")
        .mockResolvedValue(123n);

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: true,
      });

      expect(blockIndex).toEqual(123n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
      expect(loadSnsAccountTransactions).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      transactionsFeesStore.setFee({
        rootCanisterId: mockPrincipal,
        fee: BigInt(100),
        certified: true,
      });
      const spyTransfer = jest
        .spyOn(ledgerApi, "snsTransfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });

    it("should show toast and return success false if there is no transaction fee", async () => {
      transactionsFeesStore.reset();
      const spyTransfer = jest
        .spyOn(ledgerApi, "snsTransfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).not.toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });
});
