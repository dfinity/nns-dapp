import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  AccountDetails,
  AccountIdentifierString,
  HardwareWalletAccountDetails,
  SubAccountDetails,
  Transaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { AccountsStoreData } from "$lib/stores/accounts.store";
import type { Account, AccountType } from "$lib/types/account";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICPToken, TokenAmount } from "@dfinity/nns";
import { ledgerCanister } from "./ledger.api";
import { nnsDappCanister } from "./nns-dapp.api";

const getOrCreateAccount = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}) => {
  const { canister } = await nnsDappCanister({ identity });

  try {
    return await canister.getAccount({ certified });
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      // Ensure account exists in NNSDapp Canister
      // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L271
      // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L232
      await canister.addAccount();
      return canister.getAccount({ certified });
    }
    throw error;
  }
};

export const loadAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountsStoreData> => {
  // Helper
  const getAccountBalance = async (
    identifierString: string
  ): Promise<TokenAmount> => {
    const e8sBalance = await ledger.accountBalance({
      accountIdentifier: AccountIdentifier.fromHex(identifierString),
      certified,
    });
    return TokenAmount.fromE8s({ amount: e8sBalance, token: ICPToken });
  };

  logWithTimestamp(`Loading Accounts certified:${certified} call...`);

  const mainAccount: AccountDetails = await getOrCreateAccount({
    identity,
    certified,
  });

  const { canister: ledger } = await ledgerCanister({ identity });

  const mapAccount =
    (type: AccountType) =>
    async (
      account: AccountDetails | HardwareWalletAccountDetails | SubAccountDetails
    ): Promise<Account> => ({
      identifier: account.account_identifier,
      balance: await getAccountBalance(account.account_identifier),
      type,
      ...("sub_account" in account && { subAccount: account.sub_account }),
      ...("name" in account && { name: account.name }),
      ...("principal" in account && { principal: account.principal }),
    });

  const [main, subAccounts, hardwareWallets] = await Promise.all([
    mapAccount("main")(mainAccount),
    Promise.all(mainAccount.sub_accounts.map(mapAccount("subAccount"))),
    Promise.all(
      mainAccount.hardware_wallet_accounts.map(mapAccount("hardwareWallet"))
    ),
  ]);

  logWithTimestamp(`Loading Accounts certified:${certified} complete.`);

  return {
    main,
    subAccounts,
    hardwareWallets,
    certified,
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

export const getTransactions = async ({
  identity,
  accountIdentifier,
  pageSize,
  offset,
  certified,
}: {
  identity: Identity;
  accountIdentifier: AccountIdentifierString;
  pageSize: number;
  offset: number;
  certified: boolean;
}): Promise<Transaction[]> => {
  logWithTimestamp(
    `Loading Transactions ${hashCode(accountIdentifier)} call...`
  );

  const { canister } = await nnsDappCanister({ identity });

  const { transactions } = await canister.getTransactions({
    accountIdentifier,
    pageSize,
    offset,
    certified,
  });

  logWithTimestamp(
    `Loading Transactions ${hashCode(accountIdentifier)} complete.`
  );

  return transactions;
};

export const renameSubAccount = async ({
  newName,
  identity,
  subAccountIdentifier,
}: {
  newName: string;
  identity: Identity;
  subAccountIdentifier: string;
}): Promise<void> => {
  logWithTimestamp(
    `Renaming SubAccount ${hashCode(subAccountIdentifier)} call...`
  );

  const { canister } = await nnsDappCanister({ identity });

  await canister.renameSubAccount({
    new_name: newName,
    account_identifier: subAccountIdentifier,
  });

  logWithTimestamp(
    `Renaming SubAccount ${hashCode(subAccountIdentifier)} complete.`
  );
};
