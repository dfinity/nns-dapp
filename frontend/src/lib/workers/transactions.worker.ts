import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import { IcrcWorkerStore } from "$lib/worker-stores/icrc.worker-store";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransaction,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { jsonReplacer } from "$lib/utils/json.utils";
import { getAccountsTransactions } from "$lib/worker-services/transactions.worker-services";
import type { TransactionsData } from "$lib/worker-types/transactions.worker-types";
import {
  TimerWorkerUtils,
  type TimerWorkerUtilsJobData,
} from "$lib/worker-utils/timer.worker-utils";

// Worker context to start and stop job
const worker = new TimerWorkerUtils();

// A worker store to keep track of transactions
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
  params: TimerWorkerUtilsJobData<PostMessageDataRequestTransactions>
) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const results = await getAccountsTransactions({
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

const emitTransactions = (
  transactions: PostMessageDataResponseTransaction[]
) => {
  const data: PostMessageDataResponseTransactions = { transactions };

  postMessage({
    msg: "nnsSyncTransactions",
    data,
  });
};
