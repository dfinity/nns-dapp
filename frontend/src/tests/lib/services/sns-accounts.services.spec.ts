import * as agent from "$lib/api/agent.api";
import * as ledgerApi from "$lib/api/sns-ledger.api";
import * as services from "$lib/services/sns-accounts.services";
import { loadSnsAccountTransactions } from "$lib/services/sns-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/services/sns-transactions.services", () => ({
  loadSnsAccountTransactions: vi.fn(),
}));

describe("sns-accounts-services", () => {
  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("loadSnsAccounts", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      snsAccountsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.getSnsAccounts and load neurons in store", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

      await services.loadSnsAccounts({ rootCanisterId: mockPrincipal });

      await tick();
      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalledTimes(2);
      expect(spyQuery).toBeCalledWith({
        rootCanisterId: mockPrincipal,
        identity: mockIdentity,
        certified: false,
      });
      expect(spyQuery).toBeCalledWith({
        rootCanisterId: mockPrincipal,
        identity: mockIdentity,
        certified: true,
      });

      spyQuery.mockClear();
    });

    it("should call api.getSnsAccounts with only the strategy passed", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

      await services.loadSnsAccounts({
        rootCanisterId: mockPrincipal,
        strategy: "query",
      });

      await tick();
      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalledTimes(1);
      expect(spyQuery).toBeCalledWith({
        rootCanisterId: mockPrincipal,
        identity: mockIdentity,
        certified: false,
      });

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockRejectedValue(new Error());

      const spy = vi.fn();

      await services.loadSnsAccounts({
        rootCanisterId: mockPrincipal,
        handleError: spy,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should not call error callback if query fails and update succeeds", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(async ({ certified }) => {
          if (certified) {
            return [mockSnsMainAccount];
          }
          throw new Error();
        });

      const spy = vi.fn();

      await services.loadSnsAccounts({
        rootCanisterId: mockPrincipal,
        handleError: spy,
      });

      expect(spy).not.toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback if query fails and only query is requested", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockRejectedValue(new Error());

      const spy = vi.fn();

      await services.loadSnsAccounts({
        rootCanisterId: mockPrincipal,
        handleError: spy,
        strategy: "query",
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should empty store if update call fails", async () => {
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts: [mockSnsMainAccount],
        certified: true,
      });
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId: undefined,
        completed: false,
      });

      const spyQuery = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.reject(undefined));

      await services.loadSnsAccounts({ rootCanisterId: mockPrincipal });

      await waitFor(() => {
        const store = get(snsAccountsStore);
        return expect(store[mockPrincipal.toText()]).toBeUndefined();
      });
      const transactionsStore = get(icrcTransactionsStore);
      expect(transactionsStore[mockPrincipal.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("snsTransferTokens", () => {
    let spyAccounts;

    beforeEach(() => {
      vi.clearAllMocks();
      snsAccountsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      spyAccounts = vi
        .spyOn(ledgerApi, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));
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
        .spyOn(ledgerApi, "snsTransfer")
        .mockResolvedValue(123n);

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
      });

      expect(blockIndex).toEqual(123n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should load transactions if flag is passed", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: 100n },
        },
      ]);
      const spyTransfer = vi
        .spyOn(ledgerApi, "snsTransfer")
        .mockResolvedValue(123n);

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: true,
      });

      expect(blockIndex).toEqual(123n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
      expect(loadSnsAccountTransactions).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: 100n },
        },
      ]);
      const spyTransfer = vi
        .spyOn(ledgerApi, "snsTransfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });

    it("should show toast and return success false if there is no transaction fee", async () => {
      resetSnsProjects();
      const spyTransfer = vi
        .spyOn(ledgerApi, "snsTransfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).not.toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });
});
