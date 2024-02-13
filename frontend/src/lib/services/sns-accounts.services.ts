import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { querySnsBalance, snsTransfer } from "$lib/api/sns-ledger.api";
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
import { encodeIcrcAccount, type IcrcBlockIndex } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { queryAndUpdate, type QueryAndUpdateStrategy } from "./utils.services";

/**
 * Return all the accounts for the given identity in the ledger canister of the SNS project.
 *
 * For now, it only returns the main account and no subaccounts.
 *
 * Once subaccounts are supported, this function should be updated to return all the accounts.
 */
const getAccounts = async ({
  identity,
  certified,
  rootCanisterId,
}: {
  identity: Identity;
  certified: boolean;
  rootCanisterId: Principal;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  const mainAccount = {
    owner: identity.getPrincipal(),
  };

  const balanceUlps = await querySnsBalance({
    identity,
    certified,
    rootCanisterId,
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
      getAccounts({ rootCanisterId, identity, certified }),
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
}: {
  rootCanisterId: Principal;
  source: Account;
  destinationAddress: string;
  amount: number;
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
    reloadTransactions: async () => undefined,
  });
};
