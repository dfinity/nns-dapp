import { getCkBTCAccounts } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { loadCkBTCToken } from "$lib/services/ckbtc-tokens.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
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
      icrcTransactionsStore.resetUniverse(CKBTC_UNIVERSE_CANISTER_ID);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing ckBTC Accounts",
  });
};

export const syncCkBTCAccounts = async (params: { handleError?: () => void }) =>
  await Promise.all([loadCkBTCAccounts(params), loadCkBTCToken(params)]);
