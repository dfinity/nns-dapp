import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import type { CanisterActorParams } from "$lib/types/worker";
import { mapCanisterId } from "$lib/utils/canisters.utils";
import {
  createCanisterCjs,
  type CreateCanisterCjsParams,
} from "$lib/utils/cjs.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { isNullish } from "@dfinity/utils";

export const queryTVL = async ({
  identity,
  certified,
  fetchRootKey,
  host,
}: {
  certified: boolean;
} & Omit<CanisterActorParams, "canisterId">): Promise<
  TvlResult | undefined
> => {
  if (isNullish(TVL_CANISTER_ID)) {
    return undefined;
  }

  logWithTimestamp(`Getting canister ${TVL_CANISTER_ID.toText()} TVL call...`);

  const { getTVL } = await canister({
    identity,
    canisterId: TVL_CANISTER_ID,
    host,
    fetchRootKey,
  });

  const result = getTVL({ certified });

  logWithTimestamp(
    `Getting canister ${TVL_CANISTER_ID.toText()} TVL complete.`
  );

  return result;
};

const canister = (params: CanisterActorParams): Promise<TVLCanister> =>
  createCanisterCjs<TVLCanister>({
    ...params,
    create: ({ agent, canisterId }: CreateCanisterCjsParams) =>
      TVLCanister.create({
        agent,
        canisterId: mapCanisterId(canisterId),
      }),
  });
