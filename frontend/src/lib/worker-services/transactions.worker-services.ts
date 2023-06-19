import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import type { IcrcWorkerStore } from "$lib/stores/icrc-worker.store";
import type { AccountIdentifierText } from "$lib/types/account";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
} from "$lib/types/post-message.transactions";
import { jsonReplacer } from "$lib/utils/json.utils";
import { getIcrcTransactions } from "$lib/worker-api/icrc-index.worker-api";
import type { TransactionsData } from "$lib/worker-types/transactions.worker-types";
import type {
  TimerWorkerUtilsJobData,
  TimerWorkerUtilsSyncParams,
} from "$lib/worker-utils/timer.worker-utils";
import { decodeIcrcAccount } from "@dfinity/ledger";
import type {
  TransactionWithId,
  TxId,
} from "@dfinity/ledger/dist/candid/icrc1_index";
import { nonNullish } from "@dfinity/utils";

export type GetAccountsTransactionsResults = Omit<
  PostMessageDataResponseTransaction,
  "transactions"
> &
  Pick<GetTransactionsResponse, "transactions">;

export const getAccountsTransactions = ({
  identity,
  data: { accountIdentifiers, indexCanisterId, host, fetchRootKey },
  store,
}: TimerWorkerUtilsJobData<PostMessageDataRequestTransactions> & {
  store: IcrcWorkerStore<TransactionsData>;
}): Promise<GetAccountsTransactionsResults[]> =>
  Promise.all(
    accountIdentifiers.map(async (accountIdentifier) => {
      const { transactions, ...rest } = await getAccountTransactions({
        identity,
        indexCanisterId,
        accountIdentifier,
        host,
        fetchRootKey,
        state: store.state[accountIdentifier],
      });

      return {
        transactions: transactions.reduce((acc, value) => {
          const alreadyExist = (): boolean =>
            acc.find(
              ({ id, transaction }) =>
                value.id === id &&
                JSON.stringify(transaction, jsonReplacer) ===
                  JSON.stringify(value, jsonReplacer)
            ) !== undefined;

          return [...acc, ...(alreadyExist() ? [] : [value])];
        }, [] as TransactionWithId[]),
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

const getAccountTransactions = async ({
  identity,
  indexCanisterId,
  accountIdentifier,
  start,
  fetchRootKey,
  host,
  state,
}: GetAccountTransactionsParams): Promise<GetAccountsTransactionsResults> => {
  const { mostRecentTxId, transactions, ...rest } = await getTransactions({
    identity,
    indexCanisterId,
    accountIdentifier,
    start,
    fetchRootKey,
    host,
    state,
  });

  const oldestTxId: TxId | undefined = [...transactions].sort(
    (
      { transaction: { timestamp: timestampA } },
      { transaction: { timestamp: timestampB } }
    ) => Number(timestampA - timestampB)
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
            await getAccountTransactions({
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

const getTransactions = async ({
  identity,
  indexCanisterId,
  accountIdentifier,
  start,
  fetchRootKey,
  host,
}: GetAccountTransactionsParams): Promise<GetAccountsTransactionsResults> => {
  {
    const { transactions, ...rest } = await getIcrcTransactions({
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
