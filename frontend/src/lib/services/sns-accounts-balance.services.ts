import { getSnsAccounts } from "$lib/api/sns-ledger.api";
import {
  queryAndUpdate,
  type QueryAndUpdateStrategy,
} from "$lib/services/utils.services";
import { snsAccountsBalanceStore } from "$lib/stores/sns-accounts-balance.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { RootCanisterId } from "$lib/types/sns";
import { toToastError } from "$lib/utils/error.utils";
import { sumAccounts } from "$lib/utils/sns-accounts.utils";

export const loadSnsBalance = ({
  rootCanisterId,
  strategy,
}: {
  rootCanisterId: RootCanisterId;
  strategy: QueryAndUpdateStrategy;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getSnsAccounts({ rootCanisterId, identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      snsAccountsBalanceStore.setBalance({
        balance: sumAccounts(accounts),
        rootCanisterId,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsAccountsBalanceStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_accounts_load",
        })
      );
    },
    logMessage: "Syncing Sns Balance",
    strategy,
  });
};

export const insecureLoadSnsBalances = ({
  rootCanisterIds,
}: {
  rootCanisterIds: RootCanisterId[];
}): Promise<void[]> =>
  Promise.all(
    rootCanisterIds.map((rootCanisterId) =>
      loadSnsBalance({
        rootCanisterId,
        strategy: "query",
      })
    )
  );
