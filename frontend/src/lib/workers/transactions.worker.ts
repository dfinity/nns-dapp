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
  Pick<GetTransactionsResponse, "oldestTxId">;

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
      ({ accountIdentifier, transactions: { oldestTxId } }) =>
        oldestTxId !== store.state[accountIdentifier]?.oldestTxId
    );

    if (newTransactions.length === 0) {
      // No new transactions
      return;
    }

    store.update(
      newTransactions.map(
        ({ accountIdentifier, transactions: { oldestTxId } }) => ({
          accountIdentifier,
          certified: true,
          oldestTxId,
        })
      )
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
      const start = store.state[accountIdentifier]?.oldestTxId;

      const transactions = await getIcrcTransactions({
        canisterId: Principal.fromText(indexCanisterId),
        identity,
        account: decodeIcrcAccount(accountIdentifier),
        maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
        start,
      });

      return {
        accountIdentifier,
        transactions,
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
