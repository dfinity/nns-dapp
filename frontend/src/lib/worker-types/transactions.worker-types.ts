import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import type { PostMessageDataResponseTransaction } from "$lib/types/post-message.transactions";
import type { DictionaryWorkerData } from "$lib/worker-stores/dictionary.worker-store";

/**
 * The transactions that one sync did not fetch because it hit the page cap.
 * The next sync continues from `start` down to `stopTxId`.
 */
export interface TransactionsBacklog {
  // The `start` of the next call to the index canister.
  start: bigint;
  // The most recent transaction id that the worker knew before the gap. The backlog is complete when a page reaches it.
  stopTxId: bigint;
}

export type TransactionsData = DictionaryWorkerData &
  GetTransactionsResponse &
  Pick<PostMessageDataResponseTransaction, "mostRecentTxId"> & {
    backlog?: TransactionsBacklog;
  };
