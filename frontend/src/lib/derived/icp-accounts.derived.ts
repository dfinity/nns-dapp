import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";
import {
  icpAccountBalancesStore,
  type IcpAccountBalancesStore,
} from "$lib/stores/icp-account-balances.store";
import {
  icpAccountDetailsStore,
  type IcpAccountDetailsStore,
} from "$lib/stores/icp-account-details.store";
import type { AccountType, IcpAccount } from "$lib/types/account";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import {
  arrayOfNumberToUint8Array,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export interface IcpAccountsStoreData {
  main?: IcpAccount;
  subAccounts?: IcpAccount[];
  hardwareWallets?: IcpAccount[];
}

export type IcpAccountsStore = Readable<IcpAccountsStoreData>;

export const icpAccountsStore = derived<
  [IcpAccountDetailsStore, IcpAccountBalancesStore, Readable<boolean>],
  IcpAccountsStoreData
>(
  [icpAccountDetailsStore, icpAccountBalancesStore, ENABLE_ICP_ICRC],
  ([icpAccountDetails, icpAccountBalances, icrcEnabled]) => {
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
      ): IcpAccount => ({
        identifier: icrcEnabled
          ? encodeIcrcAccount({
              owner:
                "principal" in account
                  ? account.principal
                  : accountDetails.principal,
              ...("sub_account" in account && {
                subaccount: arrayOfNumberToUint8Array(account.sub_account),
              }),
            })
          : account.account_identifier,
        icpIdentifier: account.account_identifier,
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
