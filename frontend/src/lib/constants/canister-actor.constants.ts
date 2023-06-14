import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import type { CanisterActorParams } from "$lib/types/canister";

export const ACTOR_PARAMS: Pick<CanisterActorParams, "host" | "fetchRootKey"> =
  {
    host: HOST,
    fetchRootKey: FETCH_ROOT_KEY,
  };
