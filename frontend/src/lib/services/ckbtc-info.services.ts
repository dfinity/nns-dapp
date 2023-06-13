import { minterInfo } from "$lib/api/ckbtc-minter.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import type { MinterInfo } from "@dfinity/ckbtc";
import { get } from "svelte/store";

export const loadCkBTCInfo = async ({
  handleError,
  universeId,
}: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}) => {
  // We assume the ckBTC parameters do not change that often and might never change while the session is active
  // That's why, we load the params for a project only once as long as its data is already certified
  const storeData = get(ckBTCInfoStore);
  if (storeData[universeId.toText()]?.certified) {
    return;
  }

  return queryAndUpdate<MinterInfo, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      minterInfo({
        identity,
        certified,
        canisterId: universeId,
      }),
    onLoad: async ({ response: info, certified }) =>
      ckBTCInfoStore.setInfo({
        certified,
        canisterId: universeId,
        info,
      }),
    onError: ({ error: err, certified }) => {
      if (!certified && FORCE_CALL_STRATEGY !== "query") {
        return;
      }

      // Explicitly handle only UPDATE errors
      toastsError({
        labelKey: "error__ckbtc.info_not_found",
        err,
      });

      // Hide unproven data
      ckBTCInfoStore.resetUniverse(universeId);

      handleError?.();
    },
  });
};
