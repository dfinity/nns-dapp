import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { getTransactions as getWalletTransactions } from "$lib/api/wallet-index.api";
import {
  loadIcrcAccountNextTransactions,
  loadIcrcAccountTransactions,
  type LoadIcrcAccountNextTransactions,
  type LoadIcrcAccountTransactionsParams,
} from "$lib/services/icrc-transactions.services";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";

export const loadWalletTransactions = async ({
  indexCanisterId,
  ...params
}: Pick<LoadIcrcAccountTransactionsParams, "account" | "start" | "canisterId"> &
  Pick<CkBTCAdditionalCanisters, "indexCanisterId">) =>
  loadIcrcAccountTransactions({
    ...params,
    getTransactions: (
      params: Omit<GetTransactionsParams, "getTransactions" | "canisterId">
    ): Promise<GetTransactionsResponse> =>
      getWalletTransactions({ ...params, indexCanisterId }),
  });

export const loadWalletNextTransactions = async ({
  indexCanisterId,
  ...params
}: Pick<LoadIcrcAccountNextTransactions, "account" | "canisterId"> &
  Pick<CkBTCAdditionalCanisters, "indexCanisterId">) =>
  loadIcrcAccountNextTransactions({
    ...params,
    loadAccountTransactions: (
      params: Omit<LoadIcrcAccountTransactionsParams, "getTransactions">
    ) =>
      loadWalletTransactions({
        ...params,
        indexCanisterId,
      }),
  });
