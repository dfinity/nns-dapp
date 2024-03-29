import { nervousSystemParameters } from "$lib/api/sns-governance.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { toastsError } from "$lib/stores/toasts.store";
import { isForceCallStrategy } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemParameters } from "@dfinity/sns";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

/**
 * Skip request when available in the `snsParametersStore`
 * @param rootCanisterId Principal
 */
export const loadSnsParameters = async (
  rootCanisterId: Principal
): Promise<void> => {
  const storeData = get(snsParametersStore);
  // Do not load if already loaded and certified
  if (
    storeData[rootCanisterId.toText()]?.certified === true ||
    (storeData[rootCanisterId.toText()]?.certified === false &&
      isForceCallStrategy())
  ) {
    return;
  }
  await queryAndUpdate<SnsNervousSystemParameters, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      nervousSystemParameters({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: parameters, certified }) =>
      snsParametersStore.setParameters({
        rootCanisterId,
        parameters,
        certified,
      }),
    onError: ({ error: err, certified, identity }) => {
      console.error(err);

      if (
        certified ||
        identity.getPrincipal().isAnonymous() ||
        isForceCallStrategy()
      ) {
        snsParametersStore.resetProject(rootCanisterId);

        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error__sns.load_parameters",
          })
        );
      }
    },
    logMessage: "Syncing Sns Parameters",
  });
};
