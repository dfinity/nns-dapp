import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";

import type { AccountIdentifierText } from "$lib/types/account";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
} from "$lib/types/post-message.transactions";
import { jsonReplacer } from "$lib/utils/json.utils";
import { getIcrcTransactions as getIcrcIndexTransactions } from "$lib/worker-api/icrc-index.worker-api";
import type { DictionaryWorkerState } from "$lib/worker-stores/dictionary.worker-store";
import type { TransactionsData } from "$lib/worker-types/transactions.worker-types";
import type {
  TimerWorkerUtilsJobData,
  TimerWorkerUtilsSyncParams,
} from "$lib/worker-utils/timer.worker-utils";
import {
  decodeIcrcAccount,
  type IcrcTransactionWithId,
  type IcrcTxId,
} from "@dfinity/ledger";
import { nonNullish } from "@dfinity/utils";

export type GetAccountsTransactionsResults = Omit<
  PostMessageDataResponseTransaction,
  "transactions"
> &
  Pick<GetTransactionsResponse, "transactions">;

/**
 * Collect the ICRC transactions for a list of accounts.
 *
 * For each account provided as a parameter, the service ensures that no duplicate transactions are returned and handles fetching all transactions recursively, taking into account the pagination of the backend API calls.
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
                JSON.stringify(transaction, jsonReplacer) ===
                  JSON.stringify(value, jsonReplacer)
            ) !== undefined;

          return [...acc, ...(alreadyExist() ? [] : [value])];
        }, [] as IcrcTransactionWithId[]),
        ...rest,
      };
    })
  );

type GetAccountTransactionsParams = TimerWorkerUtilsSyncParams &
  Omit<PostMessageDataRequestTransactions, "accountIdentifiers"> & {
    accountIdentifier: AccountIdentifierText;
    start?: bigint;
    state: TransactionsData | undefined;
  };

const getIcrcAccountTransactions = async ({
  identity,
  indexCanisterId,
  accountIdentifier,
  start,
  fetchRootKey,
  host,
  state,
}: GetAccountTransactionsParams): Promise<GetAccountsTransactionsResults> => {
  const { mostRecentTxId, transactions, ...rest } = await getIcrcTransactions({
    identity,
    indexCanisterId,
    accountIdentifier,
    start,
    fetchRootKey,
    host,
    state,
  });

  const oldestTxId: IcrcTxId | undefined = [...transactions].sort(
    ({ id: idA }, { id: idB }) => Number(idA - idB)
  )[0]?.id;

  // Did we fetch all new transactions or there were more transactions than the batch size (DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT) since last time the worker fetched the transactions
  const fetchMore = (): boolean => {
    const stateMostRecentTxId = state?.mostRecentTxId;
    return (
      nonNullish(stateMostRecentTxId) &&
      nonNullish(oldestTxId) &&
      oldestTxId > stateMostRecentTxId
    );
  };

  // Two transactions can have the same Id - e.g. a transaction from/to same account.
  // That is why we fetch the next batch of transactions starting from the same Id and not Id - 1n because otherwise there would be a chance that we might miss one.
  // Note: when "start" is provided, getIcrcTransactions search from "start" and returns "start" included in the results.
  const nextTxId = (oldestTxId: bigint): bigint => oldestTxId;

  return {
    mostRecentTxId,
    ...rest,
    transactions: [
      ...transactions,
      ...(fetchMore() && nonNullish(oldestTxId)
        ? (
            await getIcrcAccountTransactions({
              identity,
              indexCanisterId,
              accountIdentifier,
              start: nextTxId(oldestTxId),
              fetchRootKey,
              host,
              state,
            })
          ).transactions
        : []),
    ],
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
      maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
      start,
      fetchRootKey,
      host,
    });

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
