import { queryIcrcBalance } from "$lib/api/icrc-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import {
  queryAndUpdate,
  type QueryAndUpdateStrategy,
} from "$lib/services/utils.services";
import { getAccounts } from "$lib/services/wallet-loader.services";
import { loadToken } from "$lib/services/wallet-tokens.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";

/**
 * Return all the accounts for the given identity in the ledger canister.
 *
 * For now, it only returns the main account and no subaccounts.
 *
 * Once subaccounts are supported, this function should be updated to return all the accounts.
 */
const getAccounts = async ({
  identity,
  certified,
  ledgerCanisterId,
}: {
  identity: Identity;
  certified: boolean;
  ledgerCanisterId: Principal;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  const mainAccount = {
    owner: identity.getPrincipal(),
  };

  const balanceUlps = await queryIcrcBalance({
    identity,
    certified,
    canisterId: ledgerCanisterId,
    account: mainAccount,
  });

  return [
    {
      identifier: encodeIcrcAccount(mainAccount),
      principal: mainAccount.owner,
      balanceUlps,
      type: "main",
    },
  ];
};

/**
 * TODO: once sns are migrated to store this module can probably be reused and renamed to icrc-accounts.services
 */

export const loadAccounts = async ({
  handleError,
  ledgerCanisterId,
  strategy = FORCE_CALL_STRATEGY,
}: {
  handleError?: () => void;
  ledgerCanisterId: Principal;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy,
    request: ({ certified, identity }) =>
      getAccounts({ identity, certified, ledgerCanisterId }),
    onLoad: ({ response: accounts, certified }) =>
      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: {
          accounts,
          certified,
        },
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      // Ignore error on query call only if there will be an update call
      if (certified !== true && strategy !== "query") {
        return;
      }

      // hide unproven data
      icrcAccountsStore.reset();
      icrcTransactionsStore.resetUniverse(ledgerCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing Accounts",
  });
};

export const syncAccounts = async (params: {
  handleError?: () => void;
  ledgerCanisterId: Principal;
}) => await Promise.all([loadAccounts(params), loadToken(params)]);
