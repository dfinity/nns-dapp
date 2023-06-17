import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { getSnsAccounts, snsTransfer } from "$lib/api/sns-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import { loadSnsToken } from "$lib/services/sns-tokens.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import type { IcrcTransferTokensUserParams } from "./icrc-accounts.services";
import { loadSnsAccountTransactions } from "./sns-transactions.services";
import { loadSnsTransactionFee } from "./transaction-fees.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsAccounts = async ({
  rootCanisterId,
  handleError,
}: {
  rootCanisterId: Principal;
  handleError?: () => void;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      getSnsAccounts({ rootCanisterId, identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      snsAccountsStore.setAccounts({
        accounts,
        rootCanisterId,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsAccountsStore.resetProject(rootCanisterId);
      icrcTransactionsStore.resetUniverse(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_load",
        })
      );

      handleError?.();
    },
    logMessage: "Syncing Sns Accounts",
  });
};

export const syncSnsAccounts = async (params: {
  rootCanisterId: Principal;
  handleError?: () => void;
}) => {
  await Promise.all([
    loadSnsAccounts(params),
    loadSnsTransactionFee(params),
    loadSnsToken(params),
  ]);
};

export const snsTransferTokens = async ({
  rootCanisterId,
  source,
  loadTransactions,
  ...rest
}: IcrcTransferTokensUserParams & {
  rootCanisterId: Principal;
  loadTransactions: boolean;
}): Promise<{ blockIndex: IcrcBlockIndex | undefined }> => {
  const fee = get(transactionsFeesStore).projects[rootCanisterId.toText()]?.fee;

  return transferTokens({
    source,
    fee,
    ...rest,
    transfer: async (
      params: {
        identity: Identity;
      } & Omit<IcrcTransferParams, "transfer">
    ) =>
      await snsTransfer({
        ...params,
        rootCanisterId,
      }),
    reloadAccounts: async () => await loadSnsAccounts({ rootCanisterId }),
    reloadTransactions: async () =>
      await (loadTransactions
        ? loadSnsAccountTransactions({
            account: source,
            canisterId: rootCanisterId,
          })
        : Promise.resolve()),
  });
};
