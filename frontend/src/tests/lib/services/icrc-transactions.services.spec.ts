import * as indexApi from "$lib/api/icrc-index.api";
import { DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import {
  loadIcrcAccountNextTransactions,
  loadIcrcAccountTransactions,
} from "$lib/services/icrc-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  createIcrcTransactionWithId,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";

vi.mock("$lib/api/icrc-index.api");

describe("icrc-transactions services", () => {
  const indexCanisterId = principal(0);
  const ledgerCanisterId = principal(1);

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("loadIcrcAccountTransactions", () => {
    it("loads transactions in the store by universe id", async () => {
      const spyGetTransactions = vi
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: 1_234n,
          transactions: [mockIcrcTransactionWithId],
        });
      const start = 1_234n;

      expect(spyGetTransactions).not.toBeCalled();
      await loadIcrcAccountTransactions({
        account: mockCkBTCMainAccount,
        start,
        indexCanisterId,
        ledgerCanisterId,
      });

      const account = {
        owner: mockCkBTCMainAccount.principal,
      };

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        identity: mockIdentity,
        account,
        maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
        indexCanisterId,
        start,
      });

      const storeData = get(icrcTransactionsStore);
      expect(
        storeData[ledgerCanisterId.toText()]?.[
          mockCkBTCMainAccount.principal.toText()
        ].transactions[0]
      ).toEqual(mockIcrcTransactionWithId);
    });

    it("toasts error if api fails", async () => {
      vi.spyOn(indexApi, "getTransactions").mockRejectedValue(
        new Error("Something happened")
      );
      const start = 1_234n;

      expect(get(toastsStore)).toHaveLength(0);

      await loadIcrcAccountTransactions({
        account: mockCkBTCMainAccount,
        start,
        indexCanisterId,
        ledgerCanisterId,
      });

      expect(get(toastsStore)).toHaveLength(1);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: "Sorry, there was an error loading the transactions for this account. Something happened",
      });
    });
  });

  describe("loadIcrcAccountNextTransactions", () => {
    it("uses oldest transaction id as start and results in store", async () => {
      const newTransaction = createIcrcTransactionWithId({
        id: 9n,
        timestamp: new Date("2023-12-01T00:00:00.000Z"),
      });
      const spyGetTransactions = vi
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: newTransaction.id,
          transactions: [newTransaction],
        });

      const oldestTransaction = createIcrcTransactionWithId({
        id: 11n,
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      });
      const secondTransaction = createIcrcTransactionWithId({
        id: 14n,
        timestamp: new Date("2024-01-02T00:00:00.000Z"),
      });
      const mostRecentTransaction = createIcrcTransactionWithId({
        id: 17n,
        timestamp: new Date("2024-01-03T00:00:00.000Z"),
      });

      icrcTransactionsStore.addTransactions({
        accountIdentifier: mockCkBTCMainAccount.identifier,
        canisterId: ledgerCanisterId,
        transactions: [
          oldestTransaction,
          secondTransaction,
          mostRecentTransaction,
        ],
        oldestTxId: oldestTransaction.id,
        completed: false,
      });

      expect(
        get(icrcTransactionsStore)[ledgerCanisterId.toText()]?.[
          mockCkBTCMainAccount.principal.toText()
        ].transactions
      ).toHaveLength(3);
      expect(spyGetTransactions).not.toBeCalled();

      await loadIcrcAccountNextTransactions({
        account: mockCkBTCMainAccount,
        indexCanisterId,
        ledgerCanisterId,
      });

      const account = {
        owner: mockCkBTCMainAccount.principal,
      };

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        identity: mockIdentity,
        account,
        maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
        indexCanisterId,
        start: oldestTransaction.id,
      });

      const storeTransactions = get(icrcTransactionsStore)[
        ledgerCanisterId.toText()
      ]?.[mockCkBTCMainAccount.principal.toText()].transactions;
      expect(storeTransactions).toHaveLength(4);
      expect(storeTransactions[3]).toEqual(newTransaction);
    });

    it("passes start undefined if no transactions in store", async () => {
      const newTransaction = createIcrcTransactionWithId({
        id: 9n,
        timestamp: new Date("2024-01-04"),
      });
      const spyGetTransactions = vi
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: newTransaction.id,
          transactions: [newTransaction],
        });
      expect(spyGetTransactions).not.toBeCalled();

      await loadIcrcAccountNextTransactions({
        account: mockCkBTCMainAccount,
        indexCanisterId,
        ledgerCanisterId,
      });

      const account = {
        owner: mockCkBTCMainAccount.principal,
      };

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        identity: mockIdentity,
        account,
        maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
        indexCanisterId,
        start: undefined,
      });
    });

    it("toasts error if api fails", async () => {
      vi.spyOn(indexApi, "getTransactions").mockRejectedValue(
        new Error("Something happened")
      );

      expect(get(toastsStore)).toHaveLength(0);

      await loadIcrcAccountNextTransactions({
        account: mockCkBTCMainAccount,
        indexCanisterId,
        ledgerCanisterId,
      });

      expect(get(toastsStore)).toHaveLength(1);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: "Sorry, there was an error loading the transactions for this account. Something happened",
      });
    });
  });
});
