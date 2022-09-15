import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import {
  createSubAccount,
  getTransactions,
  loadAccounts,
  renameSubAccount as renameSubAccountApi,
} from "../api/accounts.api";
import { sendICP } from "../api/ledger.api";
import type {
  AccountIdentifierString,
  Transaction,
} from "../canisters/nns-dapp/nns-dapp.types";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "../constants/constants";
import { AppPath } from "../constants/routes.constants";
import type { LedgerIdentity } from "../identities/ledger.identity";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { toastsError } from "../stores/toasts.store";
import type { Account } from "../types/account";
import type { TransactionStore } from "../types/transaction.context";
import {
  getAccountByPrincipal,
  getAccountFromStore,
} from "../utils/accounts.utils";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

/**
 * - sync: load the account data using the ledger and the nns dapp canister itself
 */
export const syncAccounts = (): Promise<void> => {
  return queryAndUpdate<AccountsStore, unknown>({
    request: (options) => loadAccounts(options),
    onLoad: ({ response: accounts }) => accountsStore.set(accounts),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      accountsStore.reset();

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_not_found",
        })
      );
    },
    logMessage: "Syncing Accounts",
  });
};

export const addSubAccount = async ({
  name,
}: {
  name: string;
}): Promise<void> => {
  try {
    const identity: Identity = await getIdentity();

    await createSubAccount({ name, identity });

    await syncAccounts();
  } catch (err: unknown) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__account.create_subaccount",
      })
    );
  }
};

export const transferICP = async ({
  selectedAccount,
  destinationAddress: to,
  amount,
}: TransactionStore): Promise<{ success: boolean; err?: string }> => {
  if (!selectedAccount) {
    return transferError({ labelKey: "error.transaction_no_source_account" });
  }

  if (to === undefined) {
    return transferError({
      labelKey: "error.transaction_no_destination_address",
    });
  }

  if (!amount) {
    return transferError({ labelKey: "error.transaction_invalid_amount" });
  }

  try {
    const { identifier, subAccount } = selectedAccount;

    const identity: Identity = await getAccountIdentity(identifier);

    await sendICP({ identity, to, fromSubAccount: subAccount, amount });

    await syncAccounts();

    return { success: true };
  } catch (err) {
    return transferError({ labelKey: "error.transaction_error", err });
  }
};

const transferError = ({
  labelKey,
  err,
}: {
  labelKey: string;
  err?: unknown;
}): { success: boolean; err?: string } => {
  toastsError(
    toToastError({
      err,
      fallbackErrorLabelKey: labelKey,
    })
  );

  return { success: false, err: labelKey };
};

/**
 * @param path current route path
 * @return an object containing either a valid account identifier or undefined if not provided for the wallet route or undefined if another route is currently accessed
 */
export const routePathAccountIdentifier = (
  path: string | undefined
): { accountIdentifier: string | undefined } | undefined => {
  if (!isRoutePath({ path: AppPath.Wallet, routePath: path })) {
    return undefined;
  }

  const accountIdentifier: string | undefined = getLastPathDetail(path);

  return {
    accountIdentifier:
      accountIdentifier !== undefined && accountIdentifier !== ""
        ? accountIdentifier
        : undefined,
  };
};

export const getAccountTransactions = async ({
  accountIdentifier,
  onLoad,
}: {
  accountIdentifier: AccountIdentifierString;
  onLoad: ({
    accountIdentifier,
    transactions,
  }: {
    accountIdentifier: AccountIdentifierString;
    transactions: Transaction[];
  }) => void;
}): Promise<void> =>
  queryAndUpdate<Transaction[], unknown>({
    request: ({ certified, identity }) =>
      getTransactions({
        identity,
        certified,
        accountIdentifier,
        pageSize: DEFAULT_TRANSACTION_PAGE_LIMIT,
        offset: 0,
      }),
    onLoad: ({ response: transactions }) =>
      onLoad({ accountIdentifier, transactions }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      toastsError({
        labelKey: "error.transactions_not_found",
        err,
      });
    },
    logMessage: "Syncing Transactions",
  });

export const getAccountIdentity = async (
  identifier: string
): Promise<Identity | LedgerIdentity> => {
  const account: Account | undefined = getAccountFromStore({
    identifier,
    accountsStore: get(accountsStore),
  });

  if (account?.type === "hardwareWallet") {
    return getLedgerIdentityProxy(identifier);
  }

  return getIdentity();
};

export const getAccountIdentityByPrincipal = async (
  principalString: string
): Promise<Identity | LedgerIdentity | undefined> => {
  const accounts = get(accountsStore);
  const account = getAccountByPrincipal({
    principal: principalString,
    accounts,
  });
  if (account === undefined) {
    return;
  }
  return getAccountIdentity(account.identifier);
};

export const renameSubAccount = async ({
  newName,
  selectedAccount,
}: {
  newName: string;
  selectedAccount: Account | undefined;
}): Promise<{ success: boolean; err?: string }> => {
  if (!selectedAccount) {
    return renameError({ labelKey: "error.rename_subaccount_no_account" });
  }

  const { type, identifier } = selectedAccount;

  if (type !== "subAccount") {
    return renameError({ labelKey: "error.rename_subaccount_type" });
  }

  try {
    const identity: Identity = await getIdentity();

    await renameSubAccountApi({
      newName,
      identity,
      subAccountIdentifier: identifier,
    });

    await syncAccounts();

    return { success: true };
  } catch (err: unknown) {
    return renameError({ labelKey: "error.rename_subaccount", err });
  }
};

const renameError = ({
  labelKey,
  err,
}: {
  labelKey: string;
  err?: unknown;
}): { success: boolean; err?: string } => {
  toastsError(
    toToastError({
      err,
      fallbackErrorLabelKey: labelKey,
    })
  );

  return { success: false, err: labelKey };
};
