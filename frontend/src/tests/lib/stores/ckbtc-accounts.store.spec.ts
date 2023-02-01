import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import type { Account } from "$lib/types/account";
import { get } from "svelte/store";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";

describe("ckBTC Accounts store", () => {
  afterEach(() => ckBTCAccountsStore.reset());

  const accounts: Account[] = [mockCkBTCMainAccount];

  it("should set accounts", () => {
    ckBTCAccountsStore.set({
      accounts,
      certified: true,
    });

    const accountsInStore = get(ckBTCAccountsStore);
    expect(accountsInStore.accounts).toEqual(accounts);
    expect(accountsInStore.certified).toBeTruthy();
  });

  it("should reset accounts", () => {
    ckBTCAccountsStore.set({
      accounts,
      certified: true,
    });

    ckBTCAccountsStore.reset();

    const accountsInStore = get(ckBTCAccountsStore);
    expect(accountsInStore.accounts).toHaveLength(0);
    expect(accountsInStore.certified).toBeUndefined();
  });
});
