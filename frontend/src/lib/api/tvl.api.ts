import type { TvlResult } from "$lib/canisters/tvl/tvl";
import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST_IC0_APP } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent/lib/cjs";
import type { Principal } from "@dfinity/principal";

export const queryTVL = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<TvlResult> => {
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
    host: HOST_IC0_APP,
  });

  return TVLCanister.create({
    agent,
    canisterId,
  });
};
