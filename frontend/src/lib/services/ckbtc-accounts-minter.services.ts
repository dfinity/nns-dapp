import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { loadMinterCkBTCAccount } from "$lib/services/ckbtc-accounts-loader.services";
import { queryAndUpdate } from "$lib/services/utils.services";
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
  return queryAndUpdate<Account | undefined, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      loadMinterCkBTCAccount({ identity, certified, universeId }),
    onLoad: ({ response: accounts, certified }) =>
      // TODO save in store
      console.log(accounts, certified),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && FORCE_CALL_STRATEGY !== "query") {
        return;
      }

      // TODO
      // hide unproven data
      // icrcAccountsStore.reset();

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
