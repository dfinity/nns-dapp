import * as agent from "$lib/api/agent.api";
import {
  getLedgerId,
  getTransactions,
  listSubaccounts,
  type GetTransactionsParams,
} from "$lib/api/icrc-index.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { HttpAgent } from "@dfinity/agent";
import { IcrcIndexCanister, IcrcIndexNgCanister } from "@dfinity/ledger-icrc";
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
  let spyOnIndexCanisterCreate;

  const indexNgCanisterMock = mock<IcrcIndexNgCanister>();
  let spyOnIndexNgCanisterCreate;

  const agentMock = mock<HttpAgent>();

  beforeEach(() => {
    spyOnIndexCanisterCreate = vi
      .spyOn(IcrcIndexCanister, "create")
      .mockImplementation(() => indexCanisterMock);

    spyOnIndexNgCanisterCreate = vi
      .spyOn(IcrcIndexNgCanister, "create")
      .mockImplementation(() => indexNgCanisterMock);

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

      expect(spyOnIndexCanisterCreate).toBeCalledTimes(1);
      expect(spyOnIndexCanisterCreate).toBeCalledWith({
        agent: agentMock,
        canisterId: params.indexCanisterId,
      });

      expect(indexCanisterMock.getTransactions).toBeCalledTimes(1);
      expect(indexCanisterMock.getTransactions).toBeCalledWith({
        max_results: params.maxResults,
        start: undefined,
        account: params.account,
      });

      expect(result.transactions).toEqual(transactions);
      expect(result.oldestTxId).toEqual(oldestTxId);
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

      expect(spyOnIndexCanisterCreate).toBeCalledTimes(1);
      expect(spyOnIndexCanisterCreate).toBeCalledWith({
        agent: agentMock,
        canisterId: params.indexCanisterId,
      });

      expect(indexCanisterMock.getTransactions).toBeCalledTimes(1);
      expect(indexCanisterMock.getTransactions).toBeCalledWith({
        max_results: params.maxResults,
        start,
        account: params.account,
      });
    });

    it("throws an error if canister throws", async () => {
      const err = new Error("test");
      indexCanisterMock.getTransactions.mockRejectedValue(err);

      const call = () => getTransactions(params);

      await expect(call).rejects.toThrowError(err);
    });
  });

  describe("getLedgerId", () => {
    const indexCanisterId = principal(0);
    const ledgerCanisterId = principal(1);

    it("returns ledger id", async () => {
      indexNgCanisterMock.ledgerId.mockResolvedValue(ledgerCanisterId);
      const resultPrincipal = await getLedgerId({
        identity: mockIdentity,
        indexCanisterId,
        certified: true,
      });

      expect(spyOnIndexNgCanisterCreate).toBeCalledTimes(1);
      expect(spyOnIndexNgCanisterCreate).toBeCalledWith({
        agent: agentMock,
        canisterId: indexCanisterId,
      });

      expect(resultPrincipal).toEqual(ledgerCanisterId);

      expect(indexNgCanisterMock.ledgerId).toBeCalledTimes(1);
      expect(indexNgCanisterMock.ledgerId).toBeCalledWith({
        certified: true,
      });
    });

    it("throws an error if canister throws", async () => {
      const err = new Error("test");
      indexNgCanisterMock.ledgerId.mockRejectedValue(err);

      const call = () =>
        getLedgerId({
          identity: mockIdentity,
          indexCanisterId,
          certified: true,
        });

      await expect(call).rejects.toThrowError(err);
    });
  });

  describe("listSubaccounts", () => {
    const subaccounts = [mockSubAccountArray, mockSubAccountArray];
    const indexCanisterId = principal(0);

    it("returns subaccounts", async () => {
      indexNgCanisterMock.listSubaccounts.mockResolvedValue(subaccounts);
      const result = await listSubaccounts({
        identity: mockIdentity,
        indexCanisterId,
      });

      expect(spyOnIndexNgCanisterCreate).toBeCalledTimes(1);
      expect(spyOnIndexNgCanisterCreate).toBeCalledWith({
        agent: agentMock,
        canisterId: indexCanisterId,
      });

      expect(indexNgCanisterMock.listSubaccounts).toBeCalledTimes(1);
      expect(indexNgCanisterMock.listSubaccounts).toBeCalledWith({
        owner: mockIdentity.getPrincipal(),
      });

      expect(result).toEqual(subaccounts);
    });

    it("throws an error if canister throws", async () => {
      const err = new Error("test");
      indexNgCanisterMock.listSubaccounts.mockRejectedValue(err);

      const call = () =>
        listSubaccounts({
          identity: mockIdentity,
          indexCanisterId,
        });

      await expect(call).rejects.toThrowError(err);
    });
  });
});
