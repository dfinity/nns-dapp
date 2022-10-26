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
import { fromNullable, toNullable } from "@dfinity/utils";

interface GetTransactionsParams {
  identity: Identity;
  account: SnsAccount;
  start?: bigint;
  maxResults: bigint;
  // TODO: Use wrapper https://dfinity.atlassian.net/browse/GIX-1093
  // rootCanisterId: Principal;
}

interface GetTransactionsResponse {
  oldestTxId?: bigint;
  transactions: SnsTransactionWithId[];
}

// TODO: Add test when we use the wrapper https://dfinity.atlassian.net/browse/GIX-1093
export const getTransactions = async ({
  identity,
  account: { owner, subaccount },
  start,
  maxResults,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting sns accounts: call...");
  const agent = await createAgent({ identity, host: HOST });
  // TODO: Use wrapper https://dfinity.atlassian.net/browse/GIX-1093
  const { getTransactions: getTransactionsApi } = SnsIndexCanister.create({
    canisterId: Principal.fromText("wzp7w-lyaaa-aaaaa-aaara-cai"),
    agent,
  });
  // TODO: Change the type of `account` to be `SnsAccount`
  const { oldest_tx_id, transactions } = await getTransactionsApi({
    max_results: maxResults,
    start,
    account: {
      owner,
      subaccount: toNullable(subaccount),
    },
  });

  logWithTimestamp("");
  return {
    oldestTxId: fromNullable(oldest_tx_id),
    transactions,
  };
};
