import { queryTVL as queryTVLApi } from "$lib/api/tvl.api.cjs";
import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AnonymousIdentity } from "@dfinity/agent";
import { isNullish } from "@dfinity/utils";

export const queryTVL = async (): Promise<TvlResult | undefined> => {
  if (isNullish(TVL_CANISTER_ID)) {
    return undefined;
  }
  try {
    const result = await queryTVLApi({
      // Because we use the service in a web worker.
      // Do not use utils to generate anonymous identity to avoid Vite/Rollup build issue:
      // "Unexpected token (Note that you need plugins to import files that are not JavaScript)"
      identity: new AnonymousIdentity(),
      certified: false,
      canisterId: TVL_CANISTER_ID,
    });

    return result;
  } catch (err: unknown) {
    // We silent the error as this information is not crucial to use the dapp
    console.error(err);
    return undefined;
  }
};
