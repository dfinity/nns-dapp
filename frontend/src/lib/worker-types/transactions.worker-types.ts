import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import type { PostMessageDataResponseTransaction } from "$lib/types/post-message.transactions";
import type { DictionaryWorkerData } from "$lib/worker-stores/dictionary.worker-store";

export type TransactionsData = DictionaryWorkerData &
  GetTransactionsResponse &
  Pick<PostMessageDataResponseTransaction, "mostRecentTxId">;
