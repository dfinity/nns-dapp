import { getCkBTCAccounts } from "$lib/api/ckbtc-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";

export const loadCkBTCAccounts = async ({
  handleError,
}: {
  handleError?: () => void;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getCkBTCAccounts({ identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      ckBTCAccountsStore.set({
        accounts,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      ckBTCAccountsStore.reset();

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing ckBTC Accounts",
  });
};
