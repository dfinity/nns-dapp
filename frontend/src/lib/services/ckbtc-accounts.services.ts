import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { icrcTransfer } from "$lib/api/icrc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import { loadCkBTCToken } from "$lib/services/ckbtc-tokens.services";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { getAccounts } from "$lib/services/wallet-loader.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger-icrc";
import { get } from "svelte/store";
import type { IcrcTransferTokensUserParams } from "./icrc-accounts.services";

export const loadCkBTCAccounts = async ({
  handleError,
  universeId,
}: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
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
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && notForceCallStrategy()) {
        return;
      }

      // hide unproven data
      icrcAccountsStore.reset();
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

export const syncCkBTCAccounts = async (params: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}) => await Promise.all([loadCkBTCAccounts(params), loadCkBTCToken(params)]);

export const ckBTCTransferTokens = async ({
  source,
  universeId,
  ...rest
}: IcrcTransferTokensUserParams & {
  universeId: UniverseCanisterId;
}): Promise<{
  blockIndex: IcrcBlockIndex | undefined;
}> => {
  const fee = get(ckBTCTokenStore)[universeId.toText()]?.token.fee;

  return transferTokens({
    source,
    fee,
    ...rest,
    transfer: async (
      params: {
        identity: Identity;
      } & IcrcTransferParams
    ) =>
      await icrcTransfer({
        ...params,
        canisterId: universeId,
      }),
    reloadAccounts: async () => await loadCkBTCAccounts({ universeId }),
    reloadTransactions: async () => Promise.resolve(),
  });
};
