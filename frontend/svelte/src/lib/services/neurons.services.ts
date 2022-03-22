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
import { i18n } from "../stores/i18n";
import { neuronsStore } from "../stores/neurons.store";
import { toastsStore } from "../stores/toasts.store";
import { queryAndUpdate } from "../utils/api.utils";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { errorToString } from "../utils/error.utils";

/**
 * Uses governance api to create a neuron and adds it to the store
 *
 */
export const stakeAndLoadNeuron = async ({
  amount,
  identity,
  fromSubAccount,
}: {
  amount: number;
  identity: Identity | null | undefined;
  fromSubAccount?: SubAccountArray;
}): Promise<NeuronId> => {
  const stake = ICP.fromString(String(amount));

  if (!(stake instanceof ICP)) {
    throw new Error(`Amount ${amount} is not valid`);
  }

  if (stake.toE8s() < E8S_PER_ICP) {
    throw new Error("Need a minimum of 1 ICP to stake a neuron");
  }

  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-348
    throw new Error("No identity");
  }

  const neuronId: NeuronId = await stakeNeuron({
    stake,
    identity,
    fromSubAccount,
  });

  await loadNeuron({
    neuronId,
    identity,
    setNeuron: (neuron: NeuronInfo) => neuronsStore.pushNeurons([neuron]),
  });

  return neuronId;
};

// Gets neurons and adds them to the store
export const listNeurons = async ({
  identity,
}: {
  identity: Identity | null | undefined;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-348
    throw new Error("No identity found listing neurons");
  }

  return queryAndUpdate<NeuronInfo[], unknown>({
    request: ({ certified }) => queryNeurons({ identity, certified }),
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
  identity,
}: {
  neuronId: NeuronId;
  dissolveDelayInSeconds: number;
  identity: Identity | null | undefined;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-348
    throw new Error("No identity");
  }

  await increaseDissolveDelay({ neuronId, dissolveDelayInSeconds, identity });

  await loadNeuron({
    neuronId,
    identity,
    setNeuron: (neuron: NeuronInfo) => neuronsStore.pushNeurons([neuron]),
  });
};

const setFolloweesHelper = async ({
  identity,
  neuronId,
  topic,
  followees,
  errorKey,
}: {
  identity: Identity;
  neuronId: NeuronId;
  topic: Topic;
  followees: NeuronId[];
  errorKey: "add_followee" | "remove_followee";
}) => {
  try {
    await setFollowees({
      identity,
      neuronId,
      topic,
      followees,
    });
    await loadNeuron({
      neuronId,
      identity,
      setNeuron: (neuron: NeuronInfo) => neuronsStore.pushNeurons([neuron]),
    });
  } catch (error) {
    toastsStore.show({
      labelKey: `error.${errorKey}`,
      level: "error",
      detail: `id: "${neuronId}"`,
    });
  }
};

export const addFollowee = async ({
  identity,
  neuronId,
  topic,
  followee,
}: {
  identity: Identity | null | undefined;
  neuronId: NeuronId;
  topic: Topic;
  followee: NeuronId;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-348
    throw new Error("No identity");
  }
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
    identity,
    neuronId,
    topic,
    followees: newFollowees,
    errorKey: "add_followee",
  });
};

export const removeFollowee = async ({
  identity,
  neuronId,
  topic,
  followee,
}: {
  identity: Identity | null | undefined;
  neuronId: NeuronId;
  topic: Topic;
  followee: NeuronId;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-348
    throw new Error("No identity");
  }
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
    identity,
    neuronId,
    topic,
    followees: newFollowees,
    errorKey: "remove_followee",
  });
};

/**
 * Return single neuron from neuronsStore or fetch it (in case of page reload or direct navigation to neuron-detail page)
 */
const getNeuron = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity | null | undefined;
}): Promise<NeuronInfo | undefined> => {
  // TODO: https://dfinity.atlassian.net/browse/L2-348
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  const neuron = get(neuronsStore).find(
    (neuron) => neuron.neuronId === neuronId
  );
  return neuron || queryNeuron({ neuronId, identity });
};

/**
 * Get from store or query a neuron and apply the result to the callback (`setNeuron`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadNeuron = async ({
  neuronId,
  identity,
  setNeuron,
  handleError,
}: {
  neuronId: NeuronId;
  identity: Identity | undefined | null;
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

  try {
    const neuron: NeuronInfo | undefined = await getNeuron({
      neuronId,
      identity,
    });

    if (!neuron) {
      catchError(new Error("Neuron not found"));
      return;
    }

    setNeuron(neuron);
  } catch (error: unknown) {
    catchError(error);
  }
};

export const getNeuronId = (path: string): NeuronId | undefined =>
  getLastPathDetailId(path);
