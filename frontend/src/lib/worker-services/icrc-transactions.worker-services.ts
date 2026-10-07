import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import {
  DEFAULT_INDEX_TRANSACTION_MAX_PAGES,
  DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT,
} from "$lib/constants/constants";

import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
} from "$lib/types/post-message.transactions";
import { getIcrcTransactions as getIcrcIndexTransactions } from "$lib/worker-api/icrc-index.worker-api";
import type { DictionaryWorkerState } from "$lib/worker-stores/dictionary.worker-store";
import type { TransactionsData } from "$lib/worker-types/transactions.worker-types";
import type {
  TimerWorkerUtilsJobData,
  TimerWorkerUtilsSyncParams,
} from "$lib/worker-utils/timer.worker-utils";
import { isNullish, jsonReplacer, nonNullish } from "@dfinity/utils";
import {
  decodeIcrcAccount,
  type IcrcIndexDid,
} from "@icp-sdk/canisters/ledger/icrc";

export type GetAccountsTransactionsResults = Omit<
  PostMessageDataResponseTransaction,
  "transactions"
> &
  Pick<GetTransactionsResponse, "transactions"> &
  Pick<TransactionsData, "backlog">;

/**
 * Collect the ICRC transactions for a list of accounts.
 *
 * For each account provided as a parameter, the service ensures that no duplicate transactions are returned and fetches the pages of new transactions in a loop, taking into account the pagination of the backend API calls.
 *
 * @param object TimerWorkerUtilsJobData<PostMessageDataRequestTransactions> & { state: DictionaryWorkerState<TransactionsData>; }
 * @param object.identity
 * @param object.data
 * @param object.data.accountIdentifiers
 * @param object.data.indexCanisterId
 * @param object.data.host
 * @param object.data.fetchRootKey
 * @param object.state
 */
export const getIcrcAccountsTransactions = ({
  identity,
  data: { accountIdentifiers, indexCanisterId, host, fetchRootKey },
  state,
}: TimerWorkerUtilsJobData<PostMessageDataRequestTransactions> & {
  state: DictionaryWorkerState<TransactionsData>;
}): Promise<GetAccountsTransactionsResults[]> =>
  Promise.all(
    accountIdentifiers.map(async (accountIdentifier) => {
      const { transactions, ...rest } = await getIcrcAccountTransactions({
        identity,
        indexCanisterId,
        accountIdentifier,
        host,
        fetchRootKey,
        state: state[accountIdentifier],
      });

      return {
        transactions: transactions.reduce((acc, value) => {
          // Suppress duplicate transactions to provide the results
          const alreadyExist = (): boolean =>
            acc.find(
              (transaction) =>
                value.id === transaction.id &&
                // If a user transfer from / to same account, it's two transaction with same id
                // Same approach as the one of the UI side to build the ICP wallet list of transactions
                JSON.stringify(transaction, jsonReplacer) ===
                  JSON.stringify(value, jsonReplacer)
            ) !== undefined;

          return [...acc, ...(alreadyExist() ? [] : [value])];
        }, [] as IcrcIndexDid.TransactionWithId[]),
        ...rest,
      };
    })
  );

type GetAccountTransactionsParams = TimerWorkerUtilsSyncParams &
  Omit<PostMessageDataRequestTransactions, "accountIdentifiers"> & {
    accountIdentifier: IcrcAccountIdentifierText;
    start?: bigint;
    state: TransactionsData | undefined;
  };

/**
 * Tell if a result of `getIcrcAccountsTransactions` holds data that the worker must store and emit.
 *
 * @param object
 * @param object.result
 * @param object.state
 */
export const hasNewIcrcTransactions = ({
  result: { mostRecentTxId },
  state,
}: {
  result: GetAccountsTransactionsResults;
  state: TransactionsData | undefined;
}): boolean =>
  // A sync that continued a backlog fetched older transactions and keeps the same most recent id.
  mostRecentTxId !== state?.mostRecentTxId || nonNullish(state?.backlog);

/**
 * Return the `start` of the next call to the index canister, or `undefined` if the pagination is complete.
 *
 * @param object
 * @param object.page
 * @param object.start
 * @param object.stopTxId
 */
const nextPageStart = ({
  page,
  start,
  stopTxId,
}: {
  page: IcrcIndexDid.TransactionWithId[];
  start: bigint | undefined;
  stopTxId: bigint | undefined;
}): bigint | undefined => {
  // We compare IDs because we want to find the oldest transaction ID to notice if we have fetched all new transactions or if there is a remaining gap.
  //
  // For example:
  // New transactions [100, 99, 98]
  // Most recent transaction ID 95
  // Therefore, we still need to get between 95 and 98
  //
  // Note that we do not compare based on the timestamp but on the ID for simplicity reason as we do not really care here if two transactions have the same ID, we are just looking for the oldest ID.
  //
  // We compare the bigint IDs directly, with no Number(...) conversion. A hostile index canister
  // can answer an ID above Number.MAX_SAFE_INTEGER, and a conversion of that ID to a number loses
  // precision, which can pick the wrong oldest ID and defeat the progress and cap checks.
  const oldestTxId: IcrcIndexDid.BlockIndex | undefined = page.reduce<
    IcrcIndexDid.BlockIndex | undefined
  >(
    (oldest, { id }) => (isNullish(oldest) || id < oldest ? id : oldest),
    undefined
  );

  // Did we fetch all new transactions or there were more transactions than the batch size (DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT) since last time the worker fetched the transactions
  if (isNullish(stopTxId) || isNullish(oldestTxId) || oldestTxId <= stopTxId) {
    return undefined;
  }

  // The Index canister can answer a page that does not move the oldest ID
  // down. Such a page makes no progress, so the pagination stops with it.
  if (nonNullish(start) && oldestTxId >= start) {
    return undefined;
  }

  // Two transactions can have the same Id - e.g. a transaction from/to same account.
  // That is why we fetch the next batch of transactions starting from the same Id and not Id - 1n because otherwise there would be a chance that we might miss one.
  // Note: when "start" is provided, getIcrcTransactions search from "start" and returns "start" included in the results.
  return oldestTxId;
};

const getIcrcAccountTransactions = async ({
  state,
  ...params
}: GetAccountTransactionsParams): Promise<GetAccountsTransactionsResults> => {
  // A backlog from an earlier sync goes first. The newest transactions wait
  // until a sync completes the backlog.
  const backlog = state?.backlog;
  const stopTxId = backlog?.stopTxId ?? state?.mostRecentTxId;

  let currentStart: bigint | undefined = backlog?.start;

  const { transactions: firstPage, ...rest } = await getIcrcTransactions({
    ...params,
    start: currentStart,
    state,
  });

  // Collect the pages and flatten them once at the end.
  const pages: IcrcIndexDid.TransactionWithId[][] = [firstPage];

  let nextStart = nextPageStart({
    page: firstPage,
    start: currentStart,
    stopTxId,
  });

  // The Index canister is not trusted, therefore the loop stops after
  // DEFAULT_INDEX_TRANSACTION_MAX_PAGES pages whatever the canister answers.
  // The remaining pages become the backlog of the next sync.
  while (
    nonNullish(nextStart) &&
    pages.length < DEFAULT_INDEX_TRANSACTION_MAX_PAGES
  ) {
    currentStart = nextStart;

    const { transactions } = await getIcrcTransactions({
      ...params,
      start: currentStart,
      state,
    });

    pages.push(transactions);

    nextStart = nextPageStart({
      page: transactions,
      start: currentStart,
      stopTxId,
    });
  }

  return {
    ...rest,
    // A backlog page is older than the most recent transaction id of the state.
    mostRecentTxId: nonNullish(backlog)
      ? state?.mostRecentTxId
      : rest.mostRecentTxId,
    transactions: pages.flat(),
    backlog:
      nonNullish(nextStart) && nonNullish(stopTxId)
        ? { start: nextStart, stopTxId }
        : undefined,
  };
};

const getIcrcTransactions = async ({
  identity,
  indexCanisterId,
  accountIdentifier,
  start,
  fetchRootKey,
  host,
}: GetAccountTransactionsParams): Promise<GetAccountsTransactionsResults> => {
  {
    const { transactions, ...rest } = await getIcrcIndexTransactions({
      indexCanisterId,
      identity,
      account: decodeIcrcAccount(accountIdentifier),
      maxResults: BigInt(DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT),
      start,
      fetchRootKey,
      host,
    });

    // Similar to `icrc-transactions.utils.getOldestTxIdFromStore`
    const mostRecentTxId = transactions.sort(
      (
        { transaction: { timestamp: timestampA } },
        { transaction: { timestamp: timestampB } }
      ) => Number(timestampB - timestampA)
    )[0]?.id;

    return {
      accountIdentifier,
      ...rest,
      transactions,
      mostRecentTxId,
    };
  }
};
