import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import { createSubAccount, loadAccounts } from "../api/accounts.api";
import { sendICP } from "../api/ledger.api";
import { toSubAccountId } from "../api/utils.api";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { i18n } from "../stores/i18n";
import { toastsStore } from "../stores/toasts.store";
import type { TransactionStore } from "../stores/transaction.store";
import { errorToString } from "../utils/error.utils";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

/**
 * - sync: load the account data using the ledger and the nns dapp canister itself
 */
export const syncAccounts = (): Promise<void> => {
  return queryAndUpdate<AccountsStore, unknown>({
    request: (options) => loadAccounts(options),
    onLoad: ({ response: accounts }) => accountsStore.set(accounts),
    onError: ({ error, certified }) => {
      console.error(error);

      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      accountsStore.reset();

      toastsStore.show({
        labelKey: "error.accounts_not_found",
        level: "error",
        detail: errorToString(error),
      });
    },
  });
};

export const addSubAccount = async ({
  name,
}: {
  name: string;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  await createSubAccount({ name, identity });

  await syncAccounts();
};

export class TransferICPError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const transferICP = async ({
  selectedAccount,
  destinationAddress: to,
  amount,
}: TransactionStore) => {
  const i18nStore: I18n = get(i18n);

  if (!selectedAccount) {
    throw new TransferICPError(i18nStore.error.transaction_no_source_account);
  }

  if (to === undefined) {
    throw new TransferICPError(
      i18nStore.error.transaction_no_destination_address
    );
  }

  if (!amount) {
    throw new TransferICPError(i18nStore.error.transaction_invalid_amount);
  }

  const identity: Identity = await getIdentity();

  // TODO: refactor accountStore => we can keep in store the subAccountId, doing so we can avoid to transform it each time we call the backend
  const fromSubAccountId =
    selectedAccount.subAccount !== undefined
      ? toSubAccountId(selectedAccount.subAccount)
      : undefined;

  await sendICP({ identity, to, fromSubAccountId, amount });

  await syncAccounts();
};
