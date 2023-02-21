import { getCkBTCToken } from "$lib/api/ckbtc-ledger.api";
import { queryAndUpdate } from "$lib/services/utils.services";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { UniverseCanisterId } from "$lib/types/universe";
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
      if (certified !== true) {
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
