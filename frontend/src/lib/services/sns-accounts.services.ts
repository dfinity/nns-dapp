import { getSnsAccounts } from "$lib/api/sns-ledger.api";
import type { Account } from "$lib/types/account";
import type { Principal } from "@dfinity/principal";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import { loadSnsTransactionFee } from "./transaction-fees.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsAccounts = async (
  rootCanisterId: Principal
): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getSnsAccounts({ rootCanisterId, identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      snsAccountsStore.setAccounts({
        accounts,
        rootCanisterId,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsAccountsStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_accounts_load",
        })
      );
    },
    logMessage: "Syncing Sns Accounts",
  });
};

export const syncSnsAccounts = async (rootCanisterId: Principal) => {
  await Promise.all([
    loadSnsAccounts(rootCanisterId),
    loadSnsTransactionFee(rootCanisterId),
  ]);
};
