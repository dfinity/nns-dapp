import { getSnsAccounts } from "$lib/api/sns-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type {
  RootCanisterId,
  RootCanisterIdText,
  SnsSummary,
} from "$lib/types/sns";

const uncertifiedLoadSnsAccountsBalance = ({
  rootCanisterId,
}: {
  rootCanisterId: RootCanisterId;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getSnsAccounts({ rootCanisterId, identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      snsAccountsStore.setAccounts({
        accounts,
        rootCanisterId,
        certified,
      }),
    onError: ({ error: err }) => {
      console.error(err);
      throw err;
    },
    logMessage: "Syncing Sns Accounts Balance",
    strategy: "query",
  });
};

/**
 * Load Sns projects accounts balances
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when a Sns project is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {summaries: SnsSummary[], excludeRootCanisterIds?: RootCanisterIdText[]} params
 * @param {SnsSummary[]} params.summaries The list of summaries - Sns projects - for which the balance of the accounts should be fetched.
 * @param {RootCanisterIdText[] | undefined} params.excludeRootCanisterIds As the balance is also loaded by loadSnsAccounts() - to perform query and UPDATE call - this variable can be used to avoid to perform unnecessary query and per extension to override data in the balance store.
 */
export const uncertifiedLoadSnsAccountsBalances = async ({
  rootCanisterIds,
  excludeRootCanisterIds = [],
}: {
  rootCanisterIds: RootCanisterId[];
  excludeRootCanisterIds?: RootCanisterIdText[];
}): Promise<void> => {
  const results: PromiseSettledResult<void>[] = await Promise.allSettled(
    (
      rootCanisterIds.filter(
        (rootCanisterId) =>
          !excludeRootCanisterIds.includes(rootCanisterId.toText())
      ) ?? []
    ).map((rootCanisterId) =>
      uncertifiedLoadSnsAccountsBalance({
        rootCanisterId,
      })
    )
  );

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};
