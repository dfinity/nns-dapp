import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  createCanisterCjs,
  type CreateCanisterCjsParams,
} from "$lib/utils/cjs.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";

export const queryTVL = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<TvlResult | undefined> => {
  if (isNullish(TVL_CANISTER_ID)) {
    return undefined;
  }

  logWithTimestamp(`Getting canister ${TVL_CANISTER_ID.toText()} TVL call...`);

  const { getTVL } = await canister({ identity, canisterId: TVL_CANISTER_ID });

  const result = getTVL({ certified });

  logWithTimestamp(
    `Getting canister ${TVL_CANISTER_ID.toText()} TVL complete.`
  );

  return result;
};

const canister = ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<TVLCanister> =>
  createCanisterCjs<TVLCanister>({
    identity,
    canisterId,
    create: ({ agent, canisterId }: CreateCanisterCjsParams) =>
      TVLCanister.create({
        agent,
        canisterId,
      }),
  });
