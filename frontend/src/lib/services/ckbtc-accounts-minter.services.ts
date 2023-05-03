import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { loadMinterCkBTCAccounts } from "$lib/services/ckbtc-accounts-loader.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";
import { toToastError } from "$lib/utils/error.utils";

export const loadCkBTCAccountsMinter = async ({
  handleError,
  universeId,
}: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      loadMinterCkBTCAccounts({ identity, certified, universeId }),
    onLoad: ({ response: accounts, certified }) =>
      ckBTCWithdrawalAccountsStore.set({
        universeId,
        accounts: {
          accounts,
          certified,
        },
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && FORCE_CALL_STRATEGY !== "query") {
        return;
      }

      // hide unproven data
      ckBTCWithdrawalAccountsStore.reset();

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing ckBTC Minter Accounts",
  });
};
