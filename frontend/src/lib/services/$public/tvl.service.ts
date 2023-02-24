import { queryTVL as queryTVLApi } from "$lib/api/tvl.api";
import type { TvlResult } from "$lib/canisters/tvl/tvl";
import {getAnonymousIdentity} from "$lib/services/auth.services";

export const queryTVL = (): Promise<TvlResult> =>
  queryTVLApi({
    identity: getAnonymousIdentity(),
    certified: false,
  });
