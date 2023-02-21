import { getCkBTCAccounts, getCkBTCToken } from "$lib/api/ckbtc-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
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
const loadCkBTCAccountsBalance = (
  universeId: UniverseCanisterId
): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getCkBTCAccounts({ identity, certified, canisterId: universeId }),
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
    logMessage: "Syncing ckBTC Accounts Balance",
    strategy: "query",
  });
};

/**
 * This function performs only an insecure "query" and does not toast the error but throw it so that all errors are collected by its caller.
 */
const loadCkBTCToken = (universeId: UniverseCanisterId): Promise<void> => {
  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    request: ({ certified, identity }) =>
      getCkBTCToken({ identity, certified, canisterId: universeId }),
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
    logMessage: "Syncing ckBTC token",
    strategy: "query",
  });
};

/**
 * Load ckBTC accounts balances and token
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when the ckBTC universe is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {UniverseCanisterId} universeId The ckBTC (ckBTC or ckTESTBTC) environment for which the balances should be loaded.
 */
export const uncertifiedLoadCkBTCAccountsBalance = async (
  universeId: UniverseCanisterIdText
): Promise<void> => {
  const results: PromiseSettledResult<void>[] = await Promise.allSettled([
    loadCkBTCAccountsBalance(Principal.fromText(universeId)),
    loadCkBTCToken(Principal.fromText(universeId)),
  ]);

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};
