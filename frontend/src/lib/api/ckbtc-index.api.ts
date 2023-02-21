import { createAgent } from "$lib/api/agent.api";
import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { getTransactions as getIcrcTransactions } from "$lib/api/icrc-index.api";
import { CKBTC_INDEX_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { IcrcIndexCanister } from "@dfinity/ledger";

export const getCkBTCTransactions = async ({
  identity,
  ...rest
}: Omit<
  GetTransactionsParams,
  "getTransactions" | "canisterId"
>): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting ckBTC accounts transactions: call...");

  const {
    canister: { getTransactions },
  } = await ckBTCIndexCanister({ identity });

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
}: {
  identity: Identity;
}): Promise<{
  canister: IcrcIndexCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcIndexCanister.create({
    agent,
    canisterId: CKBTC_INDEX_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
