import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { DEFAULT_SNS_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { getSnsAccountIdentity } from "$lib/services/sns-accounts.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { getOldestTxIdFromStore } from "$lib/utils/icrc-transactions.utils";
import { decodeIcrcAccount } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

export interface LoadIcrcAccountTransactionsParams {
  account: Account;
  canisterId: Principal;
  start?: bigint;
  getTransactions: (
    params: Omit<GetTransactionsParams, "getTransactions">
  ) => Promise<GetTransactionsResponse>;
}

export type LoadIcrcAccountNextTransactions = Pick<
  LoadIcrcAccountTransactionsParams,
  "canisterId" | "account"
> & {
  loadAccountTransactions: (
    params: Omit<LoadIcrcAccountTransactionsParams, "getTransactions">
  ) => Promise<void>;
};

export const loadIcrcAccountTransactions = async ({
  account,
  canisterId,
  start,
  getTransactions,
}: LoadIcrcAccountTransactionsParams) => {
  try {
    const identity = await getSnsAccountIdentity(account);
    const snsAccount = decodeIcrcAccount(account.identifier);
    const maxResults = DEFAULT_SNS_TRANSACTION_PAGE_LIMIT;
    const { transactions, oldestTxId } = await getTransactions({
      identity,
      account: snsAccount,
      maxResults: BigInt(maxResults),
      canisterId,
      start,
    });
    // If API returns less than the maxResults, we reached the end of the list.
    const completed = transactions.length < maxResults;
    icrcTransactionsStore.addTransactions({
      accountIdentifier: account.identifier,
      canisterId,
      transactions,
      oldestTxId,
      completed,
    });
  } catch (err) {
    toastsError(
      toToastError({ fallbackErrorLabelKey: "error.fetch_transactions", err })
    );
  }
};

export const loadIcrcAccountNextTransactions = async ({
  account,
  canisterId,
  loadAccountTransactions,
}: LoadIcrcAccountNextTransactions) => {
  const store = get(icrcTransactionsStore);
  const currentOldestTxId = getOldestTxIdFromStore({
    account,
    canisterId: canisterId,
    store,
  });
  return loadAccountTransactions({
    account,
    canisterId,
    start: currentOldestTxId,
  });
};
