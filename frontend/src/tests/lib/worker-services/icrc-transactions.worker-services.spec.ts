import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { HOST } from "$lib/constants/environment.constants";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import { getIcrcAccountsTransactions } from "$lib/worker-services/icrc-transactions.worker-services";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { IcrcIndexCanister, type IcrcTransaction } from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";

describe("transactions.worker-services", () => {
  const indexCanisterMock = mock<IcrcIndexCanister>();

  beforeEach(() => {
    vi.clearAllMocks();

    jest
      .spyOn(IcrcIndexCanister, "create")
      .mockImplementation(() => indexCanisterMock);
  });

  const transaction = {
    burn: [],
  } as unknown as IcrcTransaction;

  const request: Omit<
    PostMessageDataRequestTransactions,
    "accountIdentifiers"
  > = {
    host: HOST,
    fetchRootKey: false,
    indexCanisterId: mockCanisterId.toText(),
  };

  it("should returns new transactions", async () => {
    const id = BigInt(1);
    const transactions = [{ transaction, id }];

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions,
        oldest_tx_id: [],
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
      },
    ]);
  });

  it("should returns new transactions for multiple accounts", async () => {
    const id = BigInt(1);
    const transactions = [{ transaction, id }];

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions,
        oldest_tx_id: [],
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
      },
      {
        accountIdentifier: mockSnsSubAccount.identifier,
        transactions,
        mostRecentTxId: id,
        oldestTxId: undefined,
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
      },
    ]);
  });

  it("should fetch recursively all transactions", async () => {
    const mostRecentTxId = 100n;

    const ids = [...Array(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT + 5)]
      .map((_, i) => BigInt(i) + mostRecentTxId)
      .reverse();
    const transactions = ids.map((id) => ({ transaction, id }));

    let firstCall = true;

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockImplementation(async () => {
        if (firstCall) {
          firstCall = false;

          return {
            transactions: transactions.slice(
              0,
              DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT
            ),
            oldest_tx_id: [],
          };
        }

        return {
          transactions: transactions.slice(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          oldest_tx_id: [],
        };
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
          mostRecentTxId,
          oldestTxId: undefined,
          certified: true,
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
      },
    ]);
  });

  it("should return most recent transaction id", async () => {
    const ids = [...Array(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT)]
      .map((_, i) => BigInt(i) + 250n)
      .reverse();
    const transactions = ids.map((id) => ({ transaction, id }));

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions: [...transactions, ...transactions],
        oldest_tx_id: [],
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

    expect(call).rejects.toThrowError();
  });
});
