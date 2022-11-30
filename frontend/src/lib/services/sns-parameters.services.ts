import { nervousSystemParameters } from "$lib/api/sns-governance.api";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import type { Principal } from "@dfinity/principal";
import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
import { queryAndUpdate } from "./utils.services";

export const loadSnsParameters = async ({
  rootCanisterId,
}: {
  rootCanisterId: Principal;
}): Promise<void> => {
  await queryAndUpdate<NervousSystemParameters, unknown>({
    request: ({ certified, identity }) =>
      nervousSystemParameters({
        rootCanisterId,
        identity,
        certified,
      }).then(),
    onLoad: ({ response: parameters, certified }) =>
      snsParametersStore.setParameters({
        rootCanisterId,
        parameters,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // // hide unproven data
      snsParametersStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_parameters",
        })
      );
    },
    logMessage: "Syncing Sns Parameters",
  });
};
