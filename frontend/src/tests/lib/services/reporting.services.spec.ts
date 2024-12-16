import * as icpIndexApi from "$lib/api/icp-index.api";
import {
  getAccountTransactionsConcurrently,
  getAllTransactionsFromAccountAndIdentity,
  mapAccountOrNeuronToTransactionEntity,
} from "$lib/services/reporting.services";
import { mockSignInIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  createTransactionWithId,
  dateToNanoSeconds,
} from "$tests/mocks/icp-transactions.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { SignIdentity } from "@dfinity/agent";

vi.mock("$lib/api/icp-ledger.api");

describe("reporting service", () => {
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
        maxResults: 2000n,
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
        maxResults: 2000n,
        start: undefined,
      });
      expect(spyGetTransactions).toHaveBeenNthCalledWith(2, {
        accountIdentifier: mockAccountId,
        identity: mockSignInIdentity,
        maxResults: 2000n,
        start: 2n,
      });
    });

    it("should respect the 10 maxTransactions limit", async () => {
      const mockTransactions = Array.from({ length: 5 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
        oldestTxId: 2000n,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result?.length).toBe(50);
      expect(spyGetTransactions).toHaveBeenCalledTimes(10);
    });

    it("should handle errors and return accumulated transactions", async () => {
      const allTransactions = [
        createTransactionWithId({ id: 1n }),
        createTransactionWithId({ id: 2n }),
      ];

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: allTransactions,
          oldestTxId: 2000n,
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result).toEqual(allTransactions);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
    });

    it('should filter "from" the provided date', async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
      ];

      spyGetTransactions.mockResolvedValue({
        transactions: allTransactions,
        oldestTxId: 1n,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
        range: {
          from: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(allTransactions.slice(1, 3));
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
    });

    it('should filter "to" the provided date', async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
      ];

      spyGetTransactions.mockResolvedValue({
        transactions: allTransactions,
        oldestTxId: 1n,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
        range: {
          to: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(allTransactions.slice(0, 2));
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
    });

    it("should handle date range where no transactions match", async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
      ];

      spyGetTransactions.mockResolvedValue({
        transactions: allTransactions,
        oldestTxId: 1n,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
        range: {
          from: dateToNanoSeconds(new Date("2022-12-31T10:00:00.000Z")),
          to: dateToNanoSeconds(new Date("2022-12-31T23:00:00.000Z")),
        },
      });

      expect(result).toHaveLength(0);
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
    });

    it('should return early if the last transaction is in the current page is older than "to" date', async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
      ];
      const firstBatchOfMockTransactions = allTransactions.slice(0, 2);
      const secondBatchOfMockTransactions = allTransactions.slice(3);

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatchOfMockTransactions,
          oldestTxId: 1n,
        })
        .mockResolvedValueOnce({
          transactions: secondBatchOfMockTransactions,
          oldestTxId: 1n,
        });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
        range: {
          to: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result).toHaveLength(1);
      expect(result).toEqual([firstBatchOfMockTransactions[0]]);
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
    });

    it('should handle a range with both "from" and "to" dates', async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 6n,
          timestamp: new Date("2023-02-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 5n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 4n,
          timestamp: new Date("2022-12-31T10:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-11-20T00:00:00.000Z"),
        }),
      ];
      const firstBatchOfMockTransactions = allTransactions.slice(0, 3);
      const secondBatchOfMockTransactions = allTransactions.slice(3, 6);

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatchOfMockTransactions,
          oldestTxId: 1n,
        })
        .mockResolvedValueOnce({
          transactions: secondBatchOfMockTransactions,
          oldestTxId: 1n,
        });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
        range: {
          from: dateToNanoSeconds(new Date("2023-01-02T00:00:00.000Z")),
          to: dateToNanoSeconds(new Date("2022-11-30T00:00:00.000Z")),
        },
      });
      expect(result).toHaveLength(4);
      expect(result).toEqual(allTransactions.slice(1, -1));
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
    });

    it("should filter the transactions even if one call fails", async () => {
      const firstBatchOfMockTransactions = [
        createTransactionWithId({
          id: 6n,
          timestamp: new Date("2023-02-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 5n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 4n,
          timestamp: new Date("2022-12-31T10:00:00.000Z"),
        }),
      ];
      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatchOfMockTransactions,
          oldestTxId: 3n,
        })
        .mockRejectedValueOnce(new Error("API Error"));
      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
        range: {
          from: dateToNanoSeconds(new Date("2023-01-02T00:00:00.000Z")),
          to: dateToNanoSeconds(new Date("2022-11-30T00:00:00.000Z")),
        },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        firstBatchOfMockTransactions[1],
        firstBatchOfMockTransactions[2],
      ]);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
    });
  });

  describe("getAccountTransactionsConcurrently", () => {
    const mockIdentity = {} as unknown as SignIdentity;
    const mockEntities = [mockMainAccount, mockSubAccount, mockNeuron];

    const mockTransactions = [
      createTransactionWithId({}),
      createTransactionWithId({}),
    ];

    const mainAccountEntity = {
      originalData: mockMainAccount,
      balance: mockMainAccount.balanceUlps,
      identifier: mockMainAccount.identifier,
      type: "account",
    };

    const subAccountEntity = {
      originalData: mockSubAccount,
      balance: mockSubAccount.balanceUlps,
      identifier: mockSubAccount.identifier,
      type: "account",
    };

    const neuronEntity = {
      identifier: mockNeuron.fullNeuron?.accountIdentifier,
      balance: 3000000000n,
      originalData: mockNeuron,
      type: "neuron",
    };

    it("should handle empty accounts array", async () => {
      const result = await getAccountTransactionsConcurrently({
        entities: [],
        identity: mockIdentity,
      });

      expect(result).toEqual([]);
      expect(spyGetTransactions).toHaveBeenCalledTimes(0);
    });

    it("should map the MainAccount to a generic entity", async () => {
      expect(mapAccountOrNeuronToTransactionEntity(mockMainAccount)).toEqual(
        mainAccountEntity
      );
    });

    it("should map a SubAccount to a generic entity", async () => {
      expect(mapAccountOrNeuronToTransactionEntity(mockSubAccount)).toEqual(
        subAccountEntity
      );
    });

    it("should map a Neuron to a generic entity", async () => {
      expect(mapAccountOrNeuronToTransactionEntity(mockNeuron)).toEqual(
        neuronEntity
      );
    });

    it("should fetch transactions for all accounts successfully", async () => {
      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
      });

      const result = await getAccountTransactionsConcurrently({
        entities: mockEntities,
        identity: mockIdentity,
      });

      expect(result).toHaveLength(3);
      expect(spyGetTransactions).toHaveBeenCalledTimes(3);

      expect(result[0].entity).toEqual(mainAccountEntity);
      expect(result[0].transactions).toEqual(mockTransactions);
      expect(result[0].error).toBeUndefined();

      expect(result[1].entity).toEqual(subAccountEntity);
      expect(result[1].transactions).toEqual(mockTransactions);
      expect(result[1].error).toBeUndefined();

      expect(result[2].entity).toEqual(neuronEntity);
      expect(result[2].transactions).toEqual(mockTransactions);
      expect(result[2].error).toBeUndefined();
    });

    // TODO: To be implemented once getAccountTransactionsConcurrently handles errors
    it.skip("should handle failed transactions fetch for some accounts", async () => {
      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: mockTransactions,
        })
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({
          transactions: mockTransactions,
        });

      const result = await getAccountTransactionsConcurrently({
        entities: mockEntities,
        identity: mockIdentity,
      });

      expect(result).toHaveLength(3);
      expect(spyGetTransactions).toHaveBeenCalledTimes(3);

      expect(result[0].entity).toEqual(mainAccountEntity);
      expect(result[0].transactions).toEqual(mockTransactions);
      expect(result[0].error).toBeUndefined();

      expect(result[1].entity).toEqual(subAccountEntity);
      expect(result[1].transactions).toEqual([]);
      expect(result[1].error).toBeDefined();

      expect(result[2].entity).toEqual(neuronEntity);
      expect(result[2].transactions).toEqual(mockTransactions);
      expect(result[2].error).toBeUndefined();
    });
  });
});
