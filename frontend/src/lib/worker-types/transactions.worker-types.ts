import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import type { IcrcWorkerData } from "$lib/stores/icrc-worker.store";
import type { PostMessageDataResponseTransaction } from "$lib/types/post-message.transactions";

export type TransactionsData = IcrcWorkerData &
  GetTransactionsResponse &
  Pick<PostMessageDataResponseTransaction, "mostRecentTxId">;
