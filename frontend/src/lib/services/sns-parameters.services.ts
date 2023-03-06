import { nervousSystemParameters } from "$lib/api/sns-governance.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/environment.constants";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import type { Principal } from "@dfinity/principal";
import type { NervousSystemParameters } from "@dfinity/sns";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

export const loadSnsParameters = async (
  rootCanisterId: Principal
): Promise<void> => {
  const storeData = get(snsParametersStore);
  // Do not load if already loaded and certified
  if (storeData[rootCanisterId.toText()]?.certified === true) {
    return;
  }
  await queryAndUpdate<NervousSystemParameters, unknown>({
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
        FORCE_CALL_STRATEGY === "query"
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
