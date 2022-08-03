import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { get } from "svelte/store";
import { querySnsNeuron, querySnsNeurons } from "../api/sns.api";
import { snsNeuronsStore } from "../stores/sns-neurons.store";
import { toastsStore } from "../stores/toasts.store";
import { toToastError } from "../utils/error.utils";
import { getSnsNeuronByHexId } from "../utils/sns-neuron.utils";
import { hexStringToBytes } from "../utils/utils";
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

export const getSnsNeuron = async ({
  neuronIdHex,
  rootCanisterId,
  onLoad,
  onError,
}: {
  neuronIdHex: string;
  rootCanisterId: Principal;
  onLoad: ({ certified: boolean, neuron: SnsNeuron }) => void;
  onError?: ({ certified, error }) => void;
}): Promise<void> => {
  const store = get(snsNeuronsStore);
  const neuronFromStore = getSnsNeuronByHexId({
    neuronIdHex,
    neurons: store[rootCanisterId.toText()]?.neurons,
  });
  if (neuronFromStore !== undefined) {
    onLoad({
      neuron: neuronFromStore,
      certified: store[rootCanisterId.toText()]?.certified,
    });
    return;
  }
  const neuronId = hexStringToBytes(neuronIdHex);
  queryAndUpdate<SnsNeuron, Error>({
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
