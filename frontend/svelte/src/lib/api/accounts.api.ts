import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "../canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { Account, AccountType } from "../types/account";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { nnsDappCanister } from "./nns-dapp.api";

export const loadAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountsStore> => {
  // Helper
  const getAccountBalance = async (identifierString: string): Promise<ICP> =>
    ledger.accountBalance({
      accountIdentifier: AccountIdentifier.fromHex(identifierString),
      certified,
    });

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

  const mapAccount =
    (type: AccountType) =>
    async (
      account: AccountDetails | HardwareWalletAccountDetails | SubAccountDetails
    ): Promise<Account> => ({
      identifier: account.account_identifier,
      balance: await getAccountBalance(account.account_identifier),
      type,
      subAccount: "sub_account" in account ? account.sub_account : undefined,
      name: "name" in account ? account.name : undefined,
      principal: "principal" in account ? account.principal : undefined,
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
