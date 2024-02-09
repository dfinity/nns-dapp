import { toastsError } from "$lib/stores/toasts.store";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { Principal } from "@dfinity/principal";
import { loadIcrcToken } from "./icrc-accounts.services";
import { loadAccounts } from "./wallet-accounts.services";

/**
 * Load Icrc accounts balances and token
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when the universe is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {universeIds: UniverseCanisterId[]; excludeUniverseIds: RootCanisterIdText[] | undefined} params
 * @param {UniverseCanisterId[]} params.universeIds The Icrc environment for which the balances should be loaded.
 * @param {RootCanisterIdText[] | undefined} params.excludeUniverseIds As the balance is also loaded by loadSnsAccounts() - to perform query and UPDATE call - this variable can be used to avoid to perform unnecessary query and per extension to override data in the balance store.
 */
export const uncertifiedLoadAccountsBalance = async ({
  universeIds,
  excludeUniverseIds = [],
}: {
  universeIds: UniverseCanisterIdText[];
  excludeUniverseIds?: UniverseCanisterIdText[] | undefined;
}): Promise<void> => {
  const results: PromiseSettledResult<[void, void]>[] =
    await Promise.allSettled(
      (
        universeIds.filter(
          (universeId) => !excludeUniverseIds.includes(universeId)
        ) ?? []
      ).map((universeId) =>
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
