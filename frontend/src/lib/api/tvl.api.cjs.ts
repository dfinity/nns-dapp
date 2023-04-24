import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
/**
 * HTTP-Agent explicit CJS import for compatibility with web worker - avoid Error [RollupError]: Unexpected token (Note that you need plugins to import files that are not JavaScript)
 */
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HttpAgent } from "@dfinity/agent/lib/cjs/index";

export const queryTVL = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<TvlResult | undefined> => {
  logWithTimestamp(`Getting canister ${TVL_CANISTER_ID.toText()} TVL call...`);

  const { getTVL } = await canister({ identity, canisterId: TVL_CANISTER_ID });

  const result = getTVL({ certified });

  logWithTimestamp(
    `Getting canister ${TVL_CANISTER_ID.toText()} TVL complete.`
  );

  return result;
};

const canister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<TVLCanister> => {
  const agent = new HttpAgent({
    identity,
    host: HOST,
  });

  return TVLCanister.create({
    agent,
    canisterId,
  });
};
