import { get } from "svelte/store";
import {
  AccountsStore,
  initAccountsStore,
} from "../../../lib/stores/accounts.store";
import type { Account } from "../../../lib/types/account";
import { mockMainAccount } from "../../mocks/accounts.store.mock";

describe("accountsStore", () => {
  it("initializes to undefined", () => {
    const store = initAccountsStore();

    const initState: AccountsStore = get(store);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();
  });

  it("adds subaccounts", () => {
    const store = initAccountsStore();

    const initState: AccountsStore = get(store);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();

    const subAccount: Account = {
      ...mockMainAccount,
      name: "Test SubAccount",
    };

    store.addSubAccount(subAccount);

    const state: AccountsStore = get(store);

    expect(state.subAccounts).not.toBeUndefined();
    expect(state.subAccounts.length).toBe(1);
    expect(state.subAccounts[0]).toEqual(subAccount);
  });
});
