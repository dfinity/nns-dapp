import { queryFinalizationStatus } from "$lib/api/sns-sale.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getOrCreateSnsFinalizationStatusStore } from "$lib/stores/sns-finalization-status.store";
import type { Principal } from "@dfinity/principal";
import type { SnsGetAutoFinalizationStatusResponse } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { queryAndUpdate } from "./utils.services";

export const loadSnsFinalizationStatus = async (rootCanisterId: Principal) => {
  await queryAndUpdate<
    SnsGetAutoFinalizationStatusResponse | undefined,
    unknown
  >({
    strategy: FORCE_CALL_STRATEGY,
    identityType: "anonymous",
    request: ({ certified, identity }) =>
      queryFinalizationStatus({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response, certified }) => {
      // If the response is `undefined`, it means the method is not supported.
      // In that case, there is no need to update the store.
      if (nonNullish(response)) {
        const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);
        store.setData({
          data: response,
          certified,
        });
      }
    },
    onError: ({ error: err }) => {
      // Ignore the error. This is a bonus feature. If it fails, the UX isn't affected.
      console.error(err);
    },
    logMessage: "Querying SNS finalization status",
  });
};
