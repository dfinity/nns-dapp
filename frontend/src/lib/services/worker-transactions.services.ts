import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";

export type TransactionsCallback = (
  data: PostMessageDataResponseTransactions
) => void;

export interface TransactionsWorker {
  startTransactionsTimer: (
    params: {
      callback: TransactionsCallback;
    } & PostMessageDataRequestTransactions
  ) => void;
  stopTransactionsTimer: () => void;
}

export const initTransactionsWorker = async (): Promise<TransactionsWorker> => {
  const TransactionsWorker = await import(
    "$lib/workers/transactions.worker?worker"
  );
  const transactionsWorker: Worker = new TransactionsWorker.default();

  let transactionsCallback: TransactionsCallback | undefined;

  transactionsWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseTransactions>>) => {
    const { msg } = data;

    // TODO
  };

  return {
    startTransactionsTimer: ({
      callback,
      ...rest
    }: {
      callback: TransactionsCallback;
    } & PostMessageDataRequestTransactions) => {
      transactionsCallback = callback;

      transactionsWorker.postMessage({
        msg: "nnsStartTransactionsTimer",
        data: { ...rest },
      });
    },
    stopTransactionsTimer: () => {
      transactionsWorker.postMessage({
        msg: "nnsStopTransactionsTimer",
      });
    },
  };
};
