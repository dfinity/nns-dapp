import type { Identity } from "@dfinity/agent";
import { ICP, NeuronId, NeuronInfo } from "@dfinity/nns";
import {
  getNeuron,
  increaseDissolveDelay,
  queryNeurons,
  stakeNeuron,
} from "../api/neurons.api";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { neuronsStore } from "../stores/neurons.store";

/**
 * Uses governance and ledger canisters to create a neuron and adds it to the store
 *
 * TODO: L2-322 Create neurons from subaccount
 */
export const stakeAndLoadNeuron = async ({
  amount,
  identity,
}: {
  amount: number;
  identity: Identity | null | undefined;
}): Promise<NeuronId> => {
  const stake = ICP.fromString(String(amount));

  if (!(stake instanceof ICP)) {
    throw new Error(`Amount ${amount} is not valid`);
  }

  if (stake.toE8s() < E8S_PER_ICP) {
    throw new Error("Need a minimum of 1 ICP to stake a neuron");
  }

  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity");
  }

  const neuronId: NeuronId = await stakeNeuron({ stake, identity });

  await loadNeuron({ neuronId, identity });

  return neuronId;
};

// Gets neurons and adds them to the store
export const listNeurons = async ({
  identity,
}: {
  identity: Identity | null | undefined;
}): Promise<void> => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity found listing neurons");
  }

  const neurons: NeuronInfo[] = await queryNeurons({ identity });
  neuronsStore.setNeurons(neurons);
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
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity found listing neurons");
  }

  await increaseDissolveDelay({ neuronId, dissolveDelayInSeconds, identity });

  await loadNeuron({ neuronId, identity });
};

const loadNeuron = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  const neuron: NeuronInfo | undefined = await getNeuron({
    neuronId,
    identity,
  });

  // TODO: Manage errors and edge cases: https://dfinity.atlassian.net/browse/L2-329
  if (!neuron) {
    return;
  }

  neuronsStore.pushNeurons([neuron]);
};
