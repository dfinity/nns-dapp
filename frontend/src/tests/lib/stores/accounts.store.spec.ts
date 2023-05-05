import type { AccountsStoreData } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import { TokenAmount } from "@dfinity/nns";
import { get } from "svelte/store";

describe("accountsStore", () => {
  const expectStoreInitialValues = () => {
    const initState: AccountsStoreData = get(accountsStore);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();
    expect(initState.hardwareWallets).toBeUndefined();
  };

  // Convenience functions for tests that don't care about the functionality of
  // the queued store to handle out of order responses.
  const accountsStoreSet = (accounts: AccountsStoreData) => {
    const mutableStore = accountsStore.getSingleMutationAccountsStore();
    mutableStore.set(accounts);
  };

  const accountsStoreSetBalance = ({
    accountIdentifier,
    balanceE8s,
  }: {
    accountIdentifier: string;
    balanceE8s: bigint;
  }) => {
    const mutableStore = accountsStore.getSingleMutationAccountsStore();
    mutableStore.setBalance({ accountIdentifier, balanceE8s, certified: true });
  };

  const accountsStoreReset = () => {
    const mutableStore = accountsStore.getSingleMutationAccountsStore();
    mutableStore.reset({ certified: true });
  };

  beforeEach(() => {
    accountsStore.resetForTesting();
  });

  it("initializes to undefined", () => {
    expectStoreInitialValues();
  });

  it("should set main account", () => {
    accountsStoreSet({ main: mockMainAccount, subAccounts: [] });

    const { main } = get(accountsStore);
    expect(main).toEqual(mockMainAccount);
  });

  it("should set certified data", () => {
    const { certified: initialCertified } = get(accountsStore);
    expect(initialCertified).toBeFalsy();

    accountsStoreSet({
      main: mockMainAccount,
      subAccounts: [],
      certified: true,
    });

    const { certified } = get(accountsStore);
    expect(certified).toBeTruthy();
  });

  it("should reset account store", () => {
    accountsStoreSet({ main: mockMainAccount, subAccounts: [] });
    accountsStoreReset();
    expectStoreInitialValues();
  });

  it("should not override new data with stale data", () => {
    const mutableStore1 = accountsStore.getSingleMutationAccountsStore();
    mutableStore1.set({
      main: mockMainAccount,
      subAccounts: [],
      certified: false,
    });

    expect(get(accountsStore).subAccounts).toHaveLength(0);

    const mutableStore2 = accountsStore.getSingleMutationAccountsStore();
    mutableStore2.set({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      certified: false,
    });

    expect(get(accountsStore).subAccounts).toHaveLength(1);

    // Slow update response for out-dated state without subaccount
    mutableStore1.set({
      main: mockMainAccount,
      subAccounts: [],
      certified: true,
    });

    // Should not have overridden the newer data with subaccount
    expect(get(accountsStore).subAccounts).toHaveLength(1);
  });

  describe("setBalance", () => {
    it("should set balance for main account", () => {
      accountsStoreSet({ main: mockMainAccount, subAccounts: [] });

      expect(get(accountsStore)?.main.balance).toEqual(mockMainAccount.balance);
      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
        accountIdentifier: mockMainAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      expect(get(accountsStore)?.main.balance.toE8s()).toEqual(newBalanceE8s);
    });

    it("should set balance for subaccount", () => {
      accountsStoreSet({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });

      expect(get(accountsStore)?.subAccounts[0].balance).toEqual(
        mockSubAccount.balance
      );
      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
        accountIdentifier: mockSubAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      const store = get(accountsStore);
      expect(store?.subAccounts[0].balance.toE8s()).toEqual(newBalanceE8s);
      expect(store.main.balance).toEqual(mockMainAccount.balance);
    });

    it("should set balance for hw account", () => {
      accountsStoreSet({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });

      expect(get(accountsStore)?.hardwareWallets[0].balance).toEqual(
        mockHardwareWalletAccount.balance
      );
      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
        accountIdentifier: mockHardwareWalletAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      expect(get(accountsStore)?.hardwareWallets[0].balance.toE8s()).toEqual(
        newBalanceE8s
      );
    });

    it("should not set balance if identifier doesn't match", () => {
      accountsStoreSet({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });

      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
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

    it("should reapply set balance on new data from an older request", () => {
      const mainBalance1 = BigInt(100);
      const mainBalance2 = BigInt(200);
      const subBalance1 = BigInt(300);
      const subBalance2 = BigInt(400);

      const dataWithBalances = ({ mainBalance, subBalance, certified }) => ({
        main: {
          ...mockMainAccount,
          balance: TokenAmount.fromE8s({
            amount: mainBalance,
            token: mockMainAccount.balance.token,
          }),
        },
        subAccounts: [
          {
            ...mockSubAccount,
            balance: TokenAmount.fromE8s({
              amount: subBalance,
              token: mockSubAccount.balance.token,
            }),
          },
        ],
        certified,
      });

      const expectBalances = ({
        mainBalance,
        subBalance,
      }: {
        mainBalance: bigint;
        subBalance: bigint;
      }) => {
        expect(get(accountsStore)?.main.balance.toE8s()).toEqual(mainBalance);
        expect(get(accountsStore)?.subAccounts[0].balance.toE8s()).toEqual(
          subBalance
        );
      };

      const mutableStore1 = accountsStore.getSingleMutationAccountsStore();
      mutableStore1.set(
        dataWithBalances({
          mainBalance: mainBalance1,
          subBalance: subBalance1,
          certified: false,
        })
      );
      expectBalances({ mainBalance: mainBalance1, subBalance: subBalance1 });

      const mutableStore2 = accountsStore.getSingleMutationAccountsStore();
      mutableStore2.setBalance({
        accountIdentifier: mockSubAccount.identifier,
        balanceE8s: subBalance2,
        certified: false,
      });
      expectBalances({ mainBalance: mainBalance1, subBalance: subBalance2 });

      // The update response of the old mutation still has subBalance1 for the
      // subaccount.
      mutableStore1.set(
        dataWithBalances({
          mainBalance: mainBalance2,
          subBalance: subBalance1,
          certified: true,
        })
      );
      // But this does not override the balance from the newer setBalance
      // mutation.
      expectBalances({ mainBalance: mainBalance2, subBalance: subBalance2 });
    });
  });
});
