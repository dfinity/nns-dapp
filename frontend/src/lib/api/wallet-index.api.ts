import { createAgent } from "$lib/api/agent.api";
import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { getTransactions as getIcrcTransactions } from "$lib/api/icrc-index.api";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import { IcrcIndexCanister } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";

/**
 * TODO: move to icrc-index once Sns migrated to icrcStore
 */
export const getTransactions = async ({
  identity,
  indexCanisterId: canisterId,
  ...rest
}: Omit<GetTransactionsParams, "getTransactions" | "canisterId"> & {
  indexCanisterId: Principal;
}): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting wallet transactions: call...");

  const {
    canister: { getTransactions },
  } = await indexCanister({ identity, canisterId });

  const results = await getIcrcTransactions({
    identity,
    ...rest,
    getTransactions,
  });

  logWithTimestamp("Getting wallet transactions: done");

  return results;
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
