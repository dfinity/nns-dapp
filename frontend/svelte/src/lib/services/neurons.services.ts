import type { Identity } from "@dfinity/agent";
import type { Followees, NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
import { ICP } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  increaseDissolveDelay,
  queryNeuron,
  queryNeurons,
  setFollowees,
  stakeNeuron,
} from "../api/governance.api";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { neuronsStore } from "../stores/neurons.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { errorToString } from "../utils/error.utils";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

/**
 * Uses governance api to create a neuron and adds it to the store
 *
 */
export const stakeAndLoadNeuron = async ({
  amount,
  fromSubAccount,
}: {
  amount: number;
  fromSubAccount?: SubAccountArray;
}): Promise<NeuronId> => {
  const stake = ICP.fromString(String(amount));

  if (!(stake instanceof ICP)) {
    throw new Error(`Amount ${amount} is not valid`);
  }

  if (stake.toE8s() < E8S_PER_ICP) {
    throw new Error("Need a minimum of 1 ICP to stake a neuron");
  }

  const identity: Identity = await getIdentity();

  const neuronId: NeuronId = await stakeNeuron({
    stake,
    identity,
    fromSubAccount,
  });

  await loadNeuron({
    neuronId,
    setNeuron: (neuron: NeuronInfo) => neuronsStore.pushNeurons([neuron]),
  });

  return neuronId;
};

// Gets neurons and adds them to the store
export const listNeurons = async (): Promise<void> => {
  return queryAndUpdate<NeuronInfo[], unknown>({
    request: (options) => queryNeurons(options),
    onLoad: ({ response: neurons }) => neuronsStore.setNeurons(neurons),
    onError: ({ error, certified }) => {
      console.error(error);

      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      neuronsStore.setNeurons([]);

      toastsStore.show({
        labelKey: "error.get_neurons",
        level: "error",
        detail: errorToString(error),
      });
    },
  });
};

export const updateDelay = async ({
  neuronId,
  dissolveDelayInSeconds,
}: {
  neuronId: NeuronId;
  dissolveDelayInSeconds: number;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  await increaseDissolveDelay({ neuronId, dissolveDelayInSeconds, identity });

  await loadNeuron({
    neuronId,
    setNeuron: (neuron: NeuronInfo) => neuronsStore.pushNeurons([neuron]),
  });
};

const setFolloweesHelper = async ({
  neuronId,
  topic,
  followees,
  labelKey,
}: {
  neuronId: NeuronId;
  topic: Topic;
  followees: NeuronId[];
  labelKey: "add_followee" | "remove_followee";
}) => {
  const identity: Identity = await getIdentity();

  try {
    await setFollowees({
      identity,
      neuronId,
      topic,
      followees,
    });
    const neuron: NeuronInfo | undefined = await getNeuron({
      neuronId,
      identity,
      certified: true,
      noCache: true,
    });

    if (!neuron) {
      throw new Error("Neuron not found");
    }
    neuronsStore.pushNeurons([neuron]);

    toastsStore.show({
      labelKey: `new_followee.success_${labelKey}`,
      level: "info",
    });
  } catch (err) {
    toastsStore.error({
      labelKey: `error.${labelKey}`,
      err,
    });
  }
};

export const addFollowee = async ({
  neuronId,
  topic,
  followee,
}: {
  neuronId: NeuronId;
  topic: Topic;
  followee: NeuronId;
}): Promise<void> => {
  const neurons = get(neuronsStore);
  const neuron = neurons.find(
    ({ neuronId: currentNeuronId }) => currentNeuronId === neuronId
  );
  const topicFollowees = neuron?.fullNeuron?.followees.find(
    ({ topic: currentTopic }) => currentTopic === topic
  );
  const newFollowees: NeuronId[] =
    topicFollowees === undefined
      ? [followee]
      : [...topicFollowees.followees, followee];

  await setFolloweesHelper({
    neuronId,
    topic,
    followees: newFollowees,
    labelKey: "add_followee",
  });
};

export const removeFollowee = async ({
  neuronId,
  topic,
  followee,
}: {
  neuronId: NeuronId;
  topic: Topic;
  followee: NeuronId;
}): Promise<void> => {
  const neurons = get(neuronsStore);
  const neuron = neurons.find(
    ({ neuronId: currentNeuronId }) => currentNeuronId === neuronId
  );
  const topicFollowees: Followees | undefined =
    neuron?.fullNeuron?.followees.find(
      ({ topic: currentTopic }) => currentTopic === topic
    );
  if (topicFollowees === undefined) {
    // Followee in that topic already does not exist.
    toastsStore.show({
      labelKey: "error.followee_does_not_exist",
      level: "warn",
      detail: `id: "${neuronId}"`,
    });
    return;
  }
  const newFollowees: NeuronId[] = topicFollowees.followees.filter(
    (id) => id !== followee
  );
  await setFolloweesHelper({
    neuronId,
    topic,
    followees: newFollowees,
    labelKey: "remove_followee",
  });
};

/**
 * Return single neuron from neuronsStore or fetch it (in case of page reload or direct navigation to neuron-detail page)
 */
const getNeuron = async ({
  neuronId,
  identity,
  certified,
  noCache = false,
}: {
  neuronId: NeuronId;
  identity: Identity;
  certified: boolean;
  noCache?: boolean;
}): Promise<NeuronInfo | undefined> => {
  if (noCache) {
    return queryNeuron({ neuronId, identity, certified });
  }
  const neuron = get(neuronsStore).find(
    (neuron) => neuron.neuronId === neuronId
  );
  return neuron || queryNeuron({ neuronId, identity, certified });
};

/**
 * Get from store or query a neuron and apply the result to the callback (`setNeuron`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadNeuron = ({
  neuronId,
  setNeuron,
  handleError,
}: {
  neuronId: NeuronId;
  setNeuron: (neuron: NeuronInfo) => void;
  handleError?: () => void;
}): Promise<void> => {
  const catchError = (error: unknown) => {
    console.error(error);

    toastsStore.show({
      labelKey: "error.neuron_not_found",
      level: "error",
      detail: `id: "${neuronId}"`,
    });

    handleError?.();
  };

  return queryAndUpdate<NeuronInfo | undefined, unknown>({
    request: (options) =>
      getNeuron({
        neuronId,
        ...options,
      }),
    onLoad: ({ response: neuron }) => {
      if (neuron === undefined) {
        catchError(new Error("Neuron not found"));
        return;
      }

      setNeuron(neuron);
    },
    onError: ({ error, certified }) => {
      console.error(error);

      if (certified !== true) {
        return;
      }
      catchError(error);
    },
  });
};

export const getNeuronId = (path: string): NeuronId | undefined =>
  getLastPathDetailId(path);
