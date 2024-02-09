import {
  createSubAccount,
  getTransactions,
  renameSubAccount as renameSubAccountApi,
} from "$lib/api/accounts.api";
import {
  queryAccountBalance,
  sendICP,
  sendIcpIcrc1,
} from "$lib/api/icp-ledger.api";
import { addAccount, queryAccount } from "$lib/api/nns-dapp.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
  Transaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  SYNC_ACCOUNTS_RETRY_MAX_ATTEMPTS,
  SYNC_ACCOUNTS_RETRY_SECONDS,
} from "$lib/constants/accounts.constants";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
import type { LedgerIdentity } from "$lib/identities/ledger.identity";
import { getLedgerIdentityProxy } from "$lib/proxy/icp-ledger.services.proxy";
import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";
import type { IcpAccountsStoreData } from "$lib/stores/icp-accounts.store";
import {
  icpAccountsStore,
  type SingleMutationIcpAccountsStore,
} from "$lib/stores/icp-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type {
  Account,
  AccountIdentifierText,
  AccountType,
  IcpAccount,
} from "$lib/types/account";
import type { NewTransaction } from "$lib/types/transaction";
import {
  findAccount,
  getAccountByPrincipal,
  invalidIcpAddress,
  invalidIcrcAddress,
  toIcpAccountIdentifier,
} from "$lib/utils/accounts.utils";
import {
  isForceCallStrategy,
  notForceCallStrategy,
} from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import {
  cancelPoll,
  poll,
  pollingCancelled,
  pollingLimit,
} from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { decodeIcrcAccount, encodeIcrcAccount } from "@dfinity/ledger-icrc";
import {
  ICPToken,
  TokenAmount,
  arrayOfNumberToUint8Array,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
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

export const loadAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<IcpAccountsStoreData> => {
  // Helper
  const getAccountBalance = (identifierString: string): Promise<bigint> =>
    queryAccountBalance({
      identity,
      certified,
      icpAccountIdentifier: identifierString,
    });

  const mainAccount: AccountDetails = await getOrCreateAccount({
    identity,
    certified,
  });

  const icrcEnabled = get(ENABLE_ICP_ICRC);

  const mapAccount =
    (type: AccountType) =>
    async (
      account: AccountDetails | HardwareWalletAccountDetails | SubAccountDetails
    ): Promise<IcpAccount> => ({
      identifier: icrcEnabled
        ? encodeIcrcAccount({
            owner:
              "principal" in account
                ? account.principal
                : identity.getPrincipal(),
            ...("sub_account" in account && {
              subaccount: arrayOfNumberToUint8Array(account.sub_account),
            }),
          })
        : account.account_identifier,
      icpIdentifier: account.account_identifier,
      balanceUlps: await getAccountBalance(account.account_identifier),
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
  mutableStore: SingleMutationIcpAccountsStore;
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
  mutableStore,
  err,
  certified,
}: {
  mutableStore: SingleMutationIcpAccountsStore;
  err: unknown;
  certified: boolean;
}) => {
  if (!certified) {
    return;
  }

  mutableStore.reset({ certified });

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
const syncAccountsWithErrorHandler = (
  errorHandler: SyncAccontsErrorHandler
): Promise<void> => {
  const mutableStore =
    icpAccountsStore.getSingleMutationIcpAccountsStore(FORCE_CALL_STRATEGY);
  return queryAndUpdate<IcpAccountsStoreData, unknown>({
    request: (options) => loadAccounts(options),
    onLoad: ({ response: accounts }) => mutableStore.set(accounts),
    onError: ({ error: err, certified }) => {
      console.error(err);

      errorHandler({ mutableStore, err, certified });
    },
    logMessage: "Syncing Accounts",
    strategy: FORCE_CALL_STRATEGY,
  });
};

export const syncAccounts = () =>
  syncAccountsWithErrorHandler(defaultErrorHandlerAccounts);

const ignoreErrors: SyncAccontsErrorHandler = () => undefined;

/**
 * This function is called on app load to sync the accounts.
 *
 * It ignores errors and does not show any toasts. Accounts will be synced again.
 */
export const initAccounts = () => syncAccountsWithErrorHandler(ignoreErrors);

/**
 * Queries the balance of an account and loads it in the store.
 *
 * If `accountIdentifier` is not in the store, it will do nothing.
 */
export const loadBalance = async ({
  accountIdentifier,
}: {
  accountIdentifier: AccountIdentifierText;
}): Promise<void> => {
  const strategy = FORCE_CALL_STRATEGY;
  const mutableStore =
    icpAccountsStore.getSingleMutationIcpAccountsStore(strategy);
  return queryAndUpdate<bigint, unknown>({
    request: ({ identity, certified }) =>
      queryAccountBalance({
        identity,
        certified,
        icpAccountIdentifier: toIcpAccountIdentifier(accountIdentifier),
      }),
    onLoad: ({ certified, response: balanceE8s }) => {
      mutableStore.setBalance({
        certified,
        accountIdentifier,
        balanceE8s,
      });
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && strategy !== "query") {
        return;
      }

      toastsError({
        ...toToastError({
          err,
          fallbackErrorLabelKey: "error.query_balance",
        }),
        substitutions: { $accountId: accountIdentifier },
      });
    },
    logMessage: `Syncing Balance for ${accountIdentifier}`,
    strategy,
  });
};

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

    const validIcrcAddress = !invalidIcrcAddress(to);
    const validIcpAddress = !invalidIcpAddress(to);

    // UI validates addresses and disable form if not compliant. Therefore, this issue should unlikely happen.
    if (!validIcrcAddress && !validIcpAddress) {
      toastsError({
        labelKey: "error.address_not_icp_icrc_valid",
      });
      return { success: false };
    }

    const feeE8s = get(mainTransactionFeeE8sStore);

    await (validIcrcAddress
      ? sendIcpIcrc1({
          identity,
          to: decodeIcrcAccount(to),
          fromSubAccount: subAccount && new Uint8Array(subAccount),
          amount: tokenAmount,
          fee: feeE8s,
        })
      : sendICP({
          identity,
          to,
          fromSubAccount: subAccount,
          amount: tokenAmount.toE8s(),
          fee: feeE8s,
        }));

    // Transfer can be to one of the user's account.
    const toAccount = findAccount({
      identifier: to,
      accounts: get(nnsAccountsListStore),
    });

    // TODO: GIX-1704 use ICRC
    await Promise.all([
      loadBalance({ accountIdentifier: identifier }),
      nonNullish(toAccount)
        ? loadBalance({ accountIdentifier: to })
        : Promise.resolve(),
    ]);

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
  accountIdentifier: AccountIdentifierText;
  onLoad: (params: {
    accountIdentifier: AccountIdentifierText;
    transactions: Transaction[];
  }) => void;
}): Promise<void> =>
  queryAndUpdate<Transaction[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      getTransactions({
        identity,
        certified,
        icpAccountIdentifier: toIcpAccountIdentifier(accountIdentifier),
        pageSize: DEFAULT_TRANSACTION_PAGE_LIMIT,
        offset: 0,
      }),
    onLoad: ({ response: transactions }) =>
      onLoad({ accountIdentifier, transactions }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && notForceCallStrategy()) {
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
  const accounts = get(icpAccountsStore);
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
  if (isNullish(selectedAccount)) {
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
      subIcpAccountIdentifier: toIcpAccountIdentifier(identifier),
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
const pollAccountsId = Symbol("poll-accounts");
const pollLoadAccounts = async (params: {
  identity: Identity;
  certified: boolean;
}): Promise<IcpAccountsStoreData> =>
  poll({
    fn: () => loadAccounts(params),
    // Any error is an unknown error and worth a retry
    shouldExit: () => false,
    pollId: pollAccountsId,
    useExponentialBackoff: true,
    maxAttempts: SYNC_ACCOUNTS_RETRY_MAX_ATTEMPTS,
    millisecondsToWait: ACCOUNTS_RETRY_MILLIS,
  });

/**
 * Loads accounts in the background and updates the store.
 *
 * If the accounts are already loaded and certified, it will skip the request.
 *
 * If the accounts are not certified or not present, it will poll the request until it succeeds.
 *
 * @param certified Whether the accounts should be requested as certified or not.
 */
export const pollAccounts = async (certified = true) => {
  const overrideCertified = isForceCallStrategy() ? false : certified;
  const accounts = get(icpAccountsStore);

  // Skip if accounts are already loaded and certified
  // `certified` might be `undefined` if not yet loaded.
  // Therefore, we compare with `true`.
  if (
    accounts.certified === true ||
    (accounts.certified === false && isForceCallStrategy())
  ) {
    return;
  }

  const mutableStore =
    icpAccountsStore.getSingleMutationIcpAccountsStore(FORCE_CALL_STRATEGY);
  try {
    const identity = await getAuthenticatedIdentity();
    const certifiedAccounts = await pollLoadAccounts({
      identity,
      certified: overrideCertified,
    });
    mutableStore.set(certifiedAccounts);
  } catch (err) {
    mutableStore.cancel();
    // Don't show error if polling was cancelled
    if (pollingCancelled(err)) {
      return;
    }
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

export const cancelPollAccounts = () => cancelPoll(pollAccountsId);
