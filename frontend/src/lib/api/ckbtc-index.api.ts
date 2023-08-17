import { createAgent } from "$lib/api/agent.api";
import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { getTransactions as getIcrcTransactions } from "$lib/api/icrc-index.api";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import { IcrcIndexCanister } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";

export const getCkBTCTransactions = async ({
  identity,
  indexCanisterId: canisterId,
  ...rest
}: Omit<GetTransactionsParams, "getTransactions" | "canisterId"> & {
  indexCanisterId: Principal;
}): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting ckBTC accounts transactions: call...");

  const {
    canister: { getTransactions },
  } = await ckBTCIndexCanister({ identity, canisterId });

  const results = await getIcrcTransactions({
    identity,
    ...rest,
    getTransactions,
  });

  logWithTimestamp("Getting ckBTC account transactions: done");

  return results;
};

const ckBTCIndexCanister = async ({
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
