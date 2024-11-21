import * as agent from "$lib/api/agent.api";
import {
  getLedgerId,
  getTransactions,
  type GetTransactionsParams,
} from "$lib/api/icrc-index.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { HttpAgent } from "@dfinity/agent";
import { IcrcIndexCanister } from "@dfinity/ledger-icrc";
import { mock } from "vitest-mock-extended";

describe("icrc-index api", () => {
  const params: GetTransactionsParams = {
    identity: mockIdentity,
    account: {
      owner: mockPrincipal,
    },
    maxResults: 10n,
    indexCanisterId: principal(0),
  };

  const indexCanisterMock = mock<IcrcIndexCanister>();
  const agentMock = mock<HttpAgent>();
  let spyOnIndexCanisterCreate;

  beforeEach(() => {
    spyOnIndexCanisterCreate = vi
      .spyOn(IcrcIndexCanister, "create")
      .mockImplementation(() => indexCanisterMock);
    vi.spyOn(agent, "createAgent").mockResolvedValue(agentMock);
  });

  describe("getTransactions", () => {
    const transactions = [mockIcrcTransactionWithId];
    const oldestTxId = 1234n;

    it("returns list of transaction", async () => {
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions,
        oldest_tx_id: [oldestTxId],
      });
      const result = await getTransactions(params);

      expect(result).not.toBeUndefined();

      expect(result.transactions).toEqual(transactions);
      expect(result.oldestTxId).toEqual(oldestTxId);

      expect(indexCanisterMock.getTransactions).toBeCalledTimes(1);
      expect(indexCanisterMock.getTransactions).toBeCalledWith({
        max_results: params.maxResults,
        start: undefined,
        account: params.account,
      });
    });

    it("passes start parameter", async () => {
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions,
        oldest_tx_id: [oldestTxId],
      });
      const start = 23n;
      await getTransactions({
        ...params,
        start,
      });

      expect(indexCanisterMock.getTransactions).toBeCalledTimes(1);
      expect(indexCanisterMock.getTransactions).toBeCalledWith({
        max_results: params.maxResults,
        start,
        account: params.account,
      });
    });

    it("throws an error if canister throws", () => {
      const err = new Error("test");
      indexCanisterMock.getTransactions.mockRejectedValue(err);

      const call = () => getTransactions(params);

      expect(call).rejects.toThrowError(err);
    });
  });

  describe("getLedgerId", () => {
    const indexCanisterId = principal(0);
    const ledgerCanisterId = principal(1);

    it("returns ledger id", async () => {
      indexCanisterMock.ledgerId.mockResolvedValue(ledgerCanisterId);
      const resultPrincipal = await getLedgerId({
        identity: mockIdentity,
        indexCanisterId,
        certified: true,
      });

      expect(spyOnIndexCanisterCreate).toBeCalledTimes(1);
      expect(spyOnIndexCanisterCreate).toBeCalledWith({
        agent: agentMock,
        canisterId: indexCanisterId,
      });

      expect(resultPrincipal).toEqual(ledgerCanisterId);

      expect(indexCanisterMock.ledgerId).toBeCalledTimes(1);
      expect(indexCanisterMock.ledgerId).toBeCalledWith({
        certified: true,
      });
    });

    it("throws an error if canister throws", () => {
      const err = new Error("test");
      indexCanisterMock.ledgerId.mockRejectedValue(err);

      const call = () =>
        getLedgerId({
          identity: mockIdentity,
          indexCanisterId,
          certified: true,
        });

      expect(call).rejects.toThrowError(err);
    });
  });
});
