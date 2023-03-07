import type { AccountsStoreData } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import { get } from "svelte/store";

describe("accountsStore", () => {
  const expectStoreInitialValues = () => {
    const initState: AccountsStoreData = get(accountsStore);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();
    expect(initState.hardwareWallets).toBeUndefined();
  };

  it("initializes to undefined", () => {
    expectStoreInitialValues();
  });

  it("should set main account", () => {
    accountsStore.set({ main: mockMainAccount, subAccounts: [] });

    const { main } = get(accountsStore);
    expect(main).toEqual(mockMainAccount);
  });

  it("should set certified data", () => {
    const { certified: initialCertified } = get(accountsStore);
    expect(initialCertified).toBeFalsy();

    accountsStore.set({
      main: mockMainAccount,
      subAccounts: [],
      certified: true,
    });

    const { certified } = get(accountsStore);
    expect(certified).toBeTruthy();
  });

  it("should reset account store", () => {
    accountsStore.set({ main: mockMainAccount, subAccounts: [] });

    accountsStore.reset();

    expectStoreInitialValues();
  });
});
