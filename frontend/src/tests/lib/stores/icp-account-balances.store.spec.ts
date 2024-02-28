import { icpAccountBalancesStore } from "$lib/stores/icp-account-balances.store";
import { get } from "svelte/store";

describe("icpAccountBalancesStore", () => {
  const mainAccountIdentifier = "mainAccountIdentifier";
  const mainAccountBalance = 100_000_000n;
  const subAccountIdentifier = "subAccountIdentifier";
  const subAccountBalance = 200_000_000n;

  beforeEach(() => {
    icpAccountBalancesStore.reset();
  });

  it("should be initialized to empty", () => {
    expect(get(icpAccountBalancesStore)).toEqual({});
  });

  it("should set balance", () => {
    icpAccountBalancesStore.setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: mainAccountBalance,
      certified: true,
    });

    icpAccountBalancesStore.setBalance({
      accountIdentifier: subAccountIdentifier,
      balanceE8s: subAccountBalance,
      certified: true,
    });

    expect(get(icpAccountBalancesStore)).toEqual({
      [mainAccountIdentifier]: {
        balanceE8s: mainAccountBalance,
        certified: true,
      },
      [subAccountIdentifier]: {
        balanceE8s: subAccountBalance,
        certified: true,
      },
    });
  });

  it("should reset data", () => {
    icpAccountBalancesStore.setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: mainAccountBalance,
      certified: true,
    });

    expect(get(icpAccountBalancesStore)).not.toEqual({});
    icpAccountBalancesStore.reset();
    expect(get(icpAccountBalancesStore)).toEqual({});
  });
});
