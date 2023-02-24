import { queryTVL as queryTVLApi } from "$lib/api/tvl.api";
import type { TvlResult } from "$lib/canisters/tvl/tvl";
import { AnonymousIdentity } from "@dfinity/agent";

export const queryTVL = (): Promise<TvlResult> =>
  queryTVLApi({
    identity: new AnonymousIdentity(),
    certified: false,
  });
