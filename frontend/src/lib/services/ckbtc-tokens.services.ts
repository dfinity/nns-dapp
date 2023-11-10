import { getCkBTCToken } from "$lib/api/ckbtc-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { UniverseCanisterId } from "$lib/types/universe";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

export const loadCkBTCTokens = async () => {
  const enableCkBTC = get(ENABLE_CKBTC);
  const enableCkBTCTest = get(ENABLE_CKTESTBTC);
  return Promise.all([
    enableCkBTC
      ? loadCkBTCToken({ universeId: CKBTC_UNIVERSE_CANISTER_ID })
      : undefined,
    enableCkBTCTest
      ? loadCkBTCToken({ universeId: CKTESTBTC_UNIVERSE_CANISTER_ID })
      : undefined,
  ]);
};

export const loadCkBTCToken = async ({
  handleError,
  universeId,
}: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}) => {
  // Currently we assume the token metadata does not change that often and might never change while the session is active
  // That's why, we load the token for a project only once as long as its data is already certified
  const storeData = get(tokensStore);
  if (storeData[universeId.toText()]?.certified) {
    return;
  }

  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    identityType: "anonymous",
    request: ({ certified, identity }) =>
      getCkBTCToken({
        identity,
        certified,
        canisterId: universeId,
      }),
    onLoad: async ({ response: token, certified }) => {
      tokensStore.setToken({
        certified,
        canisterId: universeId,
        token,
      });
    },
    onError: ({ error: err, certified }) => {
      if (!certified && notForceCallStrategy()) {
        return;
      }
      // Explicitly handle only UPDATE errors
      toastsError({
        labelKey: "error.token_not_found",
        err,
      });
      // Hide unproven data
      // tokensStore.resetUniverse(universeId);
      handleError?.();
    },
  });
};
