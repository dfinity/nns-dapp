import type { AccountsStoreData } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import { get } from "svelte/store";

describe("accountsStore", () => {
  const expectStoreInitialValues = () => {
    const initState: AccountsStoreData = get(accountsStore);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();
    expect(initState.hardwareWallets).toBeUndefined();
  };

  beforeEach(() => {
    accountsStore.reset();
  });

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

  describe("setBalance", () => {
    it("should set balance for main account", () => {
      accountsStore.set({ main: mockMainAccount, subAccounts: [] });

      expect(get(accountsStore)?.main.balance).toEqual(mockMainAccount.balance);
      const newBalanceE8s = BigInt(100);
      accountsStore.setBalance({
        accountIdentifier: mockMainAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      expect(get(accountsStore)?.main.balance.toE8s()).toEqual(newBalanceE8s);
    });

    it("should set balance for subaccount", () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });

      expect(get(accountsStore)?.subAccounts[0].balance).toEqual(
        mockSubAccount.balance
      );
      const newBalanceE8s = BigInt(100);
      accountsStore.setBalance({
        accountIdentifier: mockSubAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      const store = get(accountsStore);
      expect(store?.subAccounts[0].balance.toE8s()).toEqual(newBalanceE8s);
      expect(store.main.balance).toEqual(mockMainAccount.balance);
    });

    it("should set balance for hw account", () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });

      expect(get(accountsStore)?.hardwareWallets[0].balance).toEqual(
        mockHardwareWalletAccount.balance
      );
      const newBalanceE8s = BigInt(100);
      accountsStore.setBalance({
        accountIdentifier: mockHardwareWalletAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      expect(get(accountsStore)?.hardwareWallets[0].balance.toE8s()).toEqual(
        newBalanceE8s
      );
    });

    it("should not set balance if identifier doesn't match", () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });

      const newBalanceE8s = BigInt(100);
      accountsStore.setBalance({
        accountIdentifier: "not-matching-identifier",
        balanceE8s: newBalanceE8s,
      });

      const store = get(accountsStore);
      expect(store?.hardwareWallets[0].balance).toEqual(
        mockHardwareWalletAccount.balance
      );
      expect(store?.subAccounts[0].balance).toEqual(mockSubAccount.balance);
      expect(store?.main.balance).toEqual(mockMainAccount.balance);
    });
  });
});
