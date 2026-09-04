import { syncAccounts } from "$lib/services/icrc-accounts.services";
import { toastsError } from "$lib/stores/toasts.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { Principal } from "@icp-sdk/core/principal";

/**
 * Load Icrc accounts balances and token.
 *
 * The query answer shows first and the certified answer replaces it.
 *
 * @param {universeIds: UniverseCanisterIdText[]} params
 * @param {UniverseCanisterIdText[]} params.universeIds The Icrc environment for which the balances should be loaded.
 */
export const syncIcrcAccountsBalances = async ({
  universeIds,
}: {
  universeIds: UniverseCanisterIdText[];
}): Promise<void> => {
  const results = await Promise.allSettled(
    universeIds.map((universeId) =>
      syncAccounts({
        ledgerCanisterId: Principal.fromText(universeId),
      })
    )
  );

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};
