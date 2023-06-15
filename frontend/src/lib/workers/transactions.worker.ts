import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import { getIcrcTransactions } from "$lib/api/icrc-index.api.cjs";
import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import {
  IcrcWorkerStore,
  type IcrcWorkerData,
} from "$lib/stores/icrc-worker.store";
import type { AccountIdentifierText } from "$lib/types/account";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { jsonReplacer } from "$lib/utils/json.utils";
import {
  TimerWorkerUtil,
  type TimerWorkerUtilJobData,
  type TimerWorkerUtilSyncParams,
} from "$lib/worker-utils/timer.worker-util";
import { decodeIcrcAccount } from "@dfinity/ledger";
import type {
  TransactionWithId,
  TxId,
} from "@dfinity/ledger/dist/candid/icrc1_index";

// Worker context to start and stop job
const worker = new TimerWorkerUtil();

// A worker store to keep track of transactions
type TransactionsData = IcrcWorkerData &
  GetTransactionsResponse &
  Pick<PostMessageDataResponseTransaction, "mostRecentTxId">;

const store = new IcrcWorkerStore<TransactionsData>();

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestTransactions>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopTransactionsTimer":
      worker.stop();
      store.reset();
      return;
    case "nnsStartTransactionsTimer":
      await worker.start<PostMessageDataRequestTransactions>({
        interval: SYNC_ACCOUNTS_TIMER_INTERVAL,
        job: syncTransactions,
        data,
      });
      return;
  }
};

const syncTransactions = async (
  params: TimerWorkerUtilJobData<PostMessageDataRequestTransactions>
) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const results = await getAllTransactions(params);

    const newTransactions = results.filter(
      ({ accountIdentifier, mostRecentTxId }) =>
        mostRecentTxId !== store.state[accountIdentifier]?.mostRecentTxId
    );

    if (newTransactions.length === 0) {
      // No new transactions
      return;
    }

    console.log("NEW TRANSACTIONS", newTransactions);

    store.update(
      newTransactions.map(({ accountIdentifier, mostRecentTxId }) => ({
        accountIdentifier,
        certified: true,
        mostRecentTxId,
      }))
    );

    emitTransactions(
      newTransactions.map(({ transactions, ...rest }) => ({
        transactions: JSON.stringify(transactions, jsonReplacer),
        ...rest,
      }))
    );
  } catch (err: unknown) {
    // TODO: postMessage error
    // TODO: reset

    // Bubble errors
    throw err;
  }
};

type GetTransactionsResults = Omit<
  PostMessageDataResponseTransaction,
  "transactions"
> &
  Pick<GetTransactionsResponse, "transactions">;

const getAllTransactions = ({
  identity,
  data: { accountIdentifiers, indexCanisterId, host, fetchRootKey },
}: TimerWorkerUtilJobData<PostMessageDataRequestTransactions>): Promise<
  GetTransactionsResults[]
> =>
  Promise.all(
    accountIdentifiers.map(async (accountIdentifier) => {
      const { transactions, ...rest } = await getAccountTransactions({
        identity,
        indexCanisterId,
        accountIdentifier,
        host,
        fetchRootKey,
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

type GetAccountTransactionsParams = TimerWorkerUtilSyncParams &
  Omit<PostMessageDataRequestTransactions, "accountIdentifiers"> & {
    accountIdentifier: AccountIdentifierText;
    start?: bigint;
  };

const getAccountTransactions = async ({
  identity,
  indexCanisterId,
  accountIdentifier,
  start,
  fetchRootKey,
  host,
}: GetAccountTransactionsParams): Promise<GetTransactionsResults> => {
  const { mostRecentTxId, transactions, ...rest } = await getTransactions({
    identity,
    indexCanisterId,
    accountIdentifier,
    start,
    fetchRootKey,
    host,
  });

  const oldestTxId: TxId | undefined = [...transactions].sort(
    (
      { transaction: { timestamp: timestampA } },
      { transaction: { timestamp: timestampB } }
    ) => Number(timestampA - timestampB)
  )[0]?.id;

  // Did we fetch all new transactions or there were more transactions than the batch size (DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT) since last time the worker fetched the transactions
  const fetchMore = (): boolean => {
    const stateMostRecentTxId = store.state[accountIdentifier]?.mostRecentTxId;
    return (
      stateMostRecentTxId !== undefined &&
      oldestTxId !== undefined &&
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
      ...(fetchMore() && oldestTxId !== undefined
        ? (
            await getAccountTransactions({
              identity,
              indexCanisterId,
              accountIdentifier,
              start: nextTxId(oldestTxId),
              fetchRootKey,
              host,
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
}: GetAccountTransactionsParams): Promise<GetTransactionsResults> => {
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

const emitTransactions = (
  transactions: PostMessageDataResponseTransaction[]
) => {
  const data: PostMessageDataResponseTransactions = { transactions };

  postMessage({
    msg: "nnsSyncTransactions",
    data,
  });
};
