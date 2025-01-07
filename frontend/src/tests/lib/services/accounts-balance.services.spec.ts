import {
  loadAccountsBalances,
  loadSnsBalances,
  resetBalanceLoading,
} from "$lib/services/accounts-balances.services";
import * as snsBalanceServices from "$lib/services/sns-accounts-balance.services";
import * as walletServices from "$lib/services/wallet-uncertified-accounts.services";
import type { CanisterIdString } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";

vi.mock("$lib/services/icrc-accounts.services", () => {
  return {
    loadAccounts: vi.fn(),
    loadIcrcToken: vi.fn(),
  };
});

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    loadSnsAccounts: vi.fn(),
  };
});

describe("accounts-balances services", () => {
  let accountsBalanceSpy;
  let snsBalancesSpy;

  beforeEach(() => {
    resetBalanceLoading();

    accountsBalanceSpy = vi.spyOn(
      walletServices,
      "uncertifiedLoadAccountsBalance"
    );

    snsBalancesSpy = vi.spyOn(
      snsBalanceServices,
      "uncertifiedLoadSnsesAccountsBalances"
    );
  });

  describe("loadSnsBalances", () => {
    it("should not call service if array is empty", async () => {
      await loadSnsBalances([]);
      expect(snsBalancesSpy).not.toHaveBeenCalled();
    });

    it("should call service with correct parameters", async () => {
      const principal1 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
      const principal2 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

      await loadSnsBalances([principal1, principal2]);

      expect(snsBalancesSpy).toHaveBeenCalledWith({
        rootCanisterIds: [principal1, principal2],
      });
    });

    it("should not reload already loaded canister IDs", async () => {
      const principal1 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

      await loadSnsBalances([principal1]);
      await loadSnsBalances([principal1]);

      expect(snsBalancesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("loadAccountsBalances", () => {
    it("should not call service if array is empty", async () => {
      await loadAccountsBalances([]);
      expect(accountsBalanceSpy).not.toHaveBeenCalled();
    });

    it("should call service with correct parameters", async () => {
      const universeIds: CanisterIdString[] = [
        "rrkah-fqaaa-aaaaa-aaaaq-cai",
        "ryjl3-tyaaa-aaaaa-aaaba-cai",
      ];

      await loadAccountsBalances(universeIds);

      expect(accountsBalanceSpy).toHaveBeenCalledWith({
        universeIds,
      });
    });

    it("should not reload already loaded universe IDs", async () => {
      const universeIds: CanisterIdString[] = ["rrkah-fqaaa-aaaaa-aaaaq-cai"];

      await loadAccountsBalances(universeIds);
      await loadAccountsBalances(universeIds);

      expect(accountsBalanceSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("resetBalanceLoading", () => {
    it("should allow reloading previously loaded IDs after reset", async () => {
      const universeIds: CanisterIdString[] = ["rrkah-fqaaa-aaaaa-aaaaq-cai"];

      await loadAccountsBalances(universeIds);
      resetBalanceLoading();
      await loadAccountsBalances(universeIds);

      expect(accountsBalanceSpy).toHaveBeenCalledTimes(2);
    });
  });
});
