import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import { assertNonNullish } from "$tests/utils/utils.test-utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type {
  NervousSystemParameters,
  SnsListProposalsParams,
  SnsNervousSystemFunction,
  SnsNeuronId,
  SnsProposalData,
  SnsProposalId,
} from "@dfinity/sns";
import {
  neuronSubaccount,
  SnsGovernanceError,
  type SnsNeuron,
} from "@dfinity/sns";
import { fromNullable, isNullish } from "@dfinity/utils";

const modulePath = "$lib/api/sns-governance.api";

const implementedFunctions = {
  querySnsNeurons,
  getSnsNeuron,
  nervousSystemParameters,
  getNervousSystemFunctions,
  getNeuronBalance,
  refreshNeuron,
  claimNeuron,
  queryProposals,
  queryProposal,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

// Maps a key representing identity + rootCanisterId (`mapKey` function) to a list of neurons
const neurons: Map<string, SnsNeuron[]> = new Map();
// Maps a key representing identity + rootCanisterId (`mapKey` function) to a list of proposals
const proposals: Map<string, SnsProposalData[]> = new Map();
// Maps a key representing rootCanisterId to a list of nervous system functions
const nervousFunctions: Map<string, SnsNervousSystemFunction[]> = new Map();

// When the fake is paused, all calls to the fake will be queued until the fake
// is resumed.
let isPaused = false;
const pendingCalls: (() => void)[] = [];

type KeyParams = { identity: Identity; rootCanisterId: Principal };

const mapKey = ({ identity, rootCanisterId }: KeyParams) =>
  JSON.stringify([identity.getPrincipal().toText(), rootCanisterId.toText()]);

const getNeurons = (keyParams: KeyParams) => {
  const key = mapKey(keyParams);
  let neuronList = neurons.get(key);
  if (isNullish(neuronList)) {
    neuronList = [];
    neurons.set(key, neuronList);
  }
  return neuronList;
};

const snsNeuronIdToHexString = (id: SnsNeuronId): string =>
  getSnsNeuronIdAsHexString({ ...mockSnsNeuron, id: [id] });

const getNeuron = ({
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): SnsNeuron | undefined => {
  const neuronIdText = snsNeuronIdToHexString(neuronId);
  return getNeurons(keyParams).find(
    (neuron) => getSnsNeuronIdAsHexString(neuron) === neuronIdText
  );
};

const getProposals = (keyParams: KeyParams) => {
  const key = mapKey(keyParams);
  let proposalsList = proposals.get(key);
  if (isNullish(proposalsList)) {
    proposalsList = [];
    proposals.set(key, proposalsList);
  }
  return proposalsList;
};

const getNervousFunctions = (rootCanisterId: Principal) => {
  const key = rootCanisterId.toText();
  let nervousFunctionsList = nervousFunctions.get(key);
  if (isNullish(nervousFunctionsList)) {
    nervousFunctionsList = [];
    nervousFunctions.set(key, nervousFunctionsList);
  }
  return nervousFunctionsList;
};

/**
 * Calls the passed function and returns its result.
 * If the fake is paused, the function will be queued and an unresolved promise
 * is returned which will resolve when the fake is resumed and the function
 * called.
 */
const wrapMaybePaused = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!isPaused) {
    return fn();
  }
  let resolve: (value: Promise<T>) => void;
  const responsePromise = new Promise<T>((res) => {
    resolve = res;
  });
  pendingCalls.push(() => {
    resolve(fn());
  });
  return responsePromise;
};

////////////////////////
// Fake implementations:
////////////////////////

function nervousSystemParameters({
  rootCanisterId: _,
  identity: __,
  certified: ___,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<NervousSystemParameters> {
  return wrapMaybePaused(async () => {
    return snsNervousSystemParametersMock;
  });
}

function getNervousSystemFunctions({
  rootCanisterId,
  identity: _,
  certified: __,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<SnsNervousSystemFunction[]> {
  return wrapMaybePaused(async () => {
    return nervousFunctions.get(rootCanisterId.toText()) || [];
  });
}

function getNeuronBalance({
  neuronId,
  rootCanisterId,
  certified,
  identity,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  certified: boolean;
  identity: Identity;
}): Promise<bigint> {
  return wrapMaybePaused(async () => {
    const neuron = await querySnsNeuron({
      neuronId,
      rootCanisterId,
      certified,
      identity,
    });
    if (neuron) {
      // In reality the neuron balance can be different from the stake if
      // the user has made a transaction to increase the stake and the
      // neuron is not yet refreshed. But this is not yet implemented in
      // the fake.
      return neuron.cached_neuron_stake_e8s;
    }
    return BigInt(0);
  });
}

function refreshNeuron(params: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsNeuronId;
}): Promise<void> {
  return wrapMaybePaused(async () => {
    assertNonNullish(getNeuron(params));
  });
}

function claimNeuron({
  rootCanisterId: _1,
  identity: _2,
  memo: _3,
  controller: _4,
  subaccount,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  memo: bigint;
  controller: Principal;
  subaccount: Uint8Array;
}): Promise<SnsNeuronId> {
  return wrapMaybePaused(async () => {
    return { id: subaccount };
  });
}

function querySnsNeurons({
  identity,
  rootCanisterId,
  certified: _,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsNeuron[]> {
  return wrapMaybePaused(async () => {
    return neurons.get(mapKey({ identity, rootCanisterId })) || [];
  });
}

function querySnsNeuron({
  certified: _,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron | undefined> {
  return wrapMaybePaused(async () => {
    return getNeuron({ ...keyParams, neuronId });
  });
}

function getSnsNeuron({
  certified: _,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron> {
  return wrapMaybePaused(async () => {
    const neuron = getNeuron({ ...keyParams, neuronId });
    if (isNullish(neuron)) {
      throw new SnsGovernanceError("No neuron for given NeuronId.");
    }
    return neuron;
  });
}

function queryProposals({
  identity,
  rootCanisterId,
  certified: _,
  params: __,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  params: SnsListProposalsParams;
}): Promise<SnsProposalData[]> {
  return wrapMaybePaused(async () => {
    return proposals.get(mapKey({ identity, rootCanisterId })) || [];
  });
}

/**
 * Throws if no proposal is found for the given proposalId.
 */
function queryProposal({
  identity,
  rootCanisterId,
  certified: _,
  proposalId,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  proposalId: SnsProposalId;
}): Promise<SnsProposalData> {
  return wrapMaybePaused(async () => {
    const proposal = proposals
      .get(mapKey({ identity, rootCanisterId }))
      .find(({ id }) => fromNullable(id).id === proposalId.id);
    if (isNullish(proposal)) {
      throw new SnsGovernanceError(
        `No proposal for given proposalId ${proposalId.id}`
      );
    }
    return proposal;
  });
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  neurons.clear();
  proposals.clear();
  nervousFunctions.clear();
  pendingCalls.length = 0;
  isPaused = false;
};

export const pause = () => {
  if (isPaused) {
    throw new Error("The fake was already paused");
  }
  isPaused = true;
};

export const resume = () => {
  if (!isPaused) {
    throw new Error("The fake wasn't paused.");
  }
  for (const call of pendingCalls) {
    call();
  }
  pendingCalls.length = 0;
  isPaused = false;
};

const createNeuronId = ({
  identity,
  index,
}: {
  identity: Identity;
  index: number;
}): SnsNeuronId => {
  const controller = identity.getPrincipal();
  const subaccount = neuronSubaccount({
    controller,
    index,
  });
  return { id: subaccount };
};

// This follows the same logic to determine neuron IDs as the real code because
// the real code will look for neurons with these IDs without even knowing if
// they exist.
export const addNeuronWith = ({
  identity = mockIdentity,
  rootCanisterId,
  ...neuronParams
}: {
  identity?: Identity;
  rootCanisterId: Principal;
} & Partial<SnsNeuron>): SnsNeuron => {
  const neurons = getNeurons({ identity, rootCanisterId });
  const index = neurons.length;
  const defaultNeuronId = createNeuronId({ identity, index });
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    id: [defaultNeuronId],
    ...neuronParams,
  };
  neurons.push(neuron);
  return neuron;
};

export const addProposalWith = ({
  identity = mockIdentity,
  rootCanisterId,
  ...proposalParams
}: {
  identity?: Identity;
  rootCanisterId: Principal;
} & Partial<SnsProposalData>): SnsProposalData => {
  const proposalsList = getProposals({ identity, rootCanisterId });
  const index = proposalsList.length;
  const defaultProposalId = { id: BigInt(index + 1) };
  const proposal: SnsProposalData = {
    ...mockSnsProposal,
    id: [defaultProposalId],
    ...proposalParams,
  };
  proposalsList.push(proposal);
  return proposal;
};

export const addNervousSystemFunctionWith = ({
  rootCanisterId,
  ...functionParams
}: {
  rootCanisterId: Principal;
} & Partial<SnsNervousSystemFunction>): SnsNervousSystemFunction => {
  const nervousFunctions = getNervousFunctions(rootCanisterId);
  const index = nervousFunctions.length;
  const defaultFunctionId = BigInt(index + 1);
  const nervousFunction: SnsNervousSystemFunction = {
    ...nervousSystemFunctionMock,
    id: defaultFunctionId,
    ...functionParams,
  };
  nervousFunctions.push(nervousFunction);
  return nervousFunction;
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
