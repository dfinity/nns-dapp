import { getTransactions } from "$lib/api/sns-index.api";
import { DEFAULT_SNS_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { getOldestTxIdFromStore } from "$lib/utils/sns-transactions.utils";
import type { Principal } from "@dfinity/principal";
import { decodeSnsAccount } from "@dfinity/sns";
import { get } from "svelte/store";
import { getSnsAccountIdentity } from "./sns-accounts.services";

export const loadAccountTransactions = async ({
  account,
  rootCanisterId,
  start,
}: {
  account: Account;
  rootCanisterId: Principal;
  start?: bigint;
}) => {
  try {
    const identity = await getSnsAccountIdentity(account);
    const snsAccount = decodeSnsAccount(account.identifier);
    const maxResults = DEFAULT_SNS_TRANSACTION_PAGE_LIMIT;
    const { transactions, oldestTxId } = await getTransactions({
      identity,
      account: snsAccount,
      maxResults: BigInt(maxResults),
      rootCanisterId,
      start,
    });
    // If API returns less than the maxResults, we reached the end of the list.
    const completed = transactions.length < maxResults;
    snsTransactionsStore.addTransactions({
      accountIdentifier: account.identifier,
      rootCanisterId,
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

export const loadAccountNextTransactions = async ({
  account,
  rootCanisterId,
}: {
  account: Account;
  rootCanisterId: Principal;
}) => {
  const store = get(snsTransactionsStore);
  const currentOldestTxId = getOldestTxIdFromStore({
    account,
    rootCanisterId,
    store,
  });
  return loadAccountTransactions({
    account,
    rootCanisterId,
    start: currentOldestTxId,
  });
};
