import type { Principal } from "@dfinity/principal";
import { getSnsAccounts } from "../api/sns-ledger.api";
import { snsAccountsStore } from "../stores/sns-accounts.store";
import { toastsError } from "../stores/toasts.store";
import type { Account } from "../types/account";
import { toToastError } from "../utils/error.utils";
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
          fallbackErrorLabelKey: "error.sns_neurons_load",
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
