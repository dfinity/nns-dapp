import * as ledgerApi from "$lib/api/icrc-ledger.api";
import * as walletApi from "$lib/api/wallet-ledger.api";
import {
  getIcrcAccountIdentity,
  icrcTransferTokens,
  loadIcrcToken,
} from "$lib/services/icrc-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
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
    vi.spyOn(walletApi, "getAccount").mockImplementation(
      async ({ canisterId }) => {
        if (canisterId.toText() === ledgerCanisterId.toText()) {
          return {
            ...mockIcrcMainAccount,
            balanceUlps: balanceE8s,
          };
        }
        if (canisterId.toText() === ledgerCanisterId2.toText()) {
          return {
            ...mockIcrcMainAccount,
            balanceUlps: balanceE8s2,
          };
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
