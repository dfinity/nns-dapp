import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { SnsAccount, SnsTransactionWithId } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { wrapper } from "./sns-wrapper.api";

interface GetTransactionsParams {
  identity: Identity;
  account: SnsAccount;
  start?: bigint;
  maxResults: bigint;
  rootCanisterId: Principal;
}

interface GetTransactionsResponse {
  oldestTxId?: bigint;
  transactions: SnsTransactionWithId[];
}

export const getTransactions = async ({
  identity,
  account,
  start,
  maxResults,
  rootCanisterId,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting sns accounts transactions: call...");
  const { getTransactions: getTransactionsApi } = await wrapper({
    identity,
    certified: true,
    rootCanisterId: rootCanisterId.toText(),
  });
  const { oldest_tx_id, transactions } = await getTransactionsApi({
    max_results: maxResults,
    start,
    account,
  });

  logWithTimestamp("Getting sns account transactions: done");
  return {
    oldestTxId: fromNullable(oldest_tx_id),
    transactions,
  };
};
