import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { get } from "svelte/store";
import { querySnsNeuron, querySnsNeurons } from "../api/sns.api";
import {
  snsNeuronsStore,
  type ProjectNeuronStore,
} from "../stores/sns-neurons.store";
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
}): { neuron?: SnsNeuron; certified?: boolean } => {
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
  onLoad,
  onError,
}: {
  neuronIdHex: string;
  rootCanisterId: Principal;
  onLoad: ({ certified: boolean, neuron: SnsNeuron }) => void;
  onError?: ({ certified, error }) => void;
}): Promise<void> => {
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
  const neuronId = hexStringToBytes(neuronIdHex);
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
