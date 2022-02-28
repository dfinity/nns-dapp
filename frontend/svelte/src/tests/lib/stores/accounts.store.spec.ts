import { get } from "svelte/store";
import {
  AccountsStore,
  initAccountsStore,
} from "../../../lib/stores/accounts.store";

describe("accountsStore", () => {
  it("initializes to undefined", () => {
    const store = initAccountsStore();

    const initState: AccountsStore = get(store);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();
  });
});
