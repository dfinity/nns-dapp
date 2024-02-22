import * as indexApi from "$lib/api/icp-index.api";
import { DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import {
  loadIcpAccountNextTransactions,
  loadIcpAccountTransactions,
} from "$lib/services/icp-transactions.services";
import { icpTransactionsStore } from "$lib/stores/icp-transactions.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockTransactionWithId } from "$tests/mocks/transaction.mock";
import { toastsStore } from "@dfinity/gix-components";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { get } from "svelte/store";

vi.mock("$lib/api/icp-index.api");

describe("icp-transactions services", () => {
  const accountIdentifier = mockMainAccount.identifier;
  const accountIdentifier2 = mockSnsMainAccount.identifier;

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
    icpTransactionsStore.reset();
    toastsStore.reset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("loadIcpAccountTransactions", () => {
    it("loads transactions in the store by account identifier from the api data", async () => {
      const transaction1 = {
        id: 1_234n,
        transaction: { ...mockTransactionWithId.transaction },
      };
      const transaction2 = {
        id: 5_678n,
        transaction: { ...mockTransactionWithId.transaction },
      };
      const spyGetTransactions = vi
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValueOnce({
          oldestTxId: transaction1.id,
          transactions: [transaction1],
          balance: 200_000_000n,
        })
        .mockResolvedValueOnce({
          oldestTxId: transaction2.id,
          transactions: [transaction2],
          balance: 300_000_000n,
        });
      const start = 1_234n;

      expect(spyGetTransactions).not.toBeCalled();
      await loadIcpAccountTransactions({
        accountIdentifier,
        start,
      });

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        identity: mockIdentity,
        accountIdentifier,
        maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
        start,
      });

      expect(get(icpTransactionsStore)[accountIdentifier]).toEqual({
        transactions: [mockTransactionWithId],
        oldestTxId: transaction1.id,
        completed: true,
      });

      await loadIcpAccountTransactions({
        accountIdentifier: accountIdentifier2,
        start,
      });

      // Previous state is not overwritten
      expect(get(icpTransactionsStore)[accountIdentifier]).toEqual({
        transactions: [transaction1],
        oldestTxId: transaction1.id,
        completed: true,
      });
      // New state is added
      expect(get(icpTransactionsStore)[accountIdentifier2]).toEqual({
        transactions: [transaction2],
        oldestTxId: transaction2.id,
        completed: true,
      });
    });

    it("sets complete to false", async () => {
      const transactions = new Array(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT).fill(
        mockTransactionWithId
      );
      vi.spyOn(indexApi, "getTransactions").mockResolvedValue({
        oldestTxId: 1_234n,
        transactions: transactions,
        balance: 200_000_000n,
      });

      await loadIcpAccountTransactions({
        accountIdentifier,
        start: undefined,
      });

      expect(get(icpTransactionsStore)[accountIdentifier].completed).toBe(
        false
      );
    });

    it("toasts error if api fails", async () => {
      vi.spyOn(indexApi, "getTransactions").mockRejectedValue(
        new Error("Something happened")
      );
      const start = 1_234n;

      expect(get(toastsStore)).toHaveLength(0);

      await loadIcpAccountTransactions({
        accountIdentifier,
        start,
      });

      expect(get(toastsStore)).toHaveLength(1);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: "Sorry, there was an error loading the transactions for this account. Something happened",
      });
    });
  });

  describe("loadIcpAccountNextTransactions", () => {
    it("uses oldest transaction id as start and results in store", async () => {
      const oldTransactionId = 100n;
      const recentTransactionId = 200n;
      const recentTransaction: TransactionWithId = {
        id: recentTransactionId,
        transaction: { ...mockTransactionWithId.transaction },
      };
      const oldTransaction = {
        id: oldTransactionId,
        transaction: { ...mockTransactionWithId.transaction },
      };
      const spyGetTransactions = vi
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: oldTransactionId,
          transactions: [oldTransaction],
          balance: 200_000_000n,
        });

      icpTransactionsStore.addTransactions({
        accountIdentifier,
        transactions: [recentTransaction],
        oldestTxId: recentTransactionId,
        completed: false,
      });

      expect(spyGetTransactions).not.toBeCalled();

      await loadIcpAccountNextTransactions(accountIdentifier);

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        identity: mockIdentity,
        accountIdentifier,
        maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
        start: recentTransactionId,
      });

      expect(get(icpTransactionsStore)[accountIdentifier]).toEqual({
        transactions: [recentTransaction, oldTransaction],
        oldestTxId: oldTransactionId,
        completed: true,
      });
    });

    it("passes start undefined if no transactions in store", async () => {
      const spyGetTransactions = vi
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: mockTransactionWithId.id,
          transactions: [mockTransactionWithId],
          balance: 200_000_000n,
        });

      expect(spyGetTransactions).not.toBeCalled();

      await loadIcpAccountNextTransactions(accountIdentifier);

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        identity: mockIdentity,
        accountIdentifier,
        maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
        start: undefined,
      });
    });

    it("toasts error if api fails", async () => {
      vi.spyOn(indexApi, "getTransactions").mockRejectedValue(
        new Error("Something happened")
      );

      expect(get(toastsStore)).toHaveLength(0);

      await loadIcpAccountNextTransactions(accountIdentifier);

      expect(get(toastsStore)).toHaveLength(1);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: "Sorry, there was an error loading the transactions for this account. Something happened",
      });
    });
  });
});
