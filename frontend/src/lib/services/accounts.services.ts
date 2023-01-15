import {
  createSubAccount,
  getTransactions,
  loadAccounts,
  renameSubAccount as renameSubAccountApi,
} from "$lib/api/accounts.api";
import { sendICP } from "$lib/api/ledger.api";
import type {
  AccountIdentifierString,
  Transaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import type { LedgerIdentity } from "$lib/identities/ledger.identity";
import { getLedgerIdentityProxy } from "$lib/proxy/ledger.services.proxy";
import type { AccountsWritableStore } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { NewTransaction } from "$lib/types/transaction";
import {
  getAccountByPrincipal,
  getAccountFromStore,
} from "$lib/utils/accounts.utils";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { get } from "svelte/store";
import { getAuthenticatedIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

/**
 * - sync: load the account data using the ledger and the nns dapp canister itself
 */
export const syncAccounts = (): Promise<void> => {
  return queryAndUpdate<AccountsWritableStore, unknown>({
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
  const account: Account | undefined = getAccountFromStore({
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
