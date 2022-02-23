import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { get } from "svelte/store";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type {
  AccountDetails,
  SubAccountDetails,
} from "../canisters/nns-dapp/nns-dapp.types";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { identityServiceURL } from "../constants/identity.constants";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { AuthStore, authStore } from "../stores/auth.store";
import type { Account } from "../types/account";
import { createAgent } from "../utils/agent.utils";

/**
 * - sync: load or reset the account data
 * a. If no `principal` is provided to sync the account, for example on app init or after a sign-out, the data is set to undefined
 * b. If a `principal` is provided, e.g. after sign-in, then the information are loaded using the ledger and the nns dapp canister itself
 */
export const syncAccounts = async ({
  identity,
}: {
  identity: Identity | undefined | null;
}): Promise<void> => {
  if (!identity) {
    accountsStore.set(undefined);
    return;
  }

  const accounts: AccountsStore = await loadAccounts({ identity });
  accountsStore.set(accounts);
};

const loadAccounts = async ({
  identity,
}: {
  identity: Identity;
}): Promise<AccountsStore> => {
  const agent = await createAgent({ identity, host: identityServiceURL });
  // ACCOUNTS
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });
  // Ensure account exists in NNSDapp Canister
  await nnsDapp.addAccount();

  const mainAccount: AccountDetails = await nnsDapp.getAccount();

  // ACCOUNT BALANCES
  const ledger: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  const getAccountBalance = async (
    account: AccountDetails | SubAccountDetails
  ): Promise<Account> => {
    const balance: ICP = await ledger.accountBalance({
      accountIdentifier: AccountIdentifier.fromHex(account.account_identifier),
      certified: false,
    });
    return {
      identifier: mainAccount.account_identifier,
      balance,
      // Account does not have "name" property. Typescript needed a check like this.
      name: "name" in account ? account.name : undefined,
    };
  };

  const [main, ...subAccounts] = await Promise.all([
    getAccountBalance(mainAccount),
    ...mainAccount.sub_accounts.map(getAccountBalance),
  ]);

  return {
    main,
    subAccounts,
  };
};

export const createSubAccount = async (name: string): Promise<void> => {
  const { identity }: AuthStore = get(authStore);
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent: await createAgent({ identity, host: identityServiceURL }),
    canisterId: OWN_CANISTER_ID,
  });

  await nnsDapp.createSubAccount({
    subAccountName: name,
  });

  await syncAccounts({ identity });
};
