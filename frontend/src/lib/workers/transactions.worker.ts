import {SYNC_ACCOUNTS_TIMER_INTERVAL, SYNC_TRANSACTIONS_TIMER_INTERVAL} from "$lib/constants/accounts.constants";
import {
  IcrcWorkerStore,
  type IcrcWorkerData,
} from "$lib/stores/icrc-worker.store";
import type { PostMessageDataRequestAccounts } from "$lib/types/post-message.accounts";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { WorkerTimer, type WorkerTimerJobData } from "$lib/workers/worker.timer";

// Worker context to start and stop job
const worker = new WorkerTimer();

// A worker store to keep track of transactions
interface TransactionsData extends IcrcWorkerData {
  balance: bigint;
}

const store = new IcrcWorkerStore<TransactionsData>();

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestTransactions>>) => {
  const { msg, data } = dataMsg;

  const job = async ({
    identity,
    data,
  }: WorkerTimerJobData<PostMessageDataRequestTransactions>) =>
    await syncTransactions({ identity, data });

  switch (msg) {
    case "nnsStopTransactionsTimer":
      worker.stop(() => store.reset());
      return;
    case "nnsStartTransactionsTimer":
      await worker.start<PostMessageDataRequestAccounts>({
        interval: SYNC_TRANSACTIONS_TIMER_INTERVAL,
        job,
        data,
      });
      return;
  }
};

const syncTransactions = async (
  params: WorkerTimerJobData<PostMessageDataRequestTransactions>
) => {
  // TODO
  console.log(params);
};
