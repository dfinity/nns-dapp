import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type {
  AccountDetails,
  SubAccountDetails,
} from "../canisters/nns-dapp/nns-dapp.types";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "../constants/canister-ids.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { Account } from "../types/account";
import { createAgent } from "../utils/agent.utils";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { HOST } from "./environment.constants.api";

export const loadAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountsStore> => {
  logWithTimestamp(`Loading Accounts certified:${certified} call...`);

  const agent = await createAgent({ identity, host: HOST });
  // ACCOUNTS
  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });
  // Ensure account exists in NNSDapp Canister
  // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L271
  // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L232
  await nnsDapp.addAccount();

  const mainAccount: AccountDetails = await nnsDapp.getAccount({ certified });

  // ACCOUNT BALANCES
  const ledger: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  const mapAccount = async (
    account: AccountDetails | SubAccountDetails
  ): Promise<Account> => {
    const balance: ICP = await ledger.accountBalance({
      accountIdentifier: AccountIdentifier.fromHex(account.account_identifier),
      certified,
    });

    return {
      identifier: account.account_identifier,
      // SubAccountDetails does not have "principal"
      principal: "principal" in account ? account.principal : undefined,
      balance,
      // AccountDetails does not have "name" or "sub_account" property. Typescript needed a check like this.
      subAccount: "sub_account" in account ? account.sub_account : undefined,
      name: "name" in account ? account.name : undefined,
    };
  };

  const [main, ...subAccounts] = await Promise.all([
    mapAccount(mainAccount),
    ...mainAccount.sub_accounts.map(mapAccount),
  ]);

  logWithTimestamp(`Loading Accounts certified:${certified} complete.`);

  return {
    main,
    subAccounts,
  };
};

export const createSubAccount = async ({
  name,
  identity,
}: {
  name: string;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Creating SubAccount ${hashCode(name)} call...`);

  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent: await createAgent({ identity, host: HOST }),
    canisterId: OWN_CANISTER_ID,
  });

  await nnsDapp.createSubAccount({
    subAccountName: name,
  });
  logWithTimestamp(`Creating SubAccount ${hashCode(name)} complete.`);
};
