import { icpAccountBalancesStore } from "$lib/stores/icp-account-balances.store";
import { get } from "svelte/store";

describe("icpAccountBalancesStore", () => {
  const mainAccountIdentifier = "mainAccountIdentifier";
  const mainAccountBalance = 100_000_000n;
  const subAccountIdentifier = "subAccountIdentifier";
  const subAccountBalance = 200_000_000n;

  const setBalance = ({ accountIdentifier, balanceE8s, certified }) => {
    const mutableStore =
      icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore();
    mutableStore.setBalance({
      accountIdentifier,
      balanceE8s,
      certified,
    });
  };

  it("should be initialized to empty", () => {
    expect(get(icpAccountBalancesStore)).toEqual({});
  });

  it("should set balance", () => {
    setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: mainAccountBalance,
      certified: true,
    });

    setBalance({
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
    setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: mainAccountBalance,
      certified: true,
    });

    expect(get(icpAccountBalancesStore)).not.toEqual({});
    const mutableStore =
      icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore();
    mutableStore.reset({ certified: true });
    expect(get(icpAccountBalancesStore)).toEqual({});
  });

  it("should not override a new value with an old value", () => {
    const oldMainAccountBalance = 300_000_000n;
    const newMainAccountBalance = 700_000_000n;

    const mutableStore1 =
      icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore();
    mutableStore1.setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: oldMainAccountBalance,
      certified: false,
    });

    const mutableStore2 =
      icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore();

    expect(get(icpAccountBalancesStore)[mainAccountIdentifier]).toEqual({
      balanceE8s: oldMainAccountBalance,
      certified: false,
    });

    mutableStore2.setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: newMainAccountBalance,
      certified: false,
    });

    expect(get(icpAccountBalancesStore)[mainAccountIdentifier]).toEqual({
      balanceE8s: newMainAccountBalance,
      certified: false,
    });

    mutableStore1.setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: oldMainAccountBalance,
      certified: true,
    });

    // Setting the old balance with the old mutation did not override the new
    // balance.
    expect(get(icpAccountBalancesStore)[mainAccountIdentifier]).toEqual({
      balanceE8s: newMainAccountBalance,
      certified: false,
    });

    mutableStore2.setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: newMainAccountBalance,
      certified: true,
    });

    expect(get(icpAccountBalancesStore)[mainAccountIdentifier]).toEqual({
      balanceE8s: newMainAccountBalance,
      certified: true,
    });
  });
});
