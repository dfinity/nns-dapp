import { getSnsAccounts } from "$lib/api/sns-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { snsAccountsBalanceStore } from "$lib/stores/sns-accounts-balance.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type {
  RootCanisterId,
  RootCanisterIdText,
  SnsSummary,
} from "$lib/types/sns";
import { toToastError } from "$lib/utils/error.utils";
import { sumAccounts } from "$lib/utils/sns-accounts.utils";

const uncertifiedLoadSnsAccountsBalance = ({
  rootCanisterId,
}: {
  rootCanisterId: RootCanisterId;
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
    strategy: "query",
  });
};

/**
 * Load Sns projects accounts balances
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when a Sns project is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param summaries The list of summaries - Sns projects - for which the balance of the accounts should be fetched.
 * @param excludeRootCanisterIds As the balance is also loaded by loadSnsAccounts() - to perform query and UPDATE call - this variable can be used to avoid to perform unnecessary query and per extension to override data in the balance store.
 */
export const uncertifiedLoadSnsAccountsBalances = ({
  summaries,
  excludeRootCanisterIds = [],
}: {
  summaries: SnsSummary[];
  excludeRootCanisterIds?: RootCanisterIdText[];
}): Promise<void[]> =>
  Promise.all(
    (
      summaries.filter(
        ({ metadataCertified, rootCanisterId }) =>
          metadataCertified === false &&
          !excludeRootCanisterIds.includes(rootCanisterId.toText())
      ) ?? []
    ).map(({ rootCanisterId }) =>
      uncertifiedLoadSnsAccountsBalance({
        rootCanisterId,
      })
    )
  );
