import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import {
  getIcrcAccountIdentity,
  icrcTransferTokens,
  loadIcrcAccount,
  loadIcrcAccounts,
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
  const mockAccount = {
    identifier: encodeIcrcAccount({
      owner: mockIdentity.getPrincipal(),
    }),
    principal: mockIdentity.getPrincipal(),
    type: "main",
    balanceE8s,
  };
  const mockAccount2 = {
    ...mockAccount,
    balanceE8s: balanceE8s2,
  };

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
  });

  describe("loadIcrcAccount", () => {
    const userIcrcAccount = {
      owner: mockIdentity.getPrincipal(),
    };

    it("loads account in store with balance from api", async () => {
      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toBeUndefined();

      await loadIcrcAccount({ ledgerCanisterId, certified: true });

      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toEqual({
        accounts: [mockAccount],
        certified: true,
      });
      expect(ledgerApi.queryIcrcBalance).toHaveBeenCalledWith({
        certified: false,
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
        account: userIcrcAccount,
      });
      expect(ledgerApi.queryIcrcBalance).toHaveBeenCalledWith({
        certified: true,
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
        account: userIcrcAccount,
      });
      expect(ledgerApi.queryIcrcBalance).toHaveBeenCalledTimes(2);
    });

    it("loads account in store with balance from api with query", async () => {
      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toBeUndefined();

      await loadIcrcAccount({ ledgerCanisterId, certified: false });

      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toEqual({
        accounts: [mockAccount],
        certified: false,
      });
      expect(ledgerApi.queryIcrcBalance).toHaveBeenCalledWith({
        certified: false,
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
        account: userIcrcAccount,
      });
      expect(ledgerApi.queryIcrcBalance).toHaveBeenCalledTimes(1);
    });
  });

  describe("loadIcrcAccounts", () => {
    it("loads tokens and accounts in stoers from api", async () => {
      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toBeUndefined();
      expect(
        get(icrcAccountsStore)[ledgerCanisterId2.toText()]
      ).toBeUndefined();
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toBeUndefined();
      expect(get(tokensStore)[ledgerCanisterId2.toText()]).toBeUndefined();

      await loadIcrcAccounts({
        ledgerCanisterIds: [ledgerCanisterId, ledgerCanisterId2],
        certified: true,
      });

      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toEqual({
        accounts: [mockAccount],
        certified: true,
      });
      expect(get(icrcAccountsStore)[ledgerCanisterId2.toText()]).toEqual({
        accounts: [mockAccount2],
        certified: true,
      });
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toEqual({
        certified: true,
        token: mockToken,
      });
      expect(get(tokensStore)[ledgerCanisterId2.toText()]).toEqual({
        certified: true,
        token: mockToken,
      });
    });

    it("loads tokens and accounts in stoers from api with query", async () => {
      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toBeUndefined();
      expect(
        get(icrcAccountsStore)[ledgerCanisterId2.toText()]
      ).toBeUndefined();
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toBeUndefined();
      expect(get(tokensStore)[ledgerCanisterId2.toText()]).toBeUndefined();

      await loadIcrcAccounts({
        ledgerCanisterIds: [ledgerCanisterId, ledgerCanisterId2],
        certified: false,
      });

      expect(get(icrcAccountsStore)[ledgerCanisterId.toText()]).toEqual({
        accounts: [mockAccount],
        certified: false,
      });
      expect(get(icrcAccountsStore)[ledgerCanisterId2.toText()]).toEqual({
        accounts: [mockAccount2],
        certified: false,
      });
      expect(get(tokensStore)[ledgerCanisterId.toText()]).toEqual({
        certified: false,
        token: mockToken,
      });
      expect(get(tokensStore)[ledgerCanisterId2.toText()]).toEqual({
        certified: false,
        token: mockToken,
      });
    });
  });

  describe("icrcTransferTokens", () => {
    const amount = 10;
    const amountE8s = BigInt(10 * E8S_PER_ICP);
    const fee = 10_000n;
    const destinationAccount = {
      owner: principal(2),
    };

    it("calls icrcTransfer from icrc ledger api", async () => {
      await icrcTransferTokens({
        source: mockIcrcMainAccount,
        amount,
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
        amount,
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
        balanceE8s: balanceE8s + amountE8s,
      };
      icrcAccountsStore.set({
        universeId: ledgerCanisterId,
        accounts: {
          accounts: [initialAccount],
          certified: true,
        },
      });

      await icrcTransferTokens({
        source: mockIcrcMainAccount,
        amount,
        destinationAddress: encodeIcrcAccount(destinationAccount),
        fee,
        ledgerCanisterId,
      });

      const finalAccount =
        get(icrcAccountsStore)[ledgerCanisterId.toText()]?.accounts[0];

      expect(finalAccount.balanceE8s).toEqual(balanceE8s);
    });
  });
});
