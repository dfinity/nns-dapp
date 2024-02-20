import { HOST } from "$lib/constants/environment.constants";
import type { Agent, Identity } from "@dfinity/agent";
import {
  IndexCanister,
  type GetAccountIdentifierTransactionsResponse,
} from "@dfinity/ledger-icp";
import type { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";
import { createAgent } from "./agent.api";

export interface GetTransactionsParams {
  identity: Identity;
  accountIdentifier: string;
  start?: bigint;
  maxResults: bigint;
  indexCanisterId: Principal;
}

export interface GetTransactionsResponse
  extends Omit<GetAccountIdentifierTransactionsResponse, "oldest_tx_id"> {
  oldestTxId?: bigint;
}

export const getTransactions = async ({
  identity,
  indexCanisterId,
  maxResults,
  start,
  accountIdentifier,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  const {
    canister: { getTransactions },
  } = await indexCanister({ identity, canisterId: indexCanisterId });

  const { oldest_tx_id, ...rest } = await getTransactions({
    maxResults,
    start,
    accountIdentifier,
  });

  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};

const indexCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
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
    canisterId,
  });

  return {
    canister,
    agent,
  };
};
