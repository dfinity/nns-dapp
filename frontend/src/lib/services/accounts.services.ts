import {
  createSubAccount,
  getTransactions,
  renameSubAccount as renameSubAccountApi,
} from "$lib/api/accounts.api";
import { queryAccountBalance, sendICP } from "$lib/api/ledger.api";
import { addAccount, queryAccount } from "$lib/api/nns-dapp.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  AccountDetails,
  AccountIdentifierString,
  HardwareWalletAccountDetails,
  SubAccountDetails,
  Transaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import type { LedgerIdentity } from "$lib/identities/ledger.identity";
import { getLedgerIdentityProxy } from "$lib/proxy/ledger.services.proxy";
import type { AccountsStoreData } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account, AccountType } from "$lib/types/account";
import type { NewTransaction } from "$lib/types/transaction";
import { findAccount, getAccountByPrincipal } from "$lib/utils/accounts.utils";
import { toToastError } from "$lib/utils/error.utils";
import { poll, pollingLimit } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { get } from "svelte/store";
import { getAuthenticatedIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

// Exported for testing purposes
export const getOrCreateAccount = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountDetails> => {
  try {
    return await queryAccount({ certified, identity });
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      // Ensure account exists in NNSDapp Canister
      // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L271
      // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L232
      await addAccount(identity);
      return queryAccount({ certified, identity });
    }
    throw error;
  }
};

// Exported for testing
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
    const e8sBalance = await queryAccountBalance({
      identity,
      certified,
      accountIdentifier: identifierString,
    });
    return TokenAmount.fromE8s({ amount: e8sBalance, token: ICPToken });
  };

  const mainAccount: AccountDetails = await getOrCreateAccount({
    identity,
    certified,
  });

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

  return {
    main,
    subAccounts,
    hardwareWallets,
    certified,
  };
};

type SyncAccontsErrorHandler = (params: {
  err: unknown;
  certified: boolean;
}) => void;

/**
 * Default error handler for syncAccounts.
 *
 * Ignores non-certified errors.
 * Resets accountsStore and shows toast for certified errors.
 */
const defaultErrorHandlerAccounts: SyncAccontsErrorHandler = ({
  err,
  certified,
}: {
  err: unknown;
  certified: boolean;
}) => {
  if (!certified) {
    return;
  }

  accountsStore.reset();

  toastsError(
    toToastError({
      err,
      fallbackErrorLabelKey: "error.accounts_not_found",
    })
  );
};

/**
 * Loads the account data using the ledger and the nns dapp canister.
 */
export const syncAccounts = (
  errorHandler: SyncAccontsErrorHandler = defaultErrorHandlerAccounts
): Promise<void> => {
  return queryAndUpdate<AccountsStoreData, unknown>({
    request: (options) => loadAccounts(options),
    onLoad: ({ response: accounts }) => accountsStore.set(accounts),
    onError: ({ error: err, certified }) => {
      console.error(err);

      errorHandler({ err, certified });
    },
    logMessage: "Syncing Accounts",
  });
};

const ignoreErrors: SyncAccontsErrorHandler = () => undefined;

/**
 * This function is called on app load to sync the accounts.
 *
 * It ignores errors and does not show any toasts. Accounts will be synced again.
 */
export const initAccounts = () => syncAccounts(ignoreErrors);

export const addSubAccount = async ({
  name,
}: {
  name: string;
}): Promise<void> => {
  try {
    const identity: Identity = await getAuthenticatedIdentity();

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
  sourceAccount,
  destinationAddress: to,
  amount,
}: NewTransaction): Promise<{ success: boolean; err?: string }> => {
  try {
    const { identifier, subAccount } = sourceAccount;

    const identity: Identity = await getAccountIdentity(identifier);

    const tokenAmount = TokenAmount.fromNumber({ amount, token: ICPToken });

    await sendICP({
      identity,
      to,
      fromSubAccount: subAccount,
      amount: tokenAmount,
    });

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
  const account: Account | undefined = findAccount({
    identifier,
    accounts: get(nnsAccountsListStore),
  });

  if (account?.type === "hardwareWallet") {
    return getLedgerIdentityProxy(identifier);
  }

  return getAuthenticatedIdentity();
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
    const identity: Identity = await getAuthenticatedIdentity();

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

const ACCOUNTS_RETRY_MILLIS = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
const pollLoadAccounts = async (params: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountsStoreData> =>
  poll({
    fn: () => loadAccounts(params),
    // Any error is an unknown error and worth a retry
    shouldExit: () => false,
    useExponentialBackoff: true,
    // TODO: This should be a constant
    maxAttempts: 50,
    millisecondsToWait: ACCOUNTS_RETRY_MILLIS,
  });

/**
 * Loads accounts in the background and updates the store.
 *
 * If the accounts are already loaded and certified, it will skip the request.
 *
 * If the accounts are not certified or not present, it will poll the request until it succeeds.
 */
export const pollAccounts = async () => {
  const accounts = get(accountsStore);

  // Skip if accounts are already loaded and certified
  // `certified` might be `undefined` if not yet loaded.
  // Therefore, we compare with `true`.
  if (accounts.certified === true) {
    return;
  }

  try {
    const identity = await getAuthenticatedIdentity();
    const certifiedAccounts = await pollLoadAccounts({
      identity,
      certified: true,
    });
    accountsStore.set(certifiedAccounts);
  } catch (err) {
    const errorKey = pollingLimit(err)
      ? "error.accounts_not_found_poll"
      : "error.accounts_not_found";
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: errorKey,
      })
    );
  }
};
