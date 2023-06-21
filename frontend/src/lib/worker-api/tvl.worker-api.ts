import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import type {
  GetTVLRequest,
  GetTVLResult,
} from "$lib/canisters/tvl/tvl.canister.types";
import type { CanisterId } from "$lib/types/canister";
import type { CanisterActorParams } from "$lib/types/worker";
import { mapCanisterId } from "$lib/utils/canisters.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import {
  createCanisterWorker,
  type CreateCanisterWorkerParams,
} from "$lib/worker-utils/canister.worker-utils";
import { isNullish } from "@dfinity/utils";

export const queryTVL = async ({
  identity,
  tvlCanisterId,
  fetchRootKey,
  host,
  ...rest
}: {
  tvlCanisterId: string | undefined;
} & CanisterActorParams &
  GetTVLRequest): Promise<GetTVLResult | undefined> => {
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

  const result = getTVL(rest);

  logWithTimestamp(`Getting canister ${canisterId.toText()} TVL complete.`);

  return result;
};

const canister = (
  params: CanisterActorParams & { canisterId: CanisterId }
): Promise<TVLCanister> =>
  createCanisterWorker<TVLCanister>({
    ...params,
    create: ({ agent, canisterId }: CreateCanisterWorkerParams) =>
      TVLCanister.create({
        agent,
        canisterId,
      }),
  });
