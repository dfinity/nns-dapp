import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import {
  createSubAccount,
  getTransactions,
  loadAccounts,
  renameSubAccount as renameSubAccountApi,
} from "../api/accounts.api";
import { sendICP } from "../api/ledger.api";
import { toSubAccountId } from "../api/utils.api";
import type {
  AccountIdentifierString,
  Transaction,
} from "../canisters/nns-dapp/nns-dapp.types";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "../constants/constants";
import type { LedgerIdentity } from "../identities/ledger.identity";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { toastsStore } from "../stores/toasts.store";
import type { Account } from "../types/account";
import type { TransactionStore } from "../types/transaction.context";
import { getAccountByPrincipal } from "../utils/accounts.utils";
import { getLastPathDetail } from "../utils/app-path.utils";
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

      toastsStore.error(
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
    toastsStore.error(
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

    // TODO: refactor accountStore => we can keep in store the subAccountId, doing so we can avoid to transform it each time we call the backend
    const fromSubAccountId =
      subAccount !== undefined ? toSubAccountId(subAccount) : undefined;

    await sendICP({ identity, to, fromSubAccountId, amount });

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
  toastsStore.error(
    toToastError({
      err,
      fallbackErrorLabelKey: labelKey,
    })
  );

  return { success: false, err: labelKey };
};

export const routePathAccountIdentifier = (
  path: string | undefined
): string | undefined => {
  const accountIdentifier: string | undefined = getLastPathDetail(path);
  return accountIdentifier !== undefined && accountIdentifier !== ""
    ? accountIdentifier
    : undefined;
};

export const getAccountFromStore = (
  identifier: string | undefined
): Account | undefined => {
  if (identifier === undefined) {
    return undefined;
  }

  const { main, subAccounts, hardwareWallets }: AccountsStore =
    get(accountsStore);

  if (main?.identifier === identifier) {
    return main;
  }

  const subAccount: Account | undefined = subAccounts?.find(
    (account: Account) => account.identifier === identifier
  );

  if (subAccount !== undefined) {
    return subAccount;
  }

  return hardwareWallets?.find(
    (account: Account) => account.identifier === identifier
  );
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

      toastsStore.error({
        labelKey: "error.transactions_not_found",
        err,
      });
    },
    logMessage: "Syncing Transactions",
  });

export const getAccountIdentity = async (
  identifier: string
): Promise<Identity | LedgerIdentity> => {
  const account: Account | undefined = getAccountFromStore(identifier);

  if (account?.type === "hardwareWallet") {
    return getLedgerIdentityProxy(identifier);
  }

  return getIdentity();
};

export const getAccountIdentityByPrincipal = async (
  principalString: string
): Promise<Identity | LedgerIdentity> => {
  const accounts = get(accountsStore);
  const account = getAccountByPrincipal({
    principal: principalString,
    accounts,
  });
  if (account === undefined) {
    throw new Error(`Account with principal ${principalString} not found!`);
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
  toastsStore.error(
    toToastError({
      err,
      fallbackErrorLabelKey: labelKey,
    })
  );

  return { success: false, err: labelKey };
};
