import * as icpIndexApi from "$lib/api/icp-index.api";
import { getAllTransactionsFromAccountAndIdentity } from "$lib/services/export-data.services";
import { mockSignInIdentity } from "$tests/mocks/auth.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";

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

    it("should respect maxTransactions limit", async () => {
      const mockTransactions = Array.from({ length: 5 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
        oldestTxId: 100n, // Never completed
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        maxIterations: 3,
        identity: mockSignInIdentity,
      });

      expect(result?.length).toBe(15);
      expect(spyGetTransactions).toHaveBeenCalledTimes(3); // Should stop after second call
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
});
