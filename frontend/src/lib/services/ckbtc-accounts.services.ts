import { ckBTCTransfer, getCkBTCAccounts } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/environment.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import { loadCkBTCToken } from "$lib/services/ckbtc-tokens.services";
import { loadCkBTCAccountTransactions } from "$lib/services/ckbtc-transactions.services";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { get } from "svelte/store";
import type { IcrcTransferTokensUserParams } from "./icrc-accounts.services";

export const loadCkBTCAccounts = async ({
  handleError,
}: {
  handleError?: () => void;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      getCkBTCAccounts({ identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      ckBTCAccountsStore.set({
        accounts,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      ckBTCAccountsStore.reset();
      icrcTransactionsStore.resetUniverse(CKBTC_UNIVERSE_CANISTER_ID);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing ckBTC Accounts",
  });
};

export const syncCkBTCAccounts = async (params: { handleError?: () => void }) =>
  await Promise.all([loadCkBTCAccounts(params), loadCkBTCToken(params)]);

export const ckBTCTransferTokens = async ({
  source,
  loadTransactions,
  ...rest
}: IcrcTransferTokensUserParams & {
  loadTransactions: boolean;
}): Promise<{ success: boolean }> => {
  const fee = get(ckBTCTokenStore)?.token.fee;

  return transferTokens({
    source,
    fee,
    ...rest,
    transfer: ckBTCTransfer,
    reloadAccounts: async () => await loadCkBTCAccounts({}),
    reloadTransactions: async () =>
      await (loadTransactions
        ? loadCkBTCAccountTransactions({
            account: source,
          })
        : Promise.resolve()),
  });
};
