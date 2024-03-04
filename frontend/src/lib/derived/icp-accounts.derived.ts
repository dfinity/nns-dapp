import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  icpAccountBalancesStore,
  type IcpAccountBalancesStore,
} from "$lib/stores/icp-account-balances.store";
import {
  icpAccountDetailsStore,
  type IcpAccountDetailsStore,
} from "$lib/stores/icp-account-details.store";
import type { Account, AccountType } from "$lib/types/account";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export interface IcpAccountsStoreData {
  main?: Account;
  subAccounts?: Account[];
  hardwareWallets?: Account[];
}

export type IcpAccountsStore = Readable<IcpAccountsStoreData>;

export const icpAccountsStore = derived<
  [IcpAccountDetailsStore, IcpAccountBalancesStore],
  IcpAccountsStoreData
>(
  [icpAccountDetailsStore, icpAccountBalancesStore],
  ([icpAccountDetails, icpAccountBalances]) => {
    const initialAccounts: IcpAccountsStoreData = {
      main: undefined,
      subAccounts: undefined,
      hardwareWallets: undefined,
    };

    if (isNullish(icpAccountDetails)) {
      return initialAccounts;
    }

    const { accountDetails } = icpAccountDetails;

    const mapAccount =
      (type: AccountType) =>
      (
        account:
          | AccountDetails
          | HardwareWalletAccountDetails
          | SubAccountDetails
      ): Account => ({
        identifier: account.account_identifier,
        balanceUlps: icpAccountBalances[account.account_identifier]?.balanceE8s,
        type,
        ...("sub_account" in account && { subAccount: account.sub_account }),
        ...("name" in account && { name: account.name }),
        ...("principal" in account && { principal: account.principal }),
      });

    const main = mapAccount("main")(accountDetails);
    if (isNullish(main.balanceUlps)) {
      return initialAccounts;
    }

    const subAccounts = accountDetails.sub_accounts
      .map(mapAccount("subAccount"))
      .filter(({ balanceUlps }) => nonNullish(balanceUlps));
    const hardwareWallets = accountDetails.hardware_wallet_accounts
      .map(mapAccount("hardwareWallet"))
      .filter(({ balanceUlps }) => nonNullish(balanceUlps));

    return {
      main,
      subAccounts,
      hardwareWallets,
    } as IcpAccountsStoreData;
  }
);
