import * as icpIndexApi from "$lib/api/icp-index.api";
import { getAllTransactions } from "$lib/services/export-data.services";
import { authStore } from "$lib/stores/auth.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { createMockTransactionWithId } from "$tests/mocks/transaction.mock";

vi.mock("$lib/api/icp-ledger.api");

describe("export-data service", () => {
  const mockAccountId = "test-account-id";
  let spyGetTransactions;

  beforeEach(() => {
    authStore.setForTesting(mockIdentity);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
  });

  describe("getAllTransactions", () => {
    it("should return undefined if no authenticated identity", async () => {
      authStore.setForTesting(null);
      const result = await getAllTransactions({ accountId: mockAccountId });

      expect(result).toBeUndefined();
    });

    it("should fetch all transactions in one singe call", async () => {
      const mockTransactions = [
        createMockTransactionWithId(),
        createMockTransactionWithId(),
      ];

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
      });

      const result = await getAllTransactions({ accountId: mockAccountId });

      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetTransactions).toHaveBeenCalledWith({
        accountIdentifier: mockAccountId,
        identity: mockIdentity,
        maxResults: 100n,
        start: undefined,
      });
      expect(result).toEqual(mockTransactions);
    });

    it("should fetch all transactions in multiple iterations", async () => {
      const firstBatch = [
        createMockTransactionWithId({ id: 1n }),
        createMockTransactionWithId({ id: 2n }),
      ];
      const secondBatch = [
        createMockTransactionWithId({ id: 3n }),
        createMockTransactionWithId({ id: 4n }),
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

      const result = await getAllTransactions({ accountId: mockAccountId });

      expect(result).toEqual([...firstBatch, ...secondBatch]);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
      expect(spyGetTransactions).toHaveBeenNthCalledWith(1, {
        accountIdentifier: mockAccountId,
        identity: mockIdentity,
        maxResults: 100n,
        start: undefined,
      });
      expect(spyGetTransactions).toHaveBeenNthCalledWith(2, {
        accountIdentifier: mockAccountId,
        identity: mockIdentity,
        maxResults: 100n,
        start: 2n,
      });
    });

    it("should respect maxTransactions limit", async () => {
      const mockTransactions = Array.from({ length: 5 }, (_, i) =>
        createMockTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
        oldestTxId: 100n, // Never completed
      });

      const result = await getAllTransactions({
        accountId: mockAccountId,
        maxIterations: 3,
      });

      expect(result?.length).toBe(15);
      expect(spyGetTransactions).toHaveBeenCalledTimes(3); // Should stop after second call
    });

    it("should handle errors and return accumulated transactions", async () => {
      const firstBatch = [
        createMockTransactionWithId({ id: 1n }),
        createMockTransactionWithId({ id: 2n }),
      ];

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          oldestTxId: 100n,
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const result = await getAllTransactions({ accountId: mockAccountId });

      expect(result).toEqual(firstBatch);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
    });
  });
});
