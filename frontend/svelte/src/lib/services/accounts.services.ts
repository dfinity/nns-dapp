import type { Identity } from "@dfinity/agent";
import { createSubAccount, loadAccounts } from "../api/accounts.api";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import { toastsStore } from "../stores/toasts.store";
import { errorToString } from "../utils/error.utils";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

/**
 * - sync: load the account data using the ledger and the nns dapp canister itself
 */
export const syncAccounts = (): Promise<void> => {
  return queryAndUpdate<AccountsStore, unknown>({
    request: (params) => loadAccounts(params),
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
