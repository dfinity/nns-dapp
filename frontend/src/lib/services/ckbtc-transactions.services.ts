import { getCkBTCTransactions } from "$lib/api/ckbtc-index.api";
import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import {
  loadIcrcAccountNextTransactions,
  loadIcrcAccountTransactions,
  type LoadIcrcAccountNextTransactions,
  type LoadIcrcAccountTransactionsParams,
} from "$lib/services/icrc-transactions.services";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";

export const loadCkBTCAccountTransactions = async ({
  indexCanisterId,
  ...params
}: Pick<LoadIcrcAccountTransactionsParams, "account" | "start" | "canisterId"> &
  Pick<CkBTCAdditionalCanisters, "indexCanisterId">) =>
  loadIcrcAccountTransactions({
    ...params,
    getTransactions: (
      params: Omit<GetTransactionsParams, "getTransactions" | "canisterId">
    ): Promise<GetTransactionsResponse> =>
      getCkBTCTransactions({ ...params, indexCanisterId }),
  });

export const loadCkBTCAccountNextTransactions = async ({
  indexCanisterId,
  ...params
}: Pick<LoadIcrcAccountNextTransactions, "account" | "canisterId"> &
  Pick<CkBTCAdditionalCanisters, "indexCanisterId">) =>
  loadIcrcAccountNextTransactions({
    ...params,
    loadAccountTransactions: (
      params: Omit<LoadIcrcAccountTransactionsParams, "getTransactions">
    ) =>
      loadCkBTCAccountTransactions({
        ...params,
        indexCanisterId,
      }),
  });
