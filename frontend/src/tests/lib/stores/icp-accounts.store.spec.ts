import type { IcpAccountsStoreData } from "$lib/stores/icp-accounts.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { get } from "svelte/store";

describe("icpAccountsStore", () => {
  const expectStoreInitialValues = () => {
    const initState: IcpAccountsStoreData = get(icpAccountsStore);

    expect(initState.main).toBeUndefined();
    expect(initState.subAccounts).toBeUndefined();
    expect(initState.hardwareWallets).toBeUndefined();
  };

  // Convenience functions for tests that don't care about the functionality of
  // the queued store to handle out of order responses.
  const accountsStoreSet = (accounts: IcpAccountsStoreData) => {
    const mutableStore = icpAccountsStore.getSingleMutationIcpAccountsStore();
    mutableStore.set(accounts);
  };

  const accountsStoreSetBalance = ({
    accountIdentifier,
    balanceE8s,
  }: {
    accountIdentifier: string;
    balanceE8s: bigint;
  }) => {
    const mutableStore = icpAccountsStore.getSingleMutationIcpAccountsStore();
    mutableStore.setBalance({ accountIdentifier, balanceE8s, certified: true });
  };

  const accountsStoreReset = () => {
    const mutableStore = icpAccountsStore.getSingleMutationIcpAccountsStore();
    mutableStore.reset({ certified: true });
  };

  beforeEach(() => {
    icpAccountsStore.resetForTesting();
  });

  it("initializes to undefined", () => {
    expectStoreInitialValues();
  });

  it("should set main account", () => {
    accountsStoreSet({ main: mockMainAccount, subAccounts: [] });

    const { main } = get(icpAccountsStore);
    expect(main).toEqual(mockMainAccount);
  });

  it("should set certified data", () => {
    const { certified: initialCertified } = get(icpAccountsStore);
    expect(initialCertified).toBe(undefined);

    accountsStoreSet({
      main: mockMainAccount,
      subAccounts: [],
      certified: true,
    });

    const { certified } = get(icpAccountsStore);
    expect(certified).toBeTruthy();
  });

  it("should reset account store", () => {
    accountsStoreSet({ main: mockMainAccount, subAccounts: [] });
    accountsStoreReset();
    expectStoreInitialValues();
  });

  it("should not override new data with stale data", () => {
    const mutableStore1 = icpAccountsStore.getSingleMutationIcpAccountsStore();
    mutableStore1.set({
      main: mockMainAccount,
      subAccounts: [],
      certified: false,
    });

    expect(get(icpAccountsStore).subAccounts).toHaveLength(0);

    const mutableStore2 = icpAccountsStore.getSingleMutationIcpAccountsStore();
    mutableStore2.set({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      certified: false,
    });

    expect(get(icpAccountsStore).subAccounts).toHaveLength(1);

    // Slow update response for out-dated state without subaccount
    mutableStore1.set({
      main: mockMainAccount,
      subAccounts: [],
      certified: true,
    });

    // Should not have overridden the newer data with subaccount
    expect(get(icpAccountsStore).subAccounts).toHaveLength(1);
  });

  describe("setBalance", () => {
    it("should set balance for main account", () => {
      accountsStoreSet({ main: mockMainAccount, subAccounts: [] });

      expect(get(icpAccountsStore)?.main.balanceE8s).toEqual(
        mockMainAccount.balanceE8s
      );
      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
        accountIdentifier: mockMainAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      expect(get(icpAccountsStore)?.main.balanceE8s).toEqual(newBalanceE8s);
    });

    it("should set balance for subaccount", () => {
      accountsStoreSet({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });

      expect(get(icpAccountsStore)?.subAccounts[0].balanceE8s).toEqual(
        mockSubAccount.balanceE8s
      );
      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
        accountIdentifier: mockSubAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      const store = get(icpAccountsStore);
      expect(store?.subAccounts[0].balanceE8s).toEqual(newBalanceE8s);
      expect(store.main.balanceE8s).toEqual(mockMainAccount.balanceE8s);
    });

    it("should set balance for hw account", () => {
      accountsStoreSet({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });

      expect(get(icpAccountsStore)?.hardwareWallets[0].balanceE8s).toEqual(
        mockHardwareWalletAccount.balanceE8s
      );
      const newBalanceE8s = BigInt(100);
      accountsStoreSetBalance({
        accountIdentifier: mockHardwareWalletAccount.identifier,
        balanceE8s: newBalanceE8s,
      });

      expect(get(icpAccountsStore)?.hardwareWallets[0].balanceE8s).toEqual(
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

      const store = get(icpAccountsStore);
      expect(store?.hardwareWallets[0].balanceE8s).toEqual(
        mockHardwareWalletAccount.balanceE8s
      );
      expect(store?.subAccounts[0].balanceE8s).toEqual(
        mockSubAccount.balanceE8s
      );
      expect(store?.main.balanceE8s).toEqual(mockMainAccount.balanceE8s);
    });

    it("should reapply set balance on new data from an older request", () => {
      const mainBalance1 = BigInt(100);
      const mainBalance2 = BigInt(200);
      const subBalance1 = BigInt(300);
      const subBalance2 = BigInt(400);

      const dataWithBalances = ({ mainBalance, subBalance, certified }) => ({
        main: {
          ...mockMainAccount,
          balanceE8s: mainBalance,
        },
        subAccounts: [
          {
            ...mockSubAccount,
            balanceE8s: subBalance,
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
        expect(get(icpAccountsStore)?.main.balanceE8s).toEqual(mainBalance);
        expect(get(icpAccountsStore)?.subAccounts[0].balanceE8s).toEqual(
          subBalance
        );
      };

      const mutableStore1 =
        icpAccountsStore.getSingleMutationIcpAccountsStore();
      mutableStore1.set(
        dataWithBalances({
          mainBalance: mainBalance1,
          subBalance: subBalance1,
          certified: false,
        })
      );
      expectBalances({ mainBalance: mainBalance1, subBalance: subBalance1 });

      const mutableStore2 =
        icpAccountsStore.getSingleMutationIcpAccountsStore();
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
