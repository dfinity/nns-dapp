import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import { addNeuronPermissions, querySnsNeurons } from "../api/sns.api";
import { snsNeuronsStore } from "../stores/sns-neurons.store";
import { toastsStore } from "../stores/toasts.store";
import { toToastError } from "../utils/error.utils";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsNeurons = async (
  rootCanisterId: Principal
): Promise<void> => {
  return queryAndUpdate<SnsNeuron[], unknown>({
    request: ({ certified, identity }) =>
      querySnsNeurons({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: neurons, certified }) => {
      snsNeuronsStore.setNeurons({
        rootCanisterId,
        neurons,
        certified,
      });
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsNeuronsStore.resetProject(rootCanisterId);

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_neurons_load",
        })
      );
    },
    logMessage: "Syncing Sns Neurons",
  });
};

// Implement when SNS neurons can be controlled with Hardware wallets
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNeuronIdentity = (neuronId: SnsNeuronId): Promise<Identity> =>
  getIdentity();

export const addHotkey = async ({
  neuronId,
  hotkey,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  hotkey: string;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const permissions = [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE];
    const identity = await getNeuronIdentity(neuronId);
    const principal = await Principal.fromText(hotkey);
    await addNeuronPermissions({
      permissions,
      identity,
      principal,
      rootCanisterId,
      neuronId,
    });
    return { success: true };
  } catch (err) {
    toastsStore.error({
      labelKey: "error__sns.sns_add_hotkey",
      err,
    });
    return { success: false };
  }
};
