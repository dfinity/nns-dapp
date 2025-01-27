import { createAgent } from "$lib/api/agent.api";
import { INDEX_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import {
  IndexCanister,
  type GetAccountIdentifierTransactionsResponse,
} from "@dfinity/ledger-icp";
import { fromNullable } from "@dfinity/utils";

export interface GetTransactionsParams {
  identity: Identity;
  accountIdentifier: string;
  start?: bigint;
  maxResults: bigint;
}

export interface GetTransactionsResponse
  extends Omit<GetAccountIdentifierTransactionsResponse, "oldest_tx_id"> {
  oldestTxId?: bigint;
}

export const getTransactions = async ({
  identity,
  maxResults,
  start,
  accountIdentifier,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Get account transactions call...");
  const {
    canister: { getTransactions },
  } = await indexCanister({ identity });

  const { oldest_tx_id, ...rest } = await getTransactions({
    maxResults,
    start,
    accountIdentifier,
  });

  logWithTimestamp("Get account transactions call complete.");
  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};

const indexCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: IndexCanister;
  agent: Agent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IndexCanister.create({
    agent,
    canisterId: INDEX_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
