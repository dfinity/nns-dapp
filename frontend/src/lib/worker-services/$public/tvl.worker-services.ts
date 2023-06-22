import type {
  GetTVLRequest,
  GetTVLResult,
} from "$lib/canisters/tvl/tvl.canister.types";
import type { CanisterActorParams } from "$lib/types/worker";
import { queryTVL as queryTVLApi } from "$lib/worker-api/tvl.worker-api";
import { AnonymousIdentity } from "@dfinity/agent";

export const queryTVL = async (
  params: Omit<CanisterActorParams, "identity"> & {
    tvlCanisterId: string | undefined;
  } & Pick<GetTVLRequest, "currency">
): Promise<GetTVLResult | undefined> => {
  try {
    const result = await queryTVLApi({
      // Because we use the service in a web worker.
      // Do not use utils to generate anonymous identity to avoid Vite/Rollup build issue:
      // "Unexpected token (Note that you need plugins to import files that are not JavaScript)"
      identity: new AnonymousIdentity(),
      certified: false,
      ...params,
    });

    return result;
  } catch (err: unknown) {
    // We silent the error as this information is not crucial to use the dapp
    console.error(err);
    return undefined;
  }
};
