import type { Identity } from "@dfinity/agent";
import type {
  Followees,
  Neuron,
  NeuronId,
  NeuronInfo,
  Topic,
} from "@dfinity/nns";
import { ICP } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  claimOrRefreshNeuron,
  increaseDissolveDelay,
  queryNeuron,
  queryNeurons,
  setFollowees,
  stakeNeuron,
} from "../api/governance.api";
import { getNeuronBalance } from "../api/ledger.api";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { neuronsStore } from "../stores/neurons.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { createChunks, isDefined } from "../utils/utils";
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

// This gets all neurons linked to the current user's principal, even those with a stake of 0.
// And adds them to the store
export const listNeurons = async ({
  skipCheck = false,
}: { skipCheck?: boolean } = {}): Promise<void> => {
  return queryAndUpdate<NeuronInfo[], unknown>({
    request: ({ certified, identity }) => queryNeurons({ certified, identity }),
    onLoad: async ({ response: neurons, certified }) => {
      neuronsStore.setNeurons(neurons);
      if (!certified || skipCheck) {
        return;
      }
      // Query the ledger for each neuron
      // refresh those whose stake does not match their ledger balance.
      try {
        await checkNeuronBalances(neurons);
      } catch (error) {
        // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-424
        console.error(error);
      }
    },
    onError: ({ error, certified }) => {
      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      neuronsStore.setNeurons([]);

      toastsStore.error({
        labelKey: "error.get_neurons",
        err: error,
      });
    },
  });
};

const balanceMatchesStake = ({
  balance,
  fullNeuron,
}: {
  balance: ICP;
  fullNeuron: Neuron;
}): boolean => balance.toE8s() === fullNeuron.cachedNeuronStake;

const balanceIsMoreThanOne = ({ balance }: { balance: ICP }): boolean =>
  balance.toE8s() > E8S_PER_ICP;

const findNeuronsStakeNotBalance = async ({
  neurons,
  identity,
}: {
  neurons: Neuron[];
  identity: Identity;
}): Promise<NeuronId[]> =>
  (
    await Promise.all(
      neurons.map(
        async (fullNeuron): Promise<{ balance: ICP; fullNeuron: Neuron }> => ({
          balance: await getNeuronBalance({ neuron: fullNeuron, identity }),
          fullNeuron,
        })
      )
    )
  )
    .filter((params) => !balanceMatchesStake(params))
    // We can only refresh a neuron if its balance is at least 1 ICP
    .filter(balanceIsMoreThanOne)
    .map(({ fullNeuron }) => fullNeuron.id)
    .filter(isDefined);

const claimNeurons =
  (identity: Identity) =>
  (neuronIds: NeuronId[]): Promise<Array<NeuronId | undefined>> =>
    Promise.all(
      neuronIds.map((neuronId) => claimOrRefreshNeuron({ identity, neuronId }))
    );

const checkNeuronBalances = async (neurons: NeuronInfo[]): Promise<void> => {
  const identity = await getIdentity();
  const neuronIdsToRefresh: NeuronId[] = await findNeuronsStakeNotBalance({
    neurons: neurons.map(({ fullNeuron }) => fullNeuron).filter(isDefined),
    identity,
  });
  if (neuronIdsToRefresh.length === 0) {
    return;
  }
  console.log("refreshing");
  // We found neurons that need to be refreshed.
  const neuronIdsChunks: NeuronId[][] = createChunks(neuronIdsToRefresh, 10);
  await Promise.all(neuronIdsChunks.map(claimNeurons(identity)));
  return listNeurons({ skipCheck: true });
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
      forceFetch: true,
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
    toastsStore.error({
      labelKey: "error.followee_does_not_exist",
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
  forceFetch = false,
}: {
  neuronId: NeuronId;
  identity: Identity;
  certified: boolean;
  forceFetch?: boolean;
}): Promise<NeuronInfo | undefined> => {
  if (forceFetch) {
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
  const catchError = (err: unknown) => {
    toastsStore.error({
      labelKey: "error.neuron_not_found",
      err,
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
