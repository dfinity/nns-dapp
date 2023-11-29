import { getToken } from "$lib/api/wallet-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { getAccounts } from "$lib/services/wallet-loader.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import { Principal } from "@dfinity/principal";

/**
 * This function performs only an insecure "query" and does not toast the error but throw it so that all errors are collected by its caller.
 */
const loadAccountsBalance = (universeId: UniverseCanisterId): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getAccounts({ identity, certified, universeId }),
    onLoad: ({ response: accounts, certified }) =>
      icrcAccountsStore.set({
        universeId,
        accounts: {
          accounts,
          certified,
        },
      }),
    onError: ({ error: err }) => {
      console.error(err);
      throw err;
    },
    logMessage: "Syncing Accounts Balance",
    strategy: "query",
  });
};

/**
 * This function performs only an insecure "query" and does not toast the error but throw it so that all errors are collected by its caller.
 */
const loadToken = (universeId: UniverseCanisterId): Promise<void> => {
  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    request: ({ certified, identity }) =>
      getToken({ identity, certified, canisterId: universeId }),
    onLoad: ({ response: token, certified }) =>
      tokensStore.setToken({
        canisterId: universeId,
        token,
        certified,
      }),
    onError: ({ error: err }) => {
      console.error(err);
      throw err;
    },
    logMessage: "Syncing token",
    strategy: "query",
  });
};

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
          loadAccountsBalance(Principal.fromText(universeId)),
          loadToken(Principal.fromText(universeId)),
        ])
      )
    );

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};
