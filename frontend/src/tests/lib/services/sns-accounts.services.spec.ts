import * as agent from "$lib/api/agent.api";
import * as ledgerApi from "$lib/api/icrc-ledger.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import { snsAccountsStore } from "$lib/derived/sns/sns-accounts.derived";
import * as services from "$lib/services/sns-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import * as toastsStore from "$lib/stores/toasts.store";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

describe("sns-accounts-services", () => {
  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("loadSnsAccounts", () => {
    const rootCanisterId = principal(1);
    const snsLedgerCanisterId = principal(2);

    beforeEach(() => {
      vi.clearAllMocks();
      icrcAccountsStore.reset();

      setSnsProjects([
        {
          rootCanisterId,
          ledgerCanisterId: snsLedgerCanisterId,
        },
      ]);
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.queryIcrcBalance and load neurons in store", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockResolvedValue(mockSnsMainAccount.balanceUlps);

      await services.loadSnsAccounts({ rootCanisterId });

      await tick();
      const store = get(snsAccountsStore);
      expect(store[rootCanisterId.toText()]?.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalledTimes(2);
      expect(spyQuery).toBeCalledWith({
        canisterId: snsLedgerCanisterId,
        identity: mockIdentity,
        certified: false,
        account: {
          owner: mockIdentity.getPrincipal(),
        },
      });
      expect(spyQuery).toBeCalledWith({
        canisterId: snsLedgerCanisterId,
        identity: mockIdentity,
        certified: true,
        account: {
          owner: mockIdentity.getPrincipal(),
        },
      });

      spyQuery.mockClear();
    });

    it("should call api.queryIcrcBalance with only the strategy passed", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockResolvedValue(mockSnsMainAccount.balanceUlps);

      await services.loadSnsAccounts({
        rootCanisterId,
        strategy: "query",
      });

      await tick();
      const store = get(snsAccountsStore);
      expect(store[rootCanisterId.toText()]?.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalledTimes(1);
      expect(spyQuery).toBeCalledWith({
        canisterId: snsLedgerCanisterId,
        identity: mockIdentity,
        certified: false,
        account: {
          owner: mockIdentity.getPrincipal(),
        },
      });

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockRejectedValue(new Error());

      const spy = vi.fn();

      await services.loadSnsAccounts({
        rootCanisterId,
        handleError: spy,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should not call error callback if query fails and update succeeds", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockImplementation(async ({ certified }) => {
          if (certified) {
            return mockSnsMainAccount.balanceUlps;
          }
          throw new Error();
        });

      const spy = vi.fn();

      await services.loadSnsAccounts({
        rootCanisterId,
        handleError: spy,
      });

      expect(spy).not.toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback if query fails and only query is requested", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockRejectedValue(new Error());

      const spy = vi.fn();

      await services.loadSnsAccounts({
        rootCanisterId,
        handleError: spy,
        strategy: "query",
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should empty store if update call fails", async () => {
      icrcAccountsStore.set({
        ledgerCanisterId: snsLedgerCanisterId,
        accounts: {
          accounts: [mockSnsMainAccount],
          certified: true,
        },
      });
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId: undefined,
        completed: false,
      });

      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockRejectedValue(undefined);

      const store = get(snsAccountsStore);
      return expect(store[rootCanisterId.toText()]).toBeDefined();

      await services.loadSnsAccounts({ rootCanisterId });

      await waitFor(() => {
        const store = get(snsAccountsStore);
        return expect(store[rootCanisterId.toText()]).toBeUndefined();
      });
      const transactionsStore = get(icrcTransactionsStore);
      expect(transactionsStore[rootCanisterId.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("snsTransferTokens", () => {
    let spyAccounts;

    beforeEach(() => {
      vi.clearAllMocks();
      icrcAccountsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      spyAccounts = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockResolvedValue(mockSnsMainAccount.balanceUlps);
    });

    it("should call sns transfer tokens", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: {
            ...mockSnsToken,
            fee: 100n,
          },
        },
      ]);
      const spyTransfer = vi
        .spyOn(snsLedgerApi, "snsTransfer")
        .mockResolvedValue(123n);

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
      });

      expect(blockIndex).toEqual(123n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: 100n },
        },
      ]);
      const spyTransfer = vi
        .spyOn(snsLedgerApi, "snsTransfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });

    it("should show toast and return success false if there is no transaction fee", async () => {
      resetSnsProjects();
      const spyTransfer = vi
        .spyOn(snsLedgerApi, "snsTransfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).not.toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });
});
