import * as icpIndexApi from "$lib/api/icp-index.api";
import {
  getAccountTransactionsConcurrently,
  getAllTransactionsFromAccountAndIdentity,
} from "$lib/services/export-data.services";
import { mockSignInIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import type { SignIdentity } from "@dfinity/agent";

vi.mock("$lib/api/icp-ledger.api");

describe("export-data service", () => {
  const mockAccountId = "test-account-id";
  let spyGetTransactions;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
  });

  describe("getAllTransactionsFromAccount", () => {
    it("should fetch all transactions in one singe call", async () => {
      const mockTransactions = [
        createTransactionWithId({}),
        createTransactionWithId({}),
      ];

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetTransactions).toHaveBeenCalledWith({
        accountIdentifier: mockAccountId,
        identity: mockSignInIdentity,
        maxResults: 100n,
        start: undefined,
      });
      expect(result).toEqual(mockTransactions);
    });

    it("should fetch all transactions in multiple iterations", async () => {
      const firstBatch = [
        createTransactionWithId({ id: 1n }),
        createTransactionWithId({ id: 2n }),
      ];
      const secondBatch = [
        createTransactionWithId({ id: 3n }),
        createTransactionWithId({ id: 4n }),
      ];

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          oldestTxId: 4n, // Incomplete
        })
        .mockResolvedValueOnce({
          transactions: secondBatch,
          oldestTxId: 4n, // Completed
        });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result).toEqual([...firstBatch, ...secondBatch]);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
      expect(spyGetTransactions).toHaveBeenNthCalledWith(1, {
        accountIdentifier: mockAccountId,
        identity: mockSignInIdentity,
        maxResults: 100n,
        start: undefined,
      });
      expect(spyGetTransactions).toHaveBeenNthCalledWith(2, {
        accountIdentifier: mockAccountId,
        identity: mockSignInIdentity,
        maxResults: 100n,
        start: 2n,
      });
    });

    it("should respect the 10 maxTransactions limit", async () => {
      const mockTransactions = Array.from({ length: 5 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
        oldestTxId: 100n,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result?.length).toBe(50);
      expect(spyGetTransactions).toHaveBeenCalledTimes(10);
    });

    it("should handle errors and return accumulated transactions", async () => {
      const firstBatch = [
        createTransactionWithId({ id: 1n }),
        createTransactionWithId({ id: 2n }),
      ];

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          oldestTxId: 100n,
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result).toEqual(firstBatch);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
    });
  });

  describe("getAccountTransactionsConcurrently", () => {
    const mockIdentity = {} as unknown as SignIdentity;
    const mockAccounts = [mockMainAccount, mockSubAccount];

    const mockTransactions = [
      createTransactionWithId({}),
      createTransactionWithId({}),
    ];

    it("should fetch transactions for all accounts successfully", async () => {
      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
      });

      const result = await getAccountTransactionsConcurrently({
        accounts: mockAccounts,
        identity: mockIdentity,
      });

      expect(result).toHaveLength(mockAccounts.length);
      expect(spyGetTransactions).toHaveBeenCalledTimes(mockAccounts.length);

      result.forEach((accountResult, index) => {
        expect(accountResult.account).toEqual(mockAccounts[index]);
        expect(accountResult.transactions).toEqual(mockTransactions);
        expect(accountResult.error).toBeUndefined();
      });
    });

    it("should handle failed transactions fetch for some accounts", async () => {
      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: mockTransactions,
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const result = await getAccountTransactionsConcurrently({
        accounts: mockAccounts,
        identity: mockIdentity,
      });

      expect(result).toHaveLength(mockAccounts.length);

      // First account should have transactions
      expect(result[0].transactions).toEqual(mockTransactions);
      expect(result[0].error).toBeUndefined();

      // Second account should have error and empty transactions
      expect(result[1].transactions).toEqual([]);
      expect(result[1].error).toBe("API Error");
    });

    it("should handle empty accounts array", async () => {
      const result = await getAccountTransactionsConcurrently({
        accounts: [],
        identity: mockIdentity,
      });

      expect(result).toEqual([]);
      expect(getAllTransactionsFromAccountAndIdentity).not.toHaveBeenCalled();
    });
  });
});
