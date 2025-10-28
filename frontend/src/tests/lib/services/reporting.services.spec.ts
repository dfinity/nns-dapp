import * as icpIndexApi from "$lib/api/icp-index.api";
import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as reportingServices from "$lib/services/reporting.services";
import { mapPool } from "$lib/utils/reporting.utils";
import {
  getAccountTransactionsConcurrently,
  getAllIcrcTransactionsFromAccountAndIdentity,
  getAllTransactionsFromAccountAndIdentity,
  getAllIcrcTransactionsForCkTokens,
  mapAccountOrNeuronToTransactionEntity,
} from "$lib/services/reporting.services";
import { mockSignInIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  createTransactionWithId,
  dateToNanoSeconds,
} from "$tests/mocks/icp-transactions.mock";
import { createIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { SignIdentity } from "@dfinity/agent";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/icrc-index.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/constants/tokens.constants", () => ({
  ALL_CK_TOKENS_CANISTER_IDS: [
    { ledgerCanisterId: "ledger1", indexCanisterId: "index1" },
    { ledgerCanisterId: "ledger2", indexCanisterId: "index2" },
  ],
}));
vi.mock("$lib/utils/reporting.utils", () => ({
  mapPool: vi.fn(),
}));

describe("reporting service", () => {
  const mockAccountId = "test-account-id";
  let spyGetTransactions;
  let spyGetIcrcTransactions;
  let spyQueryIcrcToken;
  let spyGetAllIcrcTransactionsFromAccountAndIdentity;
  let spyMapPool;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
    spyGetIcrcTransactions = vi.spyOn(icrcIndexApi, "getTransactions");
    spyQueryIcrcToken = vi.spyOn(icrcLedgerApi, "queryIcrcToken");
    spyGetAllIcrcTransactionsFromAccountAndIdentity = vi.spyOn(
      reportingServices,
      "getAllIcrcTransactionsFromAccountAndIdentity"
    );
    spyMapPool = vi.mocked(mapPool);
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
        maxResults: 50n,
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
        maxResults: 50n,
        start: undefined,
      });
      expect(spyGetTransactions).toHaveBeenNthCalledWith(2, {
        accountIdentifier: mockAccountId,
        identity: mockSignInIdentity,
        maxResults: 50n,
        start: 2n,
      });
    });

    it("should respect the 10 maxTransactions limit", async () => {
      const mockTransactions = Array.from({ length: 5 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetTransactions.mockResolvedValue({
        transactions: mockTransactions,
        oldestTxId: 50n,
      });

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result?.length).toBe(250);
      expect(spyGetTransactions).toHaveBeenCalledTimes(50);
    });

    it("should handle errors and return accumulated transactions", async () => {
      const firstBatch = [
        createTransactionWithId({ id: 3n }),
        createTransactionWithId({ id: 2n }),
      ];

      spyGetTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          oldestTxId: 1n,
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const result = await getAllTransactionsFromAccountAndIdentity({
        accountId: mockAccountId,
        identity: mockSignInIdentity,
      });

      expect(result).toEqual(firstBatch);
      expect(spyGetTransactions).toHaveBeenCalledTimes(2);
    });

    it('should filter "to" the provided date excluding to', async () => {
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

      expect(result).toHaveLength(1);
      expect(result).toEqual(allTransactions.slice(2));
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
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
      expect(result).toEqual(allTransactions.slice(0, 2));
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
    });

    it("should handle date range where no transactions match", async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-29T00:00:00.000Z"),
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
          from: dateToNanoSeconds(new Date("2022-12-31T00:00:00.000Z")),
        },
      });

      expect(result).toHaveLength(0);
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);
    });

    it('should return early if the last transaction is in the current page is older than "from" date', async () => {
      const allTransactions = [
        createTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
        createTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
      ];
      const firstBatchOfMockTransactions = allTransactions.slice(0, 2);
      const secondBatchOfMockTransactions = allTransactions.slice(2);

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
          from: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result).toHaveLength(1);
      expect(result).toEqual(allTransactions.slice(0, 1));
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
          to: dateToNanoSeconds(new Date("2023-01-02T00:00:00.000Z")),
          from: dateToNanoSeconds(new Date("2022-11-30T00:00:00.000Z")),
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
          to: dateToNanoSeconds(new Date("2023-01-02T00:00:00.000Z")),
          from: dateToNanoSeconds(new Date("2022-11-30T00:00:00.000Z")),
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

    it("should fetch transactions for the specified period", async () => {
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

      const beginningOfYear = dateToNanoSeconds(
        new Date("2023-01-01T00:00:00.000Z")
      );

      const result = await getAccountTransactionsConcurrently({
        entities: [mockMainAccount],
        identity: mockIdentity,
        range: {
          from: beginningOfYear,
        },
      });

      expect(result).toHaveLength(1);
      expect(spyGetTransactions).toHaveBeenCalledTimes(1);

      expect(result[0].entity).toEqual(mainAccountEntity);
      expect(result[0].transactions).toEqual(allTransactions.slice(0, 2));
      expect(result[0].error).toBeUndefined();
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

  describe("getAllIcrcTransactionsFromAccountAndIdentity", () => {
    const mockIndexCanisterId = mockCanisterId;
    const mockAccount = {
      owner: mockMainAccount.principal,
    };

    it("should handle no transactions", async () => {
      spyGetIcrcTransactions.mockResolvedValue({
        transactions: [],
        balance: 0n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
      });

      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetIcrcTransactions).toHaveBeenCalledWith({
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        maxResults: 50n,
        start: undefined,
        account: mockAccount,
      });
      expect(result).toEqual({
        transactions: [],
        balance: 0n,
      });
    });

    it("should handle no transactions in following pages", async () => {
      const firstBatch = Array.from({ length: 50 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetIcrcTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          balance: 1000n,
        })
        .mockResolvedValueOnce({
          transactions: [],
          balance: 1000n,
        });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
      });

      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(2);
      expect(spyGetIcrcTransactions).toHaveBeenCalledWith({
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        maxResults: 50n,
        start: undefined,
        account: mockAccount,
      });
      expect(result).toEqual({
        transactions: firstBatch,
        balance: 1000n,
      });
    });

    it("should fetch all transactions in one single call", async () => {
      const mockTransactions = [
        createIcrcTransactionWithId({}),
        createIcrcTransactionWithId({}),
      ];

      spyGetIcrcTransactions.mockResolvedValue({
        transactions: mockTransactions,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
      });

      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetIcrcTransactions).toHaveBeenCalledWith({
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        maxResults: 50n,
        start: undefined,
        account: mockAccount,
      });
      expect(result).toEqual({
        transactions: mockTransactions,
        balance: 1000n,
      });
    });

    it("should fetch all transactions in multiple iterations", async () => {
      const firstBatch = Array.from({ length: 50 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );
      const secondBatch = [
        createIcrcTransactionWithId({ id: 51n }),
        createIcrcTransactionWithId({ id: 52n }),
      ];

      spyGetIcrcTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          balance: 1000n,
        })
        .mockResolvedValueOnce({
          transactions: secondBatch,
          balance: 1000n,
        });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
      });

      expect(result).toEqual({
        transactions: [...firstBatch, ...secondBatch],
        balance: 1000n,
      });
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(2);
      expect(spyGetIcrcTransactions).toHaveBeenNthCalledWith(1, {
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        maxResults: 50n,
        start: undefined,
        account: mockAccount,
      });
      expect(spyGetIcrcTransactions).toHaveBeenNthCalledWith(2, {
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        maxResults: 50n,
        start: 50n,
        account: mockAccount,
      });
    });

    it("should respect the max iterations limit", async () => {
      const mockTransactions = Array.from({ length: 50 }, (_, i) =>
        createTransactionWithId({ id: BigInt(i + 1) })
      );

      spyGetIcrcTransactions.mockResolvedValue({
        transactions: mockTransactions,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
      });

      expect(result.transactions.length).toBe(2500);
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(50);
    });

    it("should handle errors and return accumulated transactions", async () => {
      const firstBatch = [
        createIcrcTransactionWithId({ id: 3n }),
        createIcrcTransactionWithId({ id: 2n }),
      ];

      spyGetIcrcTransactions
        .mockResolvedValueOnce({
          transactions: firstBatch,
          balance: 1000n,
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
      });

      expect(result).toEqual({ transactions: firstBatch, balance: 1000n });
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
    });

    it('should filter "to" the provided date excluding to', async () => {
      const allTransactions = [
        createIcrcTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 2n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
      ];

      spyGetIcrcTransactions.mockResolvedValue({
        transactions: allTransactions,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        range: {
          to: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions).toEqual(allTransactions.slice(2));
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
    });

    it('should filter "from" the provided date', async () => {
      const allTransactions = [
        createIcrcTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 2n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
      ];

      spyGetIcrcTransactions.mockResolvedValue({
        transactions: allTransactions,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        range: {
          from: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result.transactions).toHaveLength(2);
      expect(result.transactions).toEqual(allTransactions.slice(0, 2));
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
    });

    it("should handle date range where no transactions match", async () => {
      const allTransactions = [
        createIcrcTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-29T00:00:00.000Z"),
        }),
      ];

      spyGetIcrcTransactions.mockResolvedValue({
        transactions: allTransactions,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        range: {
          to: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
          from: dateToNanoSeconds(new Date("2022-12-31T00:00:00.000Z")),
        },
      });

      expect(result.transactions).toHaveLength(0);
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
    });

    it('should return early if the last transaction in the current page is older than "from" date', async () => {
      const firstBatch = [
        createIcrcTransactionWithId({
          id: 3n,
          timestamp: new Date("2023-01-02T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
      ];

      spyGetIcrcTransactions.mockResolvedValueOnce({
        transactions: firstBatch,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        range: {
          from: dateToNanoSeconds(new Date("2023-01-01T00:00:00.000Z")),
        },
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions).toEqual([firstBatch[0]]);
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
    });

    it('should handle a range with both "from" and "to" dates', async () => {
      const allTransactions = [
        createIcrcTransactionWithId({
          id: 6n,
          timestamp: new Date("2023-02-02T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 5n,
          timestamp: new Date("2023-01-01T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 4n,
          timestamp: new Date("2022-12-31T10:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 3n,
          timestamp: new Date("2022-12-31T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 2n,
          timestamp: new Date("2022-12-30T00:00:00.000Z"),
        }),
        createIcrcTransactionWithId({
          id: 1n,
          timestamp: new Date("2022-11-20T00:00:00.000Z"),
        }),
      ];

      spyGetIcrcTransactions.mockResolvedValueOnce({
        transactions: allTransactions,
        balance: 1000n,
      });

      const result = await getAllIcrcTransactionsFromAccountAndIdentity({
        account: mockAccount,
        identity: mockSignInIdentity,
        indexCanisterId: mockIndexCanisterId,
        range: {
          to: dateToNanoSeconds(new Date("2023-01-02T00:00:00.000Z")),
          from: dateToNanoSeconds(new Date("2022-11-30T00:00:00.000Z")),
        },
      });
      expect(result.transactions).toHaveLength(4);
      expect(result.transactions).toEqual(allTransactions.slice(1, -1));
      expect(spyGetIcrcTransactions).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllIcrcTransactionsForCkTokens", () => {
    const mockAccount = {
      owner: mockMainAccount.principal,
    };

    it("should fetch transactions for all CK tokens", async () => {
      const mockToken = { symbol: "CKBTC" };
      const mockTransactions = [createIcrcTransactionWithId({})];

      spyMapPool.mockResolvedValue([
        {
          status: "fulfilled",
          value: { token: mockToken, transactions: mockTransactions, balance: 100n },
        },
        {
          status: "fulfilled",
          value: { token: mockToken, transactions: mockTransactions, balance: 100n },
        },
      ]);

      const result = await getAllIcrcTransactionsForCkTokens({
        identity: mockSignInIdentity,
        account: mockAccount,
        range: undefined,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        token: mockToken,
        transactions: mockTransactions,
        balance: 100n,
      });
      expect(result[1]).toEqual({
        token: mockToken,
        transactions: mockTransactions,
        balance: 100n,
      });
    });

    it("should handle errors and skip failed tokens", async () => {
      const mockToken = { symbol: "CKBTC" };
      const mockTransactions = [createIcrcTransactionWithId({})];

      spyMapPool.mockResolvedValue([
        {
          status: "fulfilled",
          value: { token: mockToken, transactions: mockTransactions, balance: 100n },
        },
        {
          status: "rejected",
          reason: new Error("Token error"),
          item: { ledgerCanisterId: "ledger2" },
        },
      ]);

      const result = await getAllIcrcTransactionsForCkTokens({
        identity: mockSignInIdentity,
        account: mockAccount,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        token: mockToken,
        transactions: mockTransactions,
        balance: 100n,
      });
      expect(console.warn).toHaveBeenCalledWith(
        "Skipped token due to error:",
        "ledger2",
        expect.any(Error)
      );
    });
  });
});
