import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { getSnsAccounts, snsTransfer } from "$lib/api/sns-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { snsTokensByRootCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { loadSnsAccountTransactions } from "./sns-transactions.services";
import { queryAndUpdate, type QueryAndUpdateStrategy } from "./utils.services";

export const loadSnsAccounts = async ({
  rootCanisterId,
  handleError,
  strategy = FORCE_CALL_STRATEGY,
}: {
  rootCanisterId: Principal;
  handleError?: () => void;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy,
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

      // Ignore error on query call only if there will be an update call
      if (certified !== true && strategy !== "query") {
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

export const snsTransferTokens = async ({
  rootCanisterId,
  source,
  destinationAddress,
  amount,
  loadTransactions,
}: {
  rootCanisterId: Principal;
  source: Account;
  destinationAddress: string;
  amount: number;
  loadTransactions: boolean;
}): Promise<{ blockIndex: IcrcBlockIndex | undefined }> => {
  const fee = get(snsTokensByRootCanisterIdStore)[rootCanisterId.toText()]?.fee;

  return transferTokens({
    source,
    destinationAddress,
    amountUlps: numberToE8s(amount),
    fee,
    transfer: async (
      params: {
        identity: Identity;
      } & IcrcTransferParams
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
