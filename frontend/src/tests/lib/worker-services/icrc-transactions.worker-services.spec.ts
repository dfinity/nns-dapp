import {
  DEFAULT_INDEX_TRANSACTION_MAX_PAGES,
  DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT,
} from "$lib/constants/constants";
import { HOST } from "$lib/constants/environment.constants";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import { getIcrcAccountsTransactions } from "$lib/worker-services/icrc-transactions.worker-services";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import * as dfinityUtils from "@dfinity/utils";
import { isNullish, nonNullish } from "@dfinity/utils";
import {
  IcrcIndexCanister,
  type IcrcIndexDid,
} from "@icp-sdk/canisters/ledger/icrc";
import { mock } from "vitest-mock-extended";

describe("transactions.worker-services", () => {
  const indexCanisterMock = mock<IcrcIndexCanister>();

  beforeEach(() => {
    vi.spyOn(IcrcIndexCanister, "create").mockImplementation(
      () => indexCanisterMock
    );
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
  });

  const transaction = {
    burn: [],
  } as unknown as IcrcIndexDid.Transaction;

  const request: Omit<
    PostMessageDataRequestTransactions,
    "accountIdentifiers"
  > = {
    host: HOST,
    fetchRootKey: false,
    indexCanisterId: mockCanisterId.toText(),
  };

  it("should returns new transactions", async () => {
    const id = 1n;
    const transactions = [{ transaction, id }];

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions,
        oldest_tx_id: [],
        balance: 0n,
      });

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {},
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(1);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions,
        mostRecentTxId: id,
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should returns new transactions for multiple accounts", async () => {
    const id = 1n;
    const transactions = [{ transaction, id }];

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions,
        oldest_tx_id: [],
        balance: 0n,
      });

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [
        mockSnsMainAccount.identifier,
        mockSnsSubAccount.identifier,
      ],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {},
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(2);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions,
        mostRecentTxId: id,
        oldestTxId: undefined,
        balance: 0n,
      },
      {
        accountIdentifier: mockSnsSubAccount.identifier,
        transactions,
        mostRecentTxId: id,
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should prevent duplicating transactions in results", async () => {
    const ids = [...Array(5)].map((_, i) => BigInt(i)).reverse();
    const transactions = ids.map((id) => ({ transaction, id }));

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions: [...transactions, ...transactions],
        oldest_tx_id: [],
        balance: 0n,
      });

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {},
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(1);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions,
        mostRecentTxId: ids[0],
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should fetch recursively all transactions", async () => {
    const mostRecentTxId = 100n;

    const ids = [...Array(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT + 5)]
      .map((_, i) => BigInt(i) + mostRecentTxId)
      .reverse();
    const transactions = ids.map((id) => ({ transaction, id }));

    let firstCall = true;

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockImplementation(
        async (): Promise<IcrcIndexDid.GetTransactions> => {
          if (firstCall) {
            firstCall = false;

            return {
              transactions: transactions.slice(
                0,
                DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT
              ),
              oldest_tx_id: [],
              balance: 0n,
            };
          }

          return {
            transactions: transactions.slice(
              DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT
            ),
            oldest_tx_id: [],
            balance: 0n,
          };
        }
      );

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {
        [mockSnsMainAccount.identifier]: {
          key: mockSnsMainAccount.identifier,
          transactions: [],
          mostRecentTxId,
          oldestTxId: undefined,
          certified: true,
          balance: 0n,
        },
      },
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(2);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions,
        mostRecentTxId: ids[0],
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should stop when a page of the index canister makes no progress", async () => {
    const mostRecentTxId = 100n;

    // The index canister ignores "start" and answers the same page every time.
    const ids = [...Array(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT)]
      .map((_, i) => mostRecentTxId + 1n + BigInt(i))
      .reverse();

    let callCount = 0;

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockImplementation(
        async (): Promise<IcrcIndexDid.GetTransactions> => {
          callCount++;

          if (callCount > 5) {
            throw new Error("The index canister was called without an end");
          }

          return {
            transactions: ids.map((id) => ({ transaction, id })),
            oldest_tx_id: [],
            balance: 0n,
          };
        }
      );

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {
        [mockSnsMainAccount.identifier]: {
          key: mockSnsMainAccount.identifier,
          transactions: [],
          mostRecentTxId,
          oldestTxId: undefined,
          certified: true,
          balance: 0n,
        },
      },
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(2);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: ids.map((id) => ({ transaction, id })),
        mostRecentTxId: ids[0],
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should stop after DEFAULT_INDEX_TRANSACTION_MAX_PAGES pages", async () => {
    const newestTxId = 10_000n;

    // The index canister makes progress but never reaches the most recent
    // transaction id of the state.
    let callCount = 0;

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockImplementation(
        async ({ start }): Promise<IcrcIndexDid.GetTransactions> => {
          callCount++;

          if (callCount > DEFAULT_INDEX_TRANSACTION_MAX_PAGES + 5) {
            throw new Error("The index canister was called without an end");
          }

          const newest = nonNullish(start) ? start - 1n : newestTxId;
          const ids = [...Array(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT)].map(
            (_, i) => newest - BigInt(i)
          );

          return {
            transactions: ids.map((id) => ({ transaction, id })),
            oldest_tx_id: [],
            balance: 0n,
          };
        }
      );

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {
        [mockSnsMainAccount.identifier]: {
          key: mockSnsMainAccount.identifier,
          transactions: [],
          mostRecentTxId: 0n,
          oldestTxId: undefined,
          certified: true,
          balance: 0n,
        },
      },
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(
      DEFAULT_INDEX_TRANSACTION_MAX_PAGES
    );

    expect(results[0].transactions).toHaveLength(
      DEFAULT_INDEX_TRANSACTION_MAX_PAGES * DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT
    );
  });

  it("should start each next call at the oldest transaction id of the previous page", async () => {
    const mostRecentTxId = 5n;

    const idsFrom = (from: bigint, to: bigint): bigint[] =>
      [...Array(Number(from - to) + 1)].map((_, i) => from - BigInt(i));

    const pages = [idsFrom(60n, 41n), idsFrom(41n, 22n), idsFrom(22n, 5n)];

    let callCount = 0;

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockImplementation(
        async (): Promise<IcrcIndexDid.GetTransactions> => {
          const ids = pages[callCount];
          callCount++;

          if (isNullish(ids)) {
            throw new Error("The index canister was called once too many");
          }

          return {
            transactions: ids.map((id) => ({ transaction, id })),
            oldest_tx_id: [],
            balance: 0n,
          };
        }
      );

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {
        [mockSnsMainAccount.identifier]: {
          key: mockSnsMainAccount.identifier,
          transactions: [],
          mostRecentTxId,
          oldestTxId: undefined,
          certified: true,
          balance: 0n,
        },
      },
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(3);

    expect(getTransactionsSpy.mock.calls[0][0].start).toBeUndefined();
    expect(getTransactionsSpy.mock.calls[1][0].start).toEqual(41n);
    expect(getTransactionsSpy.mock.calls[2][0].start).toEqual(22n);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: idsFrom(60n, 5n).map((id) => ({ transaction, id })),
        mostRecentTxId: 60n,
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should stop when a page holds only the transaction it started from", async () => {
    const mostRecentTxId = 100n;

    const ids = [...Array(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT)]
      .map((_, i) => mostRecentTxId + 1n + BigInt(i))
      .reverse();

    let callCount = 0;

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockImplementation(
        async (): Promise<IcrcIndexDid.GetTransactions> => {
          callCount++;

          if (callCount > 2) {
            throw new Error("The index canister was called once too many");
          }

          // The second page holds only the transaction the call started from.
          const pageIds = callCount === 1 ? ids : [ids[ids.length - 1]];

          return {
            transactions: pageIds.map((id) => ({ transaction, id })),
            oldest_tx_id: [],
            balance: 0n,
          };
        }
      );

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {
        [mockSnsMainAccount.identifier]: {
          key: mockSnsMainAccount.identifier,
          transactions: [],
          mostRecentTxId,
          oldestTxId: undefined,
          certified: true,
          balance: 0n,
        },
      },
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(2);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: ids.map((id) => ({ transaction, id })),
        mostRecentTxId: ids[0],
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should return most recent transaction id", async () => {
    const ids = [...Array(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT)]
      .map((_, i) => BigInt(i) + 250n)
      .reverse();
    const transactions = ids.map((id) => ({ transaction, id }));

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions: [...transactions, ...transactions],
        oldest_tx_id: [],
        balance: 0n,
      });

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const results = await getIcrcAccountsTransactions({
      identity: mockIdentity,
      state: {
        [mockSnsMainAccount.identifier]: {
          key: mockSnsMainAccount.identifier,
          transactions: [],
          mostRecentTxId: undefined,
          oldestTxId: undefined,
          certified: true,
          balance: 0n,
        },
      },
      data,
    });

    expect(getTransactionsSpy).toHaveBeenCalledTimes(1);

    expect(results).toEqual([
      {
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions,
        mostRecentTxId: ids[0],
        oldestTxId: undefined,
        balance: 0n,
      },
    ]);
  });

  it("should bubbles call errors", async () => {
    indexCanisterMock.getTransactions.mockImplementation(async () => {
      throw new Error();
    });

    const data: PostMessageDataRequestTransactions = {
      ...request,
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    const call = () =>
      getIcrcAccountsTransactions({
        identity: mockIdentity,
        state: {},
        data,
      });

    await expect(call).rejects.toThrowError();
  });
});
