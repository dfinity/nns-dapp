import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import { getIcrcTransactions } from "$lib/api/icrc-index.api.cjs";
import { SYNC_TRANSACTIONS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import {
  IcrcWorkerStore,
  type IcrcWorkerData,
} from "$lib/stores/icrc-worker.store";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import {
  WorkerTimer,
  type WorkerTimerJobData,
} from "$lib/workers/worker.timer";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";

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
    console.log("Worker Transactions", results);

    // TODO post message if something new
    // TODO save last
    // TODO: fetch only from last
  } catch (err: unknown) {
    // TODO: postMessage error
    // TODO: reset

    // Bubble errors
    throw err;
  }
};

const getTransactions = ({
  identity,
  data: { accounts, indexCanisterId },
}: WorkerTimerJobData<PostMessageDataRequestTransactions>): Promise<
  GetTransactionsResponse[]
> =>
  Promise.all(
    accounts.map(async (accountIdentifier) =>
      getIcrcTransactions({
        canisterId: Principal.fromText(indexCanisterId),
        identity,
        account: decodeIcrcAccount(accountIdentifier),
        maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
      })
    )
  );
