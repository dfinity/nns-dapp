import * as ckbtcLedgerApi from "$lib/api/wallet-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import {
  loadAccounts,
  syncAccounts,
} from "$lib/services/wallet-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { tick } from "svelte";
import { get } from "svelte/store";

vi.mock("$lib/services/wallet-transactions.services", () => {
  return {
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

describe("wallet-accounts-services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  describe("loadAccounts", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      icrcAccountsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.getCkBTCAccount and load neurons in store", async () => {
      const spyQuery = vi
        .spyOn(ckbtcLedgerApi, "getAccount")
        .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

      await loadAccounts({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      await tick();

      const store = get(icrcAccountsStore);

      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts).toHaveLength(
        1
      );
      expect(spyQuery).toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = vi
        .spyOn(ckbtcLedgerApi, "getAccount")
        .mockRejectedValue(new Error());

      const spy = vi.fn();

      await loadAccounts({
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

      vi.spyOn(ckbtcLedgerApi, "getAccount").mockImplementation(() =>
        Promise.reject(undefined)
      );

      await loadAccounts({ universeId: CKBTC_UNIVERSE_CANISTER_ID });

      const store = get(icrcAccountsStore);
      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toBeUndefined();

      const transactionsStore = get(icrcTransactionsStore);
      expect(
        transactionsStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]
      ).toBeUndefined();
    });
  });

  describe("syncAccounts", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      icrcAccountsStore.reset();
    });

    it("should call ckBTC accounts and token and load them in store", async () => {
      const spyAccountsQuery = vi
        .spyOn(ckbtcLedgerApi, "getAccount")
        .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

      const spyTokenQuery = vi
        .spyOn(ckbtcLedgerApi, "getToken")
        .mockImplementation(() => Promise.resolve(mockCkBTCToken));

      await syncAccounts({
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
});
