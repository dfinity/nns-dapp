import { getSnsAccounts, getSnsToken } from "$lib/api/sns-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { RootCanisterId, RootCanisterIdText } from "$lib/types/sns";

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

const uncertifiedLoadSnsToken = ({
  rootCanisterId,
}: {
  rootCanisterId: RootCanisterId;
}): Promise<void> => {
  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    request: ({ certified, identity }) =>
      getSnsToken({ rootCanisterId, identity, certified }),
    onLoad: ({ response: token, certified }) =>
      tokensStore.setToken({
        token,
        canisterId: rootCanisterId,
        certified,
      }),
    onError: ({ error: err }) => {
      console.error(err);
      throw err;
    },
    logMessage: "Syncing Sns Token",
    strategy: "query",
  });
};

/**
 * Load Sns projects accounts balances and tokens
 *
 * ⚠️ WARNING: this feature only performs "query" calls. Effective "update" is performed when a Sns project is manually selected either through the token navigation switcher or accessed directly via the browser url.
 *
 * @param {rootCanisterIds: RootCanisterId[], excludeRootCanisterIds?: RootCanisterIdText[]} params
 * @param {RootCanisterId[]} params.rootCanisterIds The list of root canister ids - Sns projects - for which the balance of the accounts should be fetched.
 * @param {RootCanisterIdText[] | undefined} params.excludeRootCanisterIds As the balance is also loaded by loadSnsAccounts() - to perform query and UPDATE call - this variable can be used to avoid to perform unnecessary query and per extension to override data in the balance store.
 */
export const uncertifiedLoadSnsAccountsBalances = async ({
  rootCanisterIds,
  excludeRootCanisterIds = [],
}: {
  rootCanisterIds: RootCanisterId[];
  excludeRootCanisterIds?: RootCanisterIdText[];
}): Promise<void> => {
  const results: PromiseSettledResult<[void, void]>[] =
    await Promise.allSettled(
      (
        rootCanisterIds.filter(
          (rootCanisterId) =>
            !excludeRootCanisterIds.includes(rootCanisterId.toText())
        ) ?? []
      ).map((rootCanisterId) =>
        Promise.all([
          uncertifiedLoadSnsAccountsBalance({
            rootCanisterId,
          }),
          uncertifiedLoadSnsToken({
            rootCanisterId,
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
