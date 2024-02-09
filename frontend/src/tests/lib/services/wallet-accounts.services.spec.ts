import * as ledgerApi from "$lib/api/icrc-ledger.api";
import * as walletApi from "$lib/api/wallet-ledger.api";
import {
  CKBTC_LEDGER_CANISTER_ID,
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
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
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

    it("should call queryIcrcBalance and load accounts in store", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockResolvedValue(mockCkBTCMainAccount.balanceUlps);

      await loadAccounts({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID });

      await tick();

      const store = get(icrcAccountsStore);

      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts).toHaveLength(
        1
      );
      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts[0]).toEqual(
        mockCkBTCMainAccount
      );
      expect(spyQuery).toBeCalled();
    });

    it("should use the strategy to set certified in api call and store", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockResolvedValue(mockCkBTCMainAccount.balanceUlps);

      await loadAccounts({
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
        strategy: "query",
      });

      expect(
        get(icrcAccountsStore)[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts
      ).toHaveLength(1);
      expect(
        get(icrcAccountsStore)[CKBTC_UNIVERSE_CANISTER_ID.toText()].certified
      ).toBe(false);
      expect(spyQuery).toBeCalledTimes(1);
      expect(spyQuery).toBeCalledWith({
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        identity: mockIdentity,
        certified: false,
        account: {
          owner: mockIdentity.getPrincipal(),
        },
      });
    });

    it("should call error callback", async () => {
      const spyQuery = vi
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockRejectedValue(new Error());

      const spy = vi.fn();

      await loadAccounts({
        handleError: spy,
        ledgerCanisterId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback if query fails strategy is query", async () => {
      vi.spyOn(ledgerApi, "queryIcrcBalance").mockImplementation(
        async ({ certified }) => {
          if (certified) {
            return mockCkBTCMainAccount.balanceUlps;
          }
          throw new Error();
        }
      );

      const spy = vi.fn();

      await loadAccounts({
        handleError: spy,
        ledgerCanisterId: CKBTC_UNIVERSE_CANISTER_ID,
        strategy: "query",
      });

      expect(spy).toBeCalled();
    });

    it("should not call error callback if query fails and update succeeds", async () => {
      vi.spyOn(ledgerApi, "queryIcrcBalance").mockImplementation(
        async ({ certified }) => {
          if (certified) {
            return mockCkBTCMainAccount.balanceUlps;
          }
          throw new Error();
        }
      );

      const spy = vi.fn();

      await loadAccounts({
        handleError: spy,
        ledgerCanisterId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(spy).not.toBeCalled();
    });

    it("should empty store if update call fails", async () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      icrcTransactionsStore.addTransactions({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        accountIdentifier: mockCkBTCMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId: undefined,
        completed: false,
      });

      vi.spyOn(ledgerApi, "queryIcrcBalance").mockRejectedValue(new Error());

      await loadAccounts({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID });

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
        .spyOn(ledgerApi, "queryIcrcBalance")
        .mockResolvedValue(mockCkBTCMainAccount.balanceUlps);

      const spyTokenQuery = vi
        .spyOn(walletApi, "getToken")
        .mockResolvedValue(mockCkBTCToken);

      await syncAccounts({
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
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
