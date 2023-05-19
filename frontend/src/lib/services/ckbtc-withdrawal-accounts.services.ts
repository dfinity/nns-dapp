import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getCkBTCWithdrawalAccount } from "$lib/services/ckbtc-accounts-loader.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import {
  ckBTCWithdrawalAccountsStore,
  type CkBTCBTCWithdrawalAccount,
} from "$lib/stores/ckbtc-withdrawal-accounts.store";
import type { UniverseCanisterId } from "$lib/types/universe";

/**
 * To load the withdrawal account we use QUERY+UPDATE strategy. Because the withdrawal account can only be fetched with an UPDATE call at the moment, we fake a static QUERY call.
 * That way we can display a spinner information in the UI while the account is loading.
 *
 * We use `queryAndUpdate` because it integrates thighly with the dapp core and also in case a QUERY call would be made available in the future.
 */
export const loadCkBTCWithdrawalAccount = async ({
  universeId,
}: {
  universeId: UniverseCanisterId;
}): Promise<void> => {
  return queryAndUpdate<CkBTCBTCWithdrawalAccount, unknown>({
    strategy: "query_and_update",
    request: ({ certified, identity }) =>
      getCkBTCWithdrawalAccount({ identity, certified, universeId }),
    onLoad: ({ response: account, certified }) =>
      ckBTCWithdrawalAccountsStore.set({
        universeId,
        account: {
          account,
          certified,
        },
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified) {
        return;
      }

      // hide unproven data
      ckBTCWithdrawalAccountsStore.reset();

      // No toast errors here. Particular errors are displayed in functions that are called.
    },
    logMessage: "Syncing ckBTC Withdrawal Account",
  });
};
