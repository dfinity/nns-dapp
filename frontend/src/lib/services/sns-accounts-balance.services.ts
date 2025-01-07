import { toastsError } from "$lib/stores/toasts.store";
import type { RootCanisterId } from "$lib/types/sns";
import { loadSnsAccounts } from "./sns-accounts.services";

/**
 * Load Sns projects accounts balances.
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when a Sns project is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {rootCanisterIds: RootCanisterId[], excludeRootCanisterIds?: RootCanisterIdText[]} params
 * @param {RootCanisterId[]} params.rootCanisterIds The list of root canister ids - Sns projects - for which the balance of the accounts should be fetched.
 */
export const uncertifiedLoadSnsesAccountsBalances = async ({
  rootCanisterIds,
}: {
  rootCanisterIds: RootCanisterId[];
}): Promise<void> => {
  const results: PromiseSettledResult<void>[] = await Promise.allSettled(
    rootCanisterIds.map((rootCanisterId) =>
      loadSnsAccounts({
        rootCanisterId,
        strategy: "query",
      })
    )
  );

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};
