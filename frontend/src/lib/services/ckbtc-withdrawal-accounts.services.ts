import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getCkBTCWithdrawalAccount } from "$lib/services/ckbtc-accounts-loader.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import {
  ckBTCWithdrawalAccountsStore,
  type CkBTCBTCWithdrawalAccount,
} from "$lib/stores/ckbtc-withdrawal-accounts.store";
import type { UniverseCanisterId } from "$lib/types/universe";

export const loadCkBTCWithdrawalAccount = async ({
  universeId,
}: {
  universeId: UniverseCanisterId;
}): Promise<void> => {
  return queryAndUpdate<CkBTCBTCWithdrawalAccount, unknown>({
    strategy: FORCE_CALL_STRATEGY,
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

      if (!certified && FORCE_CALL_STRATEGY !== "query") {
        return;
      }

      // hide unproven data
      ckBTCWithdrawalAccountsStore.reset();

      // No toast errors here. Particular errors are displayed in functions that are called.
    },
    logMessage: "Syncing ckBTC Withdrawal Account",
  });
};
