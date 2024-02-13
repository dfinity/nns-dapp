import { getTransactions } from "$lib/api/icrc-index.api";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { getIcrcAccountIdentity } from "$lib/services/icrc-accounts.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { getOldestTxIdFromStore } from "$lib/utils/icrc-transactions.utils";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

export interface LoadIcrcAccountTransactionsParams {
  account: Account;
  universeId: Principal;
  start?: bigint;
  indexCanisterId: Principal;
}

export const loadIcrcAccountTransactions = async ({
  account,
  universeId,
  start,
  indexCanisterId,
}: LoadIcrcAccountTransactionsParams) => {
  try {
    const identity = await getIcrcAccountIdentity(account);
    const snsAccount = decodeIcrcAccount(account.identifier);
    const maxResults = DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT;
    const { transactions, oldestTxId } = await getTransactions({
      identity,
      account: snsAccount,
      maxResults: BigInt(maxResults),
      indexCanisterId,
      start,
    });
    // If API returns less than the maxResults, we reached the end of the list.
    const completed = transactions.length < maxResults;
    icrcTransactionsStore.addTransactions({
      accountIdentifier: account.identifier,
      canisterId: universeId,
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

type LoadIcrcAccountNextTransactionsParams = {
  account: Account;
  universeId: Principal;
  indexCanisterId: Principal;
};

export const loadIcrcAccountNextTransactions = async ({
  account,
  universeId,
  indexCanisterId,
}: LoadIcrcAccountNextTransactionsParams) => {
  const store = get(icrcTransactionsStore);
  const currentOldestTxId = getOldestTxIdFromStore({
    account,
    universeId,
    store,
  });
  return loadIcrcAccountTransactions({
    account,
    universeId,
    indexCanisterId,
    start: currentOldestTxId,
  });
};
