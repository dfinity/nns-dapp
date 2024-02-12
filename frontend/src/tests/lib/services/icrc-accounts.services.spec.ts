import * as ledgerApi from "$lib/api/icrc-ledger.api";
import * as walletApi from "$lib/api/wallet-ledger.api";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import {
  getIcrcAccountIdentity,
  icrcTransferTokens,
  loadAccounts,
  loadIcrcToken,
  syncAccounts,
} from "$lib/services/icrc-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { tick } from "svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/icrc-ledger.api");

describe("icrc-accounts-services", () => {
  const ledgerCanisterId = principal(0);
  const ledgerCanisterId2 = principal(2);
  const balanceE8s = 314000000n;
  const balanceE8s2 = 222000000n;

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
    tokensStore.reset();
    icrcAccountsStore.reset();

    vi.spyOn(ledgerApi, "queryIcrcToken").mockResolvedValue(mockToken);
    vi.spyOn(ledgerApi, "queryIcrcBalance").mockImplementation(
      async ({ canisterId }) => {
        if (canisterId.toText() === ledgerCanisterId.toText()) {
          return balanceE8s;
        }
        if (canisterId.toText() === ledgerCanisterId2.toText()) {
          return balanceE8s2;
        }
      }
    );
  });

  describe("getIcrcAccountIdentity", () => {
    it("returns identity", async () => {
      const identity = await getIcrcAccountIdentity(mockSnsMainAccount);
      expect(identity).toEqual(mockIdentity);
    });
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

  describe("loadIcrcToken", () => {
    it("loads token from api into store", async () => {
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toBeUndefined();

      await loadIcrcToken({ ledgerCanisterId, certified: true });

      expect(get(tokensStore)[ledgerCanisterId.toText()]).toEqual({
        certified: true,
        token: mockToken,
      });
      expect(ledgerApi.queryIcrcToken).toHaveBeenCalledWith({
        certified: false,
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
      });
      expect(ledgerApi.queryIcrcToken).toHaveBeenCalledWith({
        certified: true,
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
      });
      expect(ledgerApi.queryIcrcToken).toHaveBeenCalledTimes(2);
    });

    it("loads token from api into store with query", async () => {
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toBeUndefined();

      await loadIcrcToken({ ledgerCanisterId, certified: false });

      expect(get(tokensStore)[ledgerCanisterId.toText()]).toEqual({
        certified: false,
        token: mockToken,
      });
      expect(ledgerApi.queryIcrcToken).toHaveBeenCalledWith({
        certified: false,
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
      });
      expect(ledgerApi.queryIcrcToken).toHaveBeenCalledTimes(1);
    });

    it("doesn't load token from api into store if requested certified false and already present", async () => {
      tokensStore.setToken({
        canisterId: ledgerCanisterId,
        token: mockToken,
        certified: false,
      });
      expect(ledgerApi.queryIcrcToken).not.toBeCalled();

      await loadIcrcToken({ ledgerCanisterId, certified: false });

      expect(ledgerApi.queryIcrcToken).not.toBeCalled();
    });

    it("doesn't load token from api into store if requested certified true and already store is loaded with certified data", async () => {
      tokensStore.setToken({
        canisterId: ledgerCanisterId,
        token: mockToken,
        certified: true,
      });
      expect(ledgerApi.queryIcrcToken).not.toBeCalled();

      await loadIcrcToken({ ledgerCanisterId, certified: true });

      expect(ledgerApi.queryIcrcToken).not.toBeCalled();
    });

    it("doesn't load token from api into store if requested certified false and already store is loaded with certified data", async () => {
      tokensStore.setToken({
        canisterId: ledgerCanisterId,
        token: mockToken,
        certified: true,
      });
      expect(ledgerApi.queryIcrcToken).not.toBeCalled();

      await loadIcrcToken({ ledgerCanisterId, certified: false });

      expect(ledgerApi.queryIcrcToken).not.toBeCalled();
    });

    it("loads token from api into store if requested certified true and store has certified false", async () => {
      tokensStore.setToken({
        canisterId: ledgerCanisterId,
        token: mockToken,
        certified: false,
      });
      expect(ledgerApi.queryIcrcToken).not.toBeCalled();

      await loadIcrcToken({ ledgerCanisterId, certified: true });

      expect(ledgerApi.queryIcrcToken).toHaveBeenCalledTimes(2);
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toEqual({
        certified: true,
        token: mockToken,
      });
    });
  });

  describe("icrcTransferTokens", () => {
    const amountE8s = 1_000_000_000n;
    const fee = 10_000n;
    const destinationAccount = {
      owner: principal(2),
    };

    it("calls icrcTransfer from icrc ledger api", async () => {
      await icrcTransferTokens({
        source: mockIcrcMainAccount,
        amountUlps: amountE8s,
        destinationAddress: encodeIcrcAccount(destinationAccount),
        fee,
        ledgerCanisterId,
      });

      expect(ledgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
      expect(ledgerApi.icrcTransfer).toHaveBeenCalledWith({
        identity: mockIdentity,
        amount: amountE8s,
        fee,
        canisterId: ledgerCanisterId,
        to: destinationAccount,
      });
    });

    it("calls transfers from subaccount", async () => {
      await icrcTransferTokens({
        source: {
          ...mockIcrcMainAccount,
          type: "subAccount",
          subAccount: mockSubAccountArray,
        },
        amountUlps: amountE8s,
        destinationAddress: encodeIcrcAccount(destinationAccount),
        fee,
        ledgerCanisterId,
      });

      expect(ledgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
      expect(ledgerApi.icrcTransfer).toHaveBeenCalledWith({
        identity: mockIdentity,
        amount: amountE8s,
        fee,
        canisterId: ledgerCanisterId,
        to: destinationAccount,
        fromSubAccount: mockSubAccountArray,
      });
    });

    it("should load balance after transfer", async () => {
      const initialAccount = {
        ...mockIcrcMainAccount,
        balanceUlps: balanceE8s + amountE8s,
      };
      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: {
          accounts: [initialAccount],
          certified: true,
        },
      });

      await icrcTransferTokens({
        source: mockIcrcMainAccount,
        amountUlps: amountE8s,
        destinationAddress: encodeIcrcAccount(destinationAccount),
        fee,
        ledgerCanisterId,
      });

      const finalAccount =
        get(icrcAccountsStore)[ledgerCanisterId.toText()]?.accounts[0];

      expect(finalAccount.balanceUlps).toEqual(balanceE8s);
    });
  });
});
