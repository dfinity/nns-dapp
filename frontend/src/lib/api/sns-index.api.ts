import { HOST } from "$lib/constants/environment.constants";
import { createAgent } from "$lib/utils/agent.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import {
  SnsIndexCanister,
  type SnsAccount,
  type SnsTransactionWithId,
} from "@dfinity/sns";

interface GetTransactionsParams {
  identity: Identity;
  account: SnsAccount;
  start?: bigint;
  maxResults: bigint;
  // TODO: Use wrapper https://dfinity.atlassian.net/browse/GIX-1093
  // rootCanisterId: Principal;
}

interface GetTransactionsResponse {
  oldestTxId: bigint;
  transactions: SnsTransactionWithId;
}

export const getTransactions = async ({
  identity,
  account,
  start,
  maxResults,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting sns accounts: call...");
  const agent = await createAgent({ identity, host: HOST });
  // TODO: Use wrapper https://dfinity.atlassian.net/browse/GIX-1093
  const { getTransactions: getTransactionsApi } = SnsIndexCanister.create({
    canisterId: Principal.fromText("tqtu6-byaaa-aaaaa-aaana-cai"),
    agent,
  });
  const { oldest_tx_id, transactions } = await getTransactionsApi({
    max_results: maxResults,
    start,
    account,
  });

  logWithTimestamp("");
  return {
    oldestTxId: oldest_tx_id,
    transactions,
  };
};
