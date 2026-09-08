import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
import { toastsError } from "$lib/stores/toasts.store";
import type { RootCanisterId } from "$lib/types/sns";

/**
 * Load Sns projects accounts balances.
 *
 * The query answer shows first and the certified answer replaces it. If the
 * certified answer arrives first, the query answer is skipped.
 *
 * @param {rootCanisterIds: RootCanisterId[]} params
 * @param {RootCanisterId[]} params.rootCanisterIds The list of root canister ids - Sns projects - for which the balance of the accounts should be fetched.
 */
export const syncSnsAccountsBalances = async ({
  rootCanisterIds,
}: {
  rootCanisterIds: RootCanisterId[];
}): Promise<void> => {
  const results: PromiseSettledResult<void>[] = await Promise.allSettled(
    rootCanisterIds.map((rootCanisterId) =>
      loadSnsAccounts({
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
