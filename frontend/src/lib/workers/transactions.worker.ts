import { SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS } from "$lib/constants/accounts.constants";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { getIcrcAccountsTransactions } from "$lib/worker-services/icrc-transactions.worker-services";
import { DictionaryWorkerStore } from "$lib/worker-stores/dictionary.worker-store";
import type { TransactionsData } from "$lib/worker-types/transactions.worker-types";
import {
  TimerWorkerUtils,
  type TimerWorkerUtilsJobData,
} from "$lib/worker-utils/timer.worker-utils";
import { jsonReplacer } from "@dfinity/utils";

// Worker context to start and stop job
const worker = new TimerWorkerUtils();

// A worker store to keep track of transactions
const store = new DictionaryWorkerStore<TransactionsData>();

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
        interval: SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS,
        job: syncTransactions,
        data,
      });
      return;
  }
};

const syncTransactions = async (
  params: TimerWorkerUtilsJobData<PostMessageDataRequestTransactions>
) => {
  try {
    const results = await getIcrcAccountsTransactions({
      ...params,
      state: store.state,
    });

    const newTransactions = results.filter(
      ({ accountIdentifier, mostRecentTxId }) =>
        mostRecentTxId !== store.state[accountIdentifier]?.mostRecentTxId
    );

    if (newTransactions.length === 0) {
      // No new transactions
      return;
    }

    store.update(
      newTransactions.map(({ accountIdentifier, mostRecentTxId, ...rest }) => ({
        key: accountIdentifier,
        certified: true,
        mostRecentTxId,
        ...rest,
      }))
    );

    emitTransactions(
      newTransactions.map(({ transactions, ...rest }) => ({
        transactions: JSON.stringify(transactions, jsonReplacer),
        ...rest,
      }))
    );
  } catch (err: unknown) {
    postMessage({
      msg: "nnsSyncErrorTransactions",
      data: err,
    });

    // Bubble errors
    throw err;
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
