import type { Identity } from "@dfinity/agent";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "../canisters/nns-dapp/nns-dapp.types";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { AccountType } from "../stores/add-account.store";
import type { Account } from "../types/account";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { nnsDappCanister } from "./nns-dapp.api";

const getAccountBalance = async ({
  ledger,
  identifierString,
  certified,
}: {
  ledger: LedgerCanister;
  identifierString: string;
  certified: boolean;
}): Promise<ICP> =>
  ledger.accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(identifierString),
    certified,
  });

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

  const mapMainAccount = async (account: AccountDetails): Promise<Account> => ({
    identifier: account.account_identifier,
    principal: account.principal,
    balance: await getAccountBalance({
      ledger,
      certified,
      identifierString: account.account_identifier,
    }),
    type: "main" as AccountType,
  });

  const mapHardwareAccount = async (
    account: HardwareWalletAccountDetails
  ): Promise<Account> => ({
    identifier: account.account_identifier,
    principal: account.principal,
    balance: await getAccountBalance({
      ledger,
      certified,
      identifierString: account.account_identifier,
    }),
    name: account.name,
    type: "hardwareWallet" as AccountType,
  });

  const mapSubAccount = async (
    account: SubAccountDetails
  ): Promise<Account> => ({
    identifier: account.account_identifier,
    balance: await getAccountBalance({
      ledger,
      certified,
      identifierString: account.account_identifier,
    }),
    subAccount: account.sub_account,
    name: account.name,
    type: "subAccount" as AccountType,
  });

  const accounts = await Promise.all([
    mapMainAccount(mainAccount),
    ...mainAccount.sub_accounts.map(mapSubAccount),
    ...mainAccount.hardware_wallet_accounts.map(mapHardwareAccount),
  ]);

  logWithTimestamp(`Loading Accounts certified:${certified} complete.`);

  return {
    main: accounts.find(({ type }) => type === "main"),
    subAccounts: accounts.filter(({ type }) => type === "subAccount"),
    hardwareWallets: accounts.filter(({ type }) => type === "hardwareWallet"),
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
