import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import {
  CKBTC_INDEX_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/ckbtc-accounts.services";
import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
import { loadCkBTCAccountTransactions } from "$lib/services/ckbtc-transactions.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { tick } from "svelte";
import { get } from "svelte/store";

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("ckbtc-accounts-services", () => {
  describe("loadCkBTCAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      icrcAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.getSnsAccounts and load neurons in store", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

      await loadCkBTCAccounts({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      await tick();

      const store = get(icrcAccountsStore);

      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts).toHaveLength(
        1
      );
      expect(spyQuery).toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockRejectedValue(new Error());

      const spy = jest.fn();

      await loadCkBTCAccounts({
        handleError: spy,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should empty store if update call fails", async () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      icrcTransactionsStore.addTransactions({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        accountIdentifier: mockCkBTCMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId: undefined,
        completed: false,
      });

      jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockImplementation(() => Promise.reject(undefined));

      await loadCkBTCAccounts({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      const store = get(icrcAccountsStore);
      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toBeUndefined();

      const transactionsStore = get(icrcTransactionsStore);
      expect(
        transactionsStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]
      ).toBeUndefined();
    });
  });

  describe("syncCkBTCAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      icrcAccountsStore.reset();
    });

    it("should call ckBTC accounts and token and load them in store", async () => {
      const spyAccountsQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

      const spyTokenQuery = jest
        .spyOn(ledgerApi, "getCkBTCToken")
        .mockImplementation(() => Promise.resolve(mockCkBTCToken));

      await services.syncCkBTCAccounts({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      await tick();

      expect(spyAccountsQuery).toBeCalled();
      expect(spyTokenQuery).toBeCalled();

      const accountsStore = get(icrcAccountsStore);
      expect(
        accountsStore[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts
      ).toHaveLength(1);

      const tokenStore = get(ckBTCTokenStore);
      expect(tokenStore).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
          token: mockCkBTCToken,
          certified: true,
        },
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: undefined,
      });
    });
  });

  describe("ckBTCTransferTokens", () => {
    const spyAccounts = jest
      .spyOn(ledgerApi, "getCkBTCAccount")
      .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

    beforeEach(() => {
      jest.clearAllMocks();
      icrcAccountsStore.reset();
    });

    afterEach(() => {
      tokensStore.reset();
    });

    it("should call ckBTC transfer tokens", async () => {
      tokensStore.setTokens(mockTokens);

      const spyTransfer = jest
        .spyOn(ledgerApi, "ckBTCTransfer")
        .mockResolvedValue(456n);

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockCkBTCMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: CKBTC_INDEX_CANISTER_ID,
      });

      expect(blockIndex).toEqual(456n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should load transactions if flag is passed", async () => {
      tokensStore.setTokens(mockTokens);

      const spyTransfer = jest
        .spyOn(ledgerApi, "ckBTCTransfer")
        .mockResolvedValue(456n);

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: true,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: CKBTC_INDEX_CANISTER_ID,
      });

      expect(blockIndex).toEqual(456n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
      expect(loadCkBTCAccountTransactions).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);
      tokensStore.setTokens(mockTokens);

      const spyTransfer = jest
        .spyOn(ledgerApi, "ckBTCTransfer")
        .mockRejectedValue(new Error("test error"));

      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: CKBTC_INDEX_CANISTER_ID,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });

    it("should show toast and return success false if there is no transaction fee", async () => {
      tokensStore.reset();

      const spyTransfer = jest
        .spyOn(ledgerApi, "ckBTCTransfer")
        .mockRejectedValue(new Error("test error"));

      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        loadTransactions: false,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: CKBTC_INDEX_CANISTER_ID,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).not.toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });
});
