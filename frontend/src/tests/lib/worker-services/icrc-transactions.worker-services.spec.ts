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
    jest.clearAllMocks();

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
    fetchRootKey: true,
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
});
