import { toastsError } from "$lib/stores/toasts.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { Principal } from "@dfinity/principal";
import { loadAccounts, loadIcrcToken } from "./icrc-accounts.services";

/**
 * Load Icrc accounts balances and token
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when the universe is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {universeIds: UniverseCanisterId[]; excludeUniverseIds: RootCanisterIdText[] | undefined} params
 * @param {UniverseCanisterId[]} params.universeIds The Icrc environment for which the balances should be loaded.
 */
export const uncertifiedLoadAccountsBalance = async ({
  universeIds,
}: {
  universeIds: UniverseCanisterIdText[];
}): Promise<void> => {
  const results: PromiseSettledResult<[void, void]>[] =
    await Promise.allSettled(
      universeIds.map((universeId) =>
        Promise.all([
          loadAccounts({
            strategy: "query",
            ledgerCanisterId: Principal.fromText(universeId),
          }),
          loadIcrcToken({
            ledgerCanisterId: Principal.fromText(universeId),
            certified: false,
          }),
        ])
      )
    );

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};
