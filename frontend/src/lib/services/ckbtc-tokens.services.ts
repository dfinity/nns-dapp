import { getCkBTCToken } from "$lib/api/ckbtc-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { UniverseCanisterId } from "$lib/types/universe";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { get } from "svelte/store";

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
    request: ({ certified, identity }) =>
      getCkBTCToken({
        identity,
        certified,
        canisterId: universeId,
      }),
    onLoad: async ({ response: token, certified }) =>
      tokensStore.setToken({
        certified,
        canisterId: universeId,
        token,
      }),
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
      tokensStore.resetUniverse(universeId);

      handleError?.();
    },
  });
};
