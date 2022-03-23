import type { Identity } from "@dfinity/agent";
import { createSubAccount, loadAccounts } from "../api/accounts.api";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { toastsStore } from "../stores/toasts.store";
import { queryAndUpdate } from "../utils/api.utils";
import { errorToString } from "../utils/error.utils";

/**
 * - sync: load the account data using the ledger and the nns dapp canister itself
 */
export const syncAccounts = async ({
  identity,
}: {
  identity: Identity | undefined | null;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity");
  }

  return queryAndUpdate<AccountsStore, unknown>({
    request: ({ certified }) => loadAccounts({ identity, certified }),
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
  identity,
}: {
  name: string;
  identity: Identity | null | undefined;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity found to create subaccount");
  }

  await createSubAccount({ name, identity });

  await syncAccounts({ identity });
};
