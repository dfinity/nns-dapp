import { createAgent } from "$lib/api/agent.api";
import { HOST } from "$lib/constants/environment.constants";
import type { Agent, Identity } from "@dfinity/agent";
import {
  IcrcIndexCanister,
  type IcrcAccount,
  type IcrcGetTransactions,
} from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";

export interface GetTransactionsParams {
  identity: Identity;
  account: IcrcAccount;
  start?: bigint;
  maxResults: bigint;
  indexCanisterId: Principal;
}

export interface GetTransactionsResponse
  extends Omit<IcrcGetTransactions, "oldest_tx_id"> {
  oldestTxId?: bigint;
}

export const getTransactions = async ({
  identity,
  indexCanisterId,
  maxResults,
  start,
  account,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  const {
    canister: { getTransactions },
  } = await indexCanister({ identity, canisterId: indexCanisterId });

  const { oldest_tx_id, ...rest } = await getTransactions({
    max_results: maxResults,
    start,
    account,
  });

  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};

export const getLedgerId = async ({
  identity,
  indexCanisterId,
  certified,
}: {
  identity: Identity;
  indexCanisterId: Principal;
  certified?: boolean;
}): Promise<Principal> => {
  const {
    canister: { ledgerId },
  } = await indexCanister({ identity, canisterId: indexCanisterId });

  return ledgerId({ certified });
};

const indexCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: IcrcIndexCanister;
  agent: Agent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcIndexCanister.create({
    agent,
    canisterId,
  });

  return {
    canister,
    agent,
  };
};
