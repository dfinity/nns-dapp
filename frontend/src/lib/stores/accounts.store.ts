import type { Account } from "$lib/types/account";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

export interface AccountsStoreData {
  main?: Account;
  subAccounts?: Account[];
  hardwareWallets?: Account[];
  certified?: boolean;
}

export interface AccountsStore extends Readable<AccountsStoreData> {
  set: (data: AccountsStoreData) => void;
  setBalance: ({
    accountIdentifier,
    balanceE8s,
  }: {
    accountIdentifier: string;
    balanceE8s: bigint;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the account information.
 */
const initAccountsStore = (): AccountsStore => {
  const initialAccounts: AccountsStoreData = {
    main: undefined,
    subAccounts: undefined,
    hardwareWallets: undefined,
    certified: undefined,
  };

  const { subscribe, set, update } =
    writable<AccountsStoreData>(initialAccounts);

  return {
    subscribe,

    set,

    setBalance({
      accountIdentifier,
      balanceE8s,
    }: {
      accountIdentifier: string;
      balanceE8s: bigint;
    }) {
      update(({ main, subAccounts, hardwareWallets }) => {
        if (isNullish(main)) {
          // Ignore update if the main account is not set.
          return { main, subAccounts, hardwareWallets };
        }
        const newBalance = TokenAmount.fromE8s({
          amount: balanceE8s,
          token: ICPToken,
        });
        const mapNewBalance = (account: Account) => {
          return account.identifier === accountIdentifier
            ? { ...account, balance: newBalance }
            : account;
        };
        return {
          main:
            main.identifier === accountIdentifier
              ? { ...main, balance: newBalance }
              : main,
          subAccounts: (subAccounts || []).map(mapNewBalance),
          hardwareWallets: (hardwareWallets || []).map(mapNewBalance),
        };
      });
    },

    reset: () => set(initialAccounts),
  };
};

export const accountsStore = initAccountsStore();
