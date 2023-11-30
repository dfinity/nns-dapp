import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { getAccounts } from "$lib/services/wallet-loader.services";
import { loadToken } from "$lib/services/wallet-tokens.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";

/**
 * TODO: once sns are migrated to store this module can probably be reused and renamed to icrc-accounts.services
 */

export const loadAccounts = async ({
  handleError,
  universeId,
}: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      getAccounts({ identity, certified, universeId }),
    onLoad: ({ response: accounts, certified }) =>
      icrcAccountsStore.set({
        universeId,
        accounts: {
          accounts,
          certified,
        },
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && notForceCallStrategy()) {
        return;
      }

      // hide unproven data
      icrcAccountsStore.reset();
      icrcTransactionsStore.resetUniverse(universeId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing Accounts",
  });
};

export const syncAccounts = async (params: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}) => await Promise.all([loadAccounts(params), loadToken(params)]);
