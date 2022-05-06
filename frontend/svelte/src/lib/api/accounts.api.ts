import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type {
  AccountDetails,
  SubAccountDetails,
} from "../canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { Account } from "../types/account";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { nnsDappCanister } from "./nns-dapp.api";

export const loadAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountsStore> => {
  logWithTimestamp(`Loading Accounts certified:${certified} call...`);

  const { canister, agent } = await nnsDappCanister({ identity });

  // Ensure account exists in NNSDapp Canister
  // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L271
  // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L232
  await canister.addAccount();

  const mainAccount: AccountDetails = await canister.getAccount({ certified });

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

  // TODO(L2-433): map hardware_wallet_accounts

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

  const { canister } = await nnsDappCanister({ identity });

  await canister.createSubAccount({
    subAccountName: name,
  });

  logWithTimestamp(`Creating SubAccount ${hashCode(name)} complete.`);
};
