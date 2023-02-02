import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/ckbtc-accounts.services";
import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { tick } from "svelte";
import { get } from "svelte/store";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "../../mocks/ckbtc-accounts.mock";
import { mockIcrcTransactionWithId } from "../../mocks/icrc-transactions.mock";

describe("ckbtc-accounts-services", () => {
  describe("loadCkBTCAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      ckBTCAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.getSnsAccounts and load neurons in store", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.resolve([mockCkBTCMainAccount]));

      await loadCkBTCAccounts({});

      await tick();

      const store = get(ckBTCAccountsStore);

      expect(store.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockRejectedValue(new Error());

      const spy = jest.fn();

      await loadCkBTCAccounts({
        handleError: spy,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should empty store if update call fails", async () => {
      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });
      icrcTransactionsStore.addTransactions({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        accountIdentifier: mockCkBTCMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId: undefined,
        completed: false,
      });

      jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.reject(undefined));

      await loadCkBTCAccounts({});

      const store = get(ckBTCAccountsStore);
      expect(store.accounts).toHaveLength(0);

      const transactionsStore = get(icrcTransactionsStore);
      expect(
        transactionsStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]
      ).toBeUndefined();
    });
  });

  describe("syncCkBTCAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      ckBTCAccountsStore.reset();
    });

    it("should call ckBTC accounts and token and load them in store", async () => {
      const spyAccountsQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.resolve([mockCkBTCMainAccount]));

      const spyTokenQuery = jest
        .spyOn(ledgerApi, "getCkBTCToken")
        .mockImplementation(() => Promise.resolve(mockCkBTCToken));

      await services.syncCkBTCAccounts({});

      await tick();

      expect(spyAccountsQuery).toBeCalled();
      expect(spyTokenQuery).toBeCalled();

      const accountsStore = get(ckBTCAccountsStore);
      expect(accountsStore.accounts).toHaveLength(1);

      const tokenStore = get(ckBTCTokenStore);
      expect(tokenStore).toEqual({
        token: mockCkBTCToken,
        certified: true,
      });
    });
  });
});
