import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import type { CanisterId } from "$lib/types/canister";
import type { CanisterActorParams } from "$lib/types/worker";
import { mapCanisterId } from "$lib/utils/canisters.utils";
import {
  createCanisterCjs,
  type CreateCanisterCjsParams,
} from "$lib/worker-utils/canister.worker-utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { isNullish } from "@dfinity/utils";

export const queryTVL = async ({
  identity,
  certified,
  tvlCanisterId,
  fetchRootKey,
  host,
}: {
  tvlCanisterId: string | undefined;
  certified: boolean;
} & CanisterActorParams): Promise<TvlResult | undefined> => {
  if (isNullish(tvlCanisterId)) {
    return undefined;
  }

  const canisterId = mapCanisterId(tvlCanisterId);

  logWithTimestamp(`Getting canister ${canisterId.toText()} TVL call...`);

  const { getTVL } = await canister({
    identity,
    canisterId,
    host,
    fetchRootKey,
  });

  const result = getTVL({ certified });

  logWithTimestamp(`Getting canister ${canisterId.toText()} TVL complete.`);

  return result;
};

const canister = (
  params: CanisterActorParams & { canisterId: CanisterId }
): Promise<TVLCanister> =>
  createCanisterCjs<TVLCanister>({
    ...params,
    create: ({ agent, canisterId }: CreateCanisterCjsParams) =>
      TVLCanister.create({
        agent,
        canisterId,
      }),
  });
