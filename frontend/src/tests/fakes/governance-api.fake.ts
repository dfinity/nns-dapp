import type {
  ApiManageNeuronParams,
  ApiMergeNeuronsParams,
  ApiQueryParams,
} from "$lib/api/governance.api";
import { queryAccountBalance } from "$lib/api/icp-ledger.api";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import {
  installImplAndBlockRest,
  makePausable,
} from "$tests/utils/module.test-utils";
import { AnonymousIdentity, type Identity } from "@dfinity/agent";
import type {
  KnownNeuron,
  NeuronId,
  NeuronInfo,
  RewardEvent,
} from "@dfinity/nns";
import { NeuronState, NeuronType } from "@dfinity/nns";
import { isNullish, nonNullish } from "@dfinity/utils";

const modulePath = "$lib/api/governance.api";
const fakeFunctions = {
  queryNeurons,
  queryNeuron,
  queryKnownNeurons,
  queryLastestRewardEvent,
  claimOrRefreshNeuron,
  startDissolving,
  mergeNeurons,
  simulateMergeNeurons,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

// Maps a text principal of an identity to a list of neurons for that identity.
const neurons: Map<string, NeuronInfo[]> = new Map();

const mapKey = (identity: Identity) => identity.getPrincipal().toText();

let latestRewardEvent: RewardEvent = mockRewardEvent;

const getNeurons = (identity: Identity) => {
  const key = mapKey(identity);
  let neuronList = neurons.get(key);
  if (isNullish(neuronList)) {
    neuronList = [];
    neurons.set(key, neuronList);
  }
  return neuronList;
};

const getNeuron = ({
  identity,
  neuronId,
}: {
  identity: Identity;
  neuronId: bigint;
}): NeuronInfo | undefined => {
  const neurons = getNeurons(identity);
  return neurons.find((n) => n.neuronId === neuronId);
};

////////////////////////
// Fake implementations:
////////////////////////

async function queryNeurons({
  identity,
  certified: _,
}: ApiQueryParams): Promise<NeuronInfo[]> {
  return getNeurons(identity);
}

async function queryNeuron({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<NeuronInfo> {
  return getNeuron({ identity, neuronId });
}

async function queryKnownNeurons({
  identity: _,
  certified: __,
}: ApiQueryParams): Promise<KnownNeuron[]> {
  return [];
}

async function queryLastestRewardEvent({
  identity: _,
  certified: __,
}: ApiQueryParams): Promise<RewardEvent> {
  return latestRewardEvent;
}

async function claimOrRefreshNeuron({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<NeuronId | undefined> {
  const neuron = getNeuron({ identity, neuronId });
  if (isNullish(neuron)) {
    return undefined;
  }
  const neuronAccountBalance = await queryAccountBalance({
    icpAccountIdentifier: neuron?.fullNeuron.accountIdentifier,
    identity: new AnonymousIdentity(),
    certified: false,
  });
  neuron.fullNeuron.cachedNeuronStake = neuronAccountBalance;
  return neuronId;
}

async function startDissolving({
  neuronId,
  identity,
}: ApiManageNeuronParams): Promise<void> {
  const neuron = getNeuron({ identity, neuronId });
  neuron.state = NeuronState.Dissolving;
}

async function mergeNeurons({
  sourceNeuronId,
  targetNeuronId,
  identity,
}: ApiMergeNeuronsParams): Promise<void> {
  const sourceNeuron = getNeuron({ identity, neuronId: sourceNeuronId });
  const targetNeuron = getNeuron({ identity, neuronId: targetNeuronId });
  if (
    sourceNeuron.state !== NeuronState.Locked ||
    targetNeuron.state !== NeuronState.Locked
  ) {
    throw new Error("Only locked neurons can be merged");
  }
  // This is extremely simplified, just good enough for the test to see that the
  // merge happened.
  targetNeuron.fullNeuron.cachedNeuronStake +=
    sourceNeuron.fullNeuron.cachedNeuronStake;
  sourceNeuron.fullNeuron.cachedNeuronStake = 0n;
}

async function simulateMergeNeurons({
  sourceNeuronId,
  targetNeuronId,
  identity,
}: ApiMergeNeuronsParams): Promise<NeuronInfo> {
  const sourceNeuron = getNeuron({ identity, neuronId: sourceNeuronId });
  const targetNeuron = getNeuron({ identity, neuronId: targetNeuronId });
  if (
    sourceNeuron.state !== NeuronState.Locked ||
    targetNeuron.state !== NeuronState.Locked
  ) {
    throw new Error("Only locked neurons can be merged");
  }
  // This is extremely simplified, just good enough for the test to see that the
  // correct merge was simulated.
  const mergedStake =
    sourceNeuron.fullNeuron.cachedNeuronStake +
    targetNeuron.fullNeuron.cachedNeuronStake;
  return {
    ...targetNeuron,
    fullNeuron: {
      ...targetNeuron.fullNeuron,
      cachedNeuronStake: mergedStake,
    },
  };
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

export type FakeNeuronParams = {
  neuronId?: bigint;
  neuronType?: NeuronType;
  controller?: string;
  stake?: bigint;
};

const {
  pause,
  resume,
  reset: resetPaused,
  pausableFunctions: implementedFunctions,
} = makePausable(fakeFunctions);

const reset = () => {
  neurons.clear();
  resetPaused();
};

export { getNeuron, pause, resume };

export const addNeuronWith = ({
  identity = mockIdentity,
  neuronId,
  neuronType,
  controller,
  stake,
  votingPowerRefreshedTimestampSeconds = nowInSeconds(),
}: {
  identity?: Identity;
  votingPowerRefreshedTimestampSeconds?: bigint | number;
} & Partial<FakeNeuronParams>): NeuronInfo => {
  const neuron = { ...mockNeuron, fullNeuron: { ...mockNeuron.fullNeuron } };
  if (neuronId) {
    neuron.neuronId = neuronId;
    neuron.fullNeuron.id = neuronId;
  }
  if (neuronType) {
    neuron.neuronType = neuronType;
    neuron.fullNeuron.neuronType = neuronType;
  }
  if (stake) {
    neuron.fullNeuron.cachedNeuronStake = stake;
  }
  if (controller) {
    neuron.fullNeuron.controller = controller;
  }
  if (nonNullish(votingPowerRefreshedTimestampSeconds)) {
    neuron.fullNeuron.votingPowerRefreshedTimestampSeconds = BigInt(
      votingPowerRefreshedTimestampSeconds
    );
  }
  if (nonNullish(getNeuron({ identity, neuronId: neuron.neuronId }))) {
    throw new Error(`A neuron with id ${neuron.neuronId} already exists`);
  }
  getNeurons(identity).push(neuron);

  return { ...neuron };
};

export const addNeurons = ({
  identity = mockIdentity,
  neurons,
}: {
  identity?: Identity;
  neurons: FakeNeuronParams[];
}) => {
  for (const neuron of neurons) {
    addNeuronWith({ identity, ...neuron });
  }
};

export const setLatestRewardEvent = (
  latestRewardEventParams: Partial<RewardEvent>
) => {
  latestRewardEvent = { ...latestRewardEvent, ...latestRewardEventParams };
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const install = () => {
  beforeEach(() => {
    reset();
  });
  installImplAndBlockRest({
    modulePath,
    implementedFunctions,
  });
};
