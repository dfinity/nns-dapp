import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import { getIcrcTransactions } from "$lib/api/icrc-index.api.cjs";
import { SYNC_TRANSACTIONS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import {
  IcrcWorkerStore,
  type IcrcWorkerData,
} from "$lib/stores/icrc-worker.store";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { jsonReplacer } from "$lib/utils/json.utils";
import {
  WorkerTimer,
  type WorkerTimerJobData,
} from "$lib/workers/worker.timer";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";

// Worker context to start and stop job
const worker = new WorkerTimer();

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
      worker.stop(() => store.reset());
      return;
    case "nnsStartTransactionsTimer":
      await worker.start<PostMessageDataRequestTransactions>({
        interval: SYNC_TRANSACTIONS_TIMER_INTERVAL,
        job: syncTransactions,
        data,
      });
      return;
  }
};

const syncTransactions = async (
  params: WorkerTimerJobData<PostMessageDataRequestTransactions>
) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const results = await getTransactions(params);

    const newTransactions = results.filter(
      ({ accountIdentifier, mostRecentTxId }) =>
        mostRecentTxId !== store.state[accountIdentifier]?.mostRecentTxId
    );

    if (newTransactions.length === 0) {
      // No new transactions
      return;
    }

    store.update(
      newTransactions.map(({ accountIdentifier, mostRecentTxId }) => ({
        accountIdentifier,
        certified: true,
        mostRecentTxId,
      }))
    );

    emitTransactions(newTransactions);
  } catch (err: unknown) {
    // TODO: postMessage error
    // TODO: reset

    // Bubble errors
    throw err;
  }
};

const getTransactions = ({
  identity,
  data: { accountIdentifiers, indexCanisterId },
}: WorkerTimerJobData<PostMessageDataRequestTransactions>): Promise<
  PostMessageDataResponseTransaction[]
> =>
  Promise.all(
    accountIdentifiers.map(async (accountIdentifier) => {
      // start is undefined: index provides most recent transactions
      // start is defined:
      // - index provides the particular transaction and previous (IDs 60n, 59n, 58n etc.)
      // - if the start is above the most recent txId, then the index canister returns the tip and following (request ID 65n, index returns 60n, 59n, 58n etc.)
      const txId = store.state[accountIdentifier]?.mostRecentTxId;
      const start =
        txId !== undefined
          ? txId + BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT)
          : undefined;

      const { transactions, ...rest } = await getIcrcTransactions({
        canisterId: Principal.fromText(indexCanisterId),
        identity,
        account: decodeIcrcAccount(accountIdentifier),
        maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
        start,
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
        completed: transactions.length < DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT,
        transactions: JSON.stringify(transactions, jsonReplacer),
        mostRecentTxId,
      };
    })
  );

const emitTransactions = (
  transactions: PostMessageDataResponseTransaction[]
) => {
  const data: PostMessageDataResponseTransactions = { transactions };

  postMessage({
    msg: "nnsSyncTransactions",
    data,
  });
};
