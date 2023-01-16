import { snsAccountsBalanceStore } from "$lib/stores/sns-accounts-balance.store";
import { get } from "svelte/store";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";
import { mockSnsFullProject, principal } from "../../mocks/sns-projects.mock";

describe("sns-accounts-balance.store", () => {
  afterEach(() => snsAccountsBalanceStore.reset());

  const rootCanisterId = mockSnsFullProject.rootCanisterId;

  const totalBalance = mockSnsMainAccount.balance;

  it("should set balance for a project", () => {
    snsAccountsBalanceStore.setBalance({
      rootCanisterId,
      balance: totalBalance,
      certified: true,
    });

    const store = get(snsAccountsBalanceStore);
    expect(store[rootCanisterId.toText()].balance.toE8s()).toEqual(
      mockSnsMainAccount.balance.toE8s()
    );
  });

  it("should set balance for another project", () => {
    snsAccountsBalanceStore.setBalance({
      rootCanisterId,
      balance: totalBalance,
      certified: true,
    });

    const anotherRootCanisterId = principal(2);
    const anotherTotalBalance = mockSnsSubAccount.balance;

    snsAccountsBalanceStore.setBalance({
      rootCanisterId: anotherRootCanisterId,
      balance: anotherTotalBalance,
      certified: true,
    });

    const store = get(snsAccountsBalanceStore);
    expect(store[anotherRootCanisterId.toText()].balance.toE8s()).toEqual(
      anotherTotalBalance.toE8s()
    );
  });

  it("should update existing balance for a project", () => {
    snsAccountsBalanceStore.setBalance({
      rootCanisterId,
      balance: totalBalance,
      certified: true,
    });

    const updateBalance = mockSnsSubAccount.balance;

    snsAccountsBalanceStore.setBalance({
      rootCanisterId,
      balance: updateBalance,
      certified: true,
    });

    const store = get(snsAccountsBalanceStore);
    expect(store[rootCanisterId.toText()].balance.toE8s()).toEqual(
      updateBalance.toE8s()
    );
  });
});
