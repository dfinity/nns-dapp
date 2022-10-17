import {
  addNeuronPermissions,
  disburse as disburseApi,
  querySnsNeuron,
  querySnsNeurons,
  removeNeuronPermissions,
} from "$lib/api/sns.api";
import {
  snsNeuronsStore,
  type ProjectNeuronStore,
} from "$lib/stores/sns-neurons.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import { getSnsNeuronByHexId } from "$lib/utils/sns-neuron.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { get } from "svelte/store";
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

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_neurons_load",
        })
      );
    },
    logMessage: "Syncing Sns Neurons",
  });
};

const getSnsNeuronsFromStoreByProject = (
  rootCanisterId: Principal
): ProjectNeuronStore | undefined =>
  get(snsNeuronsStore)[rootCanisterId.toText()];

const getNeuronFromStoreByIdHex = ({
  neuronIdHex,
  rootCanisterId,
}: {
  neuronIdHex: string;
  rootCanisterId: Principal;
}): { neuron?: SnsNeuron; certified: boolean } => {
  const projectData = getSnsNeuronsFromStoreByProject(rootCanisterId);
  const neuron = getSnsNeuronByHexId({
    neuronIdHex,
    neurons: projectData?.neurons,
  });
  return {
    neuron,
    certified: projectData?.certified ?? false,
  };
};

export const getSnsNeuron = async ({
  neuronIdHex,
  rootCanisterId,
  forceFetch = false,
  onLoad,
  onError,
}: {
  neuronIdHex: string;
  rootCanisterId: Principal;
  forceFetch?: boolean;
  onLoad: ({
    certified,
    neuron,
  }: {
    certified: boolean;
    neuron: SnsNeuron;
  }) => void;
  onError?: ({
    certified,
    error,
  }: {
    certified: boolean;
    error: unknown;
  }) => void;
}): Promise<void> => {
  if (!forceFetch) {
    const { neuron, certified } = getNeuronFromStoreByIdHex({
      neuronIdHex,
      rootCanisterId,
    });
    if (neuron !== undefined) {
      onLoad({
        neuron,
        certified,
      });
      return;
    }
  }
  const neuronId = arrayOfNumberToUint8Array(hexStringToBytes(neuronIdHex));
  return queryAndUpdate<SnsNeuron, Error>({
    request: ({ certified, identity }) =>
      querySnsNeuron({
        rootCanisterId,
        identity,
        certified,
        neuronId: { id: neuronId },
      }),
    onLoad: ({ response: neuron, certified }) => {
      onLoad({ neuron, certified });
    },
    onError: ({ certified, error }) => {
      onError?.({ certified, error });
    },
    logMessage: `Getting Sns Neuron ${neuronIdHex}`,
  });
};

// Implement when SNS neurons can be controlled with Hardware wallets
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNeuronIdentity = (): Promise<Identity> => getIdentity();

export const addHotkey = async ({
  neuronId,
  hotkey,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  hotkey: Principal;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const permissions = [
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
    ];
    const identity = await getNeuronIdentity();
    await addNeuronPermissions({
      permissions,
      identity,
      principal: hotkey,
      rootCanisterId,
      neuronId,
    });
    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_add_hotkey",
      err,
    });
    return { success: false };
  }
};

export const removeHotkey = async ({
  neuronId,
  hotkey,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  hotkey: string;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const permissions = [
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
    ];
    const identity = await getNeuronIdentity();
    const principal = Principal.fromText(hotkey);
    await removeNeuronPermissions({
      permissions,
      identity,
      principal,
      rootCanisterId,
      neuronId,
    });
    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_remove_hotkey",
      err,
    });
    return { success: false };
  }
};

export const disburse = async ({
  rootCanisterId,
  neuronId,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();

    await disburseApi({
      rootCanisterId,
      identity,
      neuronId,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_disburse",
      err,
    });
    return { success: false };
  }
};
