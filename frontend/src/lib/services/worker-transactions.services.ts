import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { syncStore } from "$lib/stores/sync.store";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
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
    } & Omit<PostMessageDataRequestTransactions, "fetchRootKey" | "host">
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
  }: MessageEvent<
    PostMessage<
      PostMessageDataResponseTransactions | PostMessageDataResponseSync
    >
  >) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSyncTransactions":
        transactionsCallback?.(
          data.data as PostMessageDataResponseTransactions
        );
        return;
      case "nnsSyncStatus":
        syncStore.setState({
          key: "transactions",
          state: (data.data as PostMessageDataResponseSync).state,
        });
        return;
      case "nnsSyncErrorTransactions":
        syncStore.setState({
          key: "transactions",
          state: "error",
        });
        return;
    }
  };

  return {
    startTransactionsTimer: ({
      callback,
      ...rest
    }: {
      callback: TransactionsCallback;
    } & Omit<PostMessageDataRequestTransactions, "fetchRootKey" | "host">) => {
      transactionsCallback = callback;

      transactionsWorker.postMessage({
        msg: "nnsStartTransactionsTimer",
        data: { ...rest, ...ACTOR_PARAMS },
      });
    },
    stopTransactionsTimer: () => {
      transactionsWorker.postMessage({
        msg: "nnsStopTransactionsTimer",
      });
    },
  };
};
