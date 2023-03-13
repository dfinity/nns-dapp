import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import { assertNonNullish } from "$tests/utils/utils.test-utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type {
  NervousSystemParameters,
  SnsNervousSystemFunction,
  SnsNeuronId,
} from "@dfinity/sns";
import {
  neuronSubaccount,
  SnsGovernanceError,
  type SnsNeuron,
} from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";

const modulePath = "$lib/api/sns-governance.api";

const implementedFunctions = {
  nervousSystemParameters,
  getNervousSystemFunctions,
  getNeuronBalance,
  refreshNeuron,
  claimNeuron,
};

const snsApiPath = "$lib/api/sns.api";
const snsApiImpl = {
  // TODO: Move these functions to sns-governance.api.
  querySnsNeurons,
  getSnsNeuron,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

const neurons: Map<string, SnsNeuron[]> = new Map();

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

////////////////////////
// Fake implementations:
////////////////////////

async function nervousSystemParameters({
  rootCanisterId: _,
  identity: __,
  certified: ___,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<NervousSystemParameters> {
  return snsNervousSystemParametersMock;
}

async function getNervousSystemFunctions({
  rootCanisterId: _,
  identity: __,
  certified: ___,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<SnsNervousSystemFunction[]> {
  return [];
}

async function getNeuronBalance({
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
}

async function refreshNeuron(params: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsNeuronId;
}): Promise<void> {
  assertNonNullish(getNeuron(params));
}

async function claimNeuron({
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
  return { id: subaccount };
}

async function querySnsNeurons({
  identity,
  rootCanisterId,
  certified: _,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsNeuron[]> {
  return neurons.get(mapKey({ identity, rootCanisterId })) || [];
}

async function querySnsNeuron({
  certified: _,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron | undefined> {
  return getNeuron({ ...keyParams, neuronId });
}

async function getSnsNeuron({
  certified: _,
  neuronId,
  ...keyParams
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron> {
  const neuron = getNeuron({ ...keyParams, neuronId });
  if (isNullish(neuron)) {
    throw new SnsGovernanceError("No neuron for given NeuronId.");
  }
  return neuron;
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  neurons.clear();
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
  installImplAndBlockRest({
    modulePath: snsApiPath,
    implementedFunctions: snsApiImpl,
  });
};
