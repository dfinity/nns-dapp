import type { Identity } from "@dfinity/agent";
import { principalToAccountIdentifier } from "@dfinity/nns";
import { get } from "svelte/store";
import { createSubAccount, loadAccounts } from "../api/accounts.api";
import { sendICP } from "../api/ledger.api";
import { toSubAccountId } from "../api/utils.api";
import {
  NameTooLongError,
  SubAccountLimitExceededError,
} from "../canisters/nns-dapp/nns-dapp.errors";
import { LedgerErrorMessage } from "../errors/ledger.errors";
import type { LedgerIdentity } from "../identities/ledger.identity";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { i18n } from "../stores/i18n";
import { toastsStore } from "../stores/toasts.store";
import type { TransactionStore } from "../stores/transaction.store";
import type { Account } from "../types/account";
import { getLastPathDetail } from "../utils/app-path.utils";
import { toLedgerError } from "../utils/error.utils";
import { replacePlaceholders } from "../utils/i18n.utils";
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

      toastsStore.error({
        labelKey: "error.accounts_not_found",
        err,
      });
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
    const labelKey =
      err instanceof NameTooLongError
        ? "create_subaccount_too_long"
        : err instanceof SubAccountLimitExceededError
        ? "create_subaccount_limit_exceeded"
        : "create_subaccount";

    toastsStore.error({
      labelKey,
      err,
    });
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

    toastsStore.success({ labelKey: "accounts.transaction_success" });

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
  toastsStore.error(toLedgerError({ err, fallbackErrorLabelKey: labelKey }));

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

const getAccountIdentity = async (identifier: string): Promise<Identity> => {
  const account: Account | undefined = getAccountFromStore(identifier);

  if (account?.type === "hardwareWallet") {
    return getLedgerIdentity(identifier);
  }

  return getIdentity();
};

/**
 * Unlike getIdentity(), getting the ledger identity does not automatically logout if no identity is found - i.e. if errors happen.
 * User might need several tries to attach properly the ledger to the computer.
 */
const getLedgerIdentity = async (
  identifier: string
): Promise<LedgerIdentity> => {
  const ledgerIdentity: LedgerIdentity = await getLedgerIdentityProxy();

  const ledgerIdentifier: string = principalToAccountIdentifier(
    ledgerIdentity.getPrincipal()
  );

  if (ledgerIdentifier !== identifier) {
    const labels = get(i18n);

    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.incorrect_identifier, {
        $identifier: `${identifier}`,
        $ledgerIdentifier: `${ledgerIdentifier}`,
      })
    );
  }

  return ledgerIdentity;
};
