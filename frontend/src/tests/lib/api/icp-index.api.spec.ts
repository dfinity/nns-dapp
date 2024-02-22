import * as agent from "$lib/api/agent.api";
import { getTransactions } from "$lib/api/icp-index.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import type { HttpAgent } from "@dfinity/agent";
import {
  IndexCanister,
  type GetAccountIdentifierTransactionsResponse,
  type TransactionWithId,
} from "@dfinity/ledger-icp";
import { mock } from "vitest-mock-extended";

describe("icp-index.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("icp-index api", () => {
    const { identifier: accountIdentifier } = mockMainAccount;

    const defaultTransactinoWithId: TransactionWithId = {
      id: 1234n,
      transaction: {
        memo: 0n,
        icrc1_memo: [],
        operation: {
          Transfer: {
            to: "1234",
            fee: { e8s: 10_000n },
            from: "56789",
            amount: { e8s: 100_000_000n },
            spender: [],
          },
        },
        created_at_time: [],
      },
    };
    const defaultResponse: GetAccountIdentifierTransactionsResponse = {
      transactions: [defaultTransactinoWithId],
      oldest_tx_id: [1234n],
      balance: 200_000_000n,
    };
    let currentResponse = defaultResponse;
    const indexCanisterMock = mock<IndexCanister>();

    beforeEach(() => {
      currentResponse = defaultResponse;
      indexCanisterMock.getTransactions.mockImplementation(
        async () => currentResponse
      );
      vi.spyOn(IndexCanister, "create").mockImplementation(
        (): IndexCanister => indexCanisterMock
      );
    });

    describe("getTransactions", () => {
      it("should call the index canister method to get transactions", async () => {
        const maxResults = 20n;
        expect(IndexCanister.create).toHaveBeenCalledTimes(0);

        const response = await getTransactions({
          identity: mockIdentity,
          maxResults,
          accountIdentifier,
        });

        expect(IndexCanister.create).toHaveBeenCalledTimes(1);
        expect(indexCanisterMock.getTransactions).toHaveBeenCalledWith({
          start: undefined,
          accountIdentifier,
          maxResults,
        });
        expect(response).toEqual({
          oldestTxId: defaultResponse.oldest_tx_id[0],
          transactions: [defaultTransactinoWithId],
          balance: defaultResponse.balance,
        });
      });

      it("should pass the start parameter", async () => {
        const maxResults = 20n;
        const start = 1234n;
        expect(IndexCanister.create).toHaveBeenCalledTimes(0);

        await getTransactions({
          identity: mockIdentity,
          maxResults,
          accountIdentifier,
          start,
        });

        expect(IndexCanister.create).toHaveBeenCalledTimes(1);
        expect(indexCanisterMock.getTransactions).toHaveBeenCalledWith({
          start,
          accountIdentifier,
          maxResults,
        });
      });

      it("should return undefined old tx index if not present in response", async () => {
        const maxResults = 20n;
        currentResponse = {
          ...defaultResponse,
          oldest_tx_id: [],
        };
        expect(IndexCanister.create).toHaveBeenCalledTimes(0);

        const response = await getTransactions({
          identity: mockIdentity,
          maxResults,
          accountIdentifier,
        });

        expect(response).toEqual({
          oldestTxId: undefined,
          transactions: [defaultTransactinoWithId],
          balance: defaultResponse.balance,
        });
      });
    });
  });
});
