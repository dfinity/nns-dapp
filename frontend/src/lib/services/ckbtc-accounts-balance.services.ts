import { getCkBTCAccounts } from "$lib/api/ckbtc-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";

/**
 * Load ckBTC accounts balances
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when the ckBTC universe is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {RootCanisterIdText[] | undefined} params.excludeRootCanisterIds As the balance is also loaded by loadSnsAccounts() - to perform query and UPDATE call - this variable can be used to avoid to perform unnecessary query and per extension to override data in the balance store.
 */
export const uncertifiedLoadCkBTCAccountsBalance = (): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getCkBTCAccounts({ identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      ckBTCAccountsStore.set({
        accounts,
        certified,
      }),
    onError: ({ error: err }) =>
      toastsError({ labelKey: "error.sns_accounts_balance_load", err }),
    logMessage: "Syncing ckBTC Accounts Balance",
    strategy: "query",
  });
};
