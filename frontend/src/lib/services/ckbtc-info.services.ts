import { minterInfo } from "$lib/api/ckbtc-minter.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { isUniverseCkBTC } from "$lib/utils/universe.utils";
import type { MinterInfo } from "@dfinity/ckbtc";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadCkBTCInfo = async ({
  handleError,
  universeId,
  minterCanisterId,
}: {
  handleError?: () => void;
  universeId?: UniverseCanisterId;
} & Partial<Pick<CkBTCAdditionalCanisters, "minterCanisterId">>) => {
  // Do nothing when the universe is not ckBTC
  if (isNullish(universeId) || !isUniverseCkBTC(universeId)) {
    return;
  }

  // We assume the ckBTC parameters do not change that often and might never change while the session is active
  // That's why, we load the params for a project only once as long as its data is already certified
  const storeData = get(ckBTCInfoStore);
  if (storeData[universeId.toText()]?.certified) {
    return;
  }

  // We do not throw an error here if the minter canister ID is not defined. It's up to the features that uses ckBTCInfoStore to properly handle undefined values
  if (isNullish(minterCanisterId)) {
    return;
  }

  return queryAndUpdate<MinterInfo, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      minterInfo({
        identity,
        certified,
        canisterId: minterCanisterId,
      }),
    onLoad: async ({ response: info, certified }) =>
      ckBTCInfoStore.setInfo({
        certified,
        canisterId: universeId,
        info,
      }),
    onError: ({ error: err, certified }) => {
      if (!certified && notForceCallStrategy()) {
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
